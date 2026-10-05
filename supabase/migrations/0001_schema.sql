-- Shop House Giarre — schema v1
-- Prezzi in centesimi (integer), IVA inclusa.

create extension if not exists pg_trgm;
create extension if not exists unaccent;

-- ───────────── Enum ─────────────
create type user_role as enum ('customer', 'staff', 'admin');
create type product_status as enum ('draft', 'published');
create type order_status as enum ('pending', 'paid', 'processing', 'shipped', 'ready_for_pickup', 'delivered', 'cancelled', 'refunded');
create type delivery_method as enum ('shipping', 'pickup');
create type coupon_type as enum ('percent', 'fixed');

-- ───────────── Tabelle ─────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  cognome text,
  telefono text,
  ruolo user_role not null default 'customer',
  newsletter_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  via text not null,
  civico text not null,
  cap text not null,
  citta text not null,
  provincia text not null,
  telefono text,
  predefinito boolean not null default false
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references categories(id) on delete set null,
  nome text not null,
  slug text not null unique,
  immagine text,
  ordine int not null default 0
);

create table brands (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  logo text,
  descrizione text
);

create table products (
  id uuid primary key default gen_random_uuid(),
  titolo text not null,
  slug text not null unique,
  brand_id uuid references brands(id) on delete set null,
  category_id uuid references categories(id) on delete set null,
  descrizione text,
  punti_chiave text[] not null default '{}',
  materiale text,
  cura text,
  stato product_status not null default 'draft',
  in_evidenza boolean not null default false,
  seo_title text,
  seo_description text,
  search_vector tsvector,
  created_at timestamptz not null default now()
);
create index products_search_idx on products using gin (search_vector);
create index products_titolo_trgm on products using gin (titolo gin_trgm_ops);
create index products_category_idx on products (category_id);
create index products_brand_idx on products (brand_id);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text not null unique,
  misura text,
  colore text,
  taglia text,
  prezzo int not null check (prezzo >= 0),
  prezzo_barrato int check (prezzo_barrato is null or prezzo_barrato > prezzo),
  stock int not null default 0 check (stock >= 0),
  peso_g int,
  ean text
);
create index variants_product_idx on product_variants (product_id);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  url text not null,
  alt text not null default '',
  ordine int not null default 0
);

create table carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz not null default now()
);
create table cart_items (
  cart_id uuid not null references carts(user_id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  quantita int not null check (quantita > 0),
  primary key (cart_id, variant_id)
);

create table wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  primary key (user_id, product_id)
);

create sequence order_number_seq;
create table orders (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique default ('SH-' || extract(year from now())::int || '-' || lpad(nextval('order_number_seq')::text, 5, '0')),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  stato order_status not null default 'pending',
  metodo_consegna delivery_method not null,
  indirizzo jsonb,
  subtotale int not null,
  spedizione int not null default 0,
  sconto int not null default 0,
  totale int not null,
  coupon_code text,
  stripe_session_id text unique,
  tracking text,
  note text,
  stock_scalato boolean not null default false,
  created_at timestamptz not null default now()
);
create index orders_user_idx on orders (user_id);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  variant_id uuid references product_variants(id) on delete set null,
  titolo text not null,
  prezzo int not null,
  quantita int not null check (quantita > 0)
);

create table coupons (
  codice text primary key,
  tipo coupon_type not null,
  valore int not null check (valore > 0),
  minimo_ordine int not null default 0,
  scadenza timestamptz,
  utilizzi_max int,
  utilizzi int not null default 0,
  attivo boolean not null default true
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  stelle int not null check (stelle between 1 and 5),
  testo text,
  approvata boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table settings (
  chiave text primary key,
  valore jsonb not null
);

-- ───────────── Funzioni ─────────────
create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and ruolo in ('staff', 'admin'));
$$;

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and ruolo = 'admin');
$$;

-- Profilo automatico alla registrazione
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nome, cognome)
  values (new.id, new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'cognome');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- search_vector: titolo (A), marca (B), descrizione (C)
create or replace function products_update_search_vector() returns trigger
language plpgsql as $$
declare brand_name text;
begin
  select nome into brand_name from brands where id = new.brand_id;
  new.search_vector :=
    setweight(to_tsvector('italian', unaccent(coalesce(new.titolo, ''))), 'A') ||
    setweight(to_tsvector('italian', unaccent(coalesce(brand_name, ''))), 'B') ||
    setweight(to_tsvector('italian', unaccent(coalesce(new.descrizione, ''))), 'C');
  return new;
end $$;
create trigger products_search_vector_trg before insert or update on products
  for each row execute function products_update_search_vector();

-- Scala lo stock in modo transazionale e idempotente (chiamata dal webhook Stripe)
create or replace function decrement_stock(p_order_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare item record;
begin
  if (select stock_scalato from orders where id = p_order_id for update) then
    return;
  end if;
  for item in select variant_id, quantita from order_items where order_id = p_order_id and variant_id is not null loop
    update product_variants set stock = stock - item.quantita
      where id = item.variant_id and stock >= item.quantita;
    if not found then
      raise exception 'Stock insufficiente per la variante %', item.variant_id;
    end if;
  end loop;
  update orders set stock_scalato = true, stato = 'paid' where id = p_order_id;
end $$;
revoke execute on function decrement_stock(uuid) from public, anon, authenticated;

-- Ricerca con tolleranza ai refusi (FTS + trigram) per autocompletamento e /s
create or replace function search_products(q text, max_results int default 8)
returns table (id uuid, titolo text, slug text, rank real)
language sql stable as $$
  select p.id, p.titolo, p.slug,
    greatest(
      ts_rank(p.search_vector, websearch_to_tsquery('italian', unaccent(q))),
      similarity(p.titolo, q)
    )::real as rank
  from products p
  where p.stato = 'published'
    and (p.search_vector @@ websearch_to_tsquery('italian', unaccent(q))
         or p.titolo % q
         or p.titolo ilike '%' || q || '%')
  order by rank desc
  limit max_results;
$$;

-- ───────────── RLS ─────────────
alter table profiles enable row level security;
alter table addresses enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table wishlists enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table coupons enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;

-- profiles
create policy profiles_select on profiles for select using (id = auth.uid() or is_staff());
create policy profiles_update_own on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and ruolo = (select ruolo from profiles where id = auth.uid()));
create policy profiles_admin_all on profiles for all using (is_admin()) with check (is_admin());

-- addresses / carts / wishlists: solo proprietario
create policy addresses_own on addresses for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy carts_own on carts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cart_items_own on cart_items for all
  using (cart_id = auth.uid()) with check (cart_id = auth.uid());
create policy wishlists_own on wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- catalogo: lettura pubblica (solo pubblicati), scrittura staff
create policy categories_read on categories for select using (true);
create policy categories_write on categories for all using (is_staff()) with check (is_staff());
create policy brands_read on brands for select using (true);
create policy brands_write on brands for all using (is_staff()) with check (is_staff());

create policy products_read on products for select using (stato = 'published' or is_staff());
create policy products_write on products for all using (is_staff()) with check (is_staff());

create policy variants_read on product_variants for select using (
  exists (select 1 from products p where p.id = product_id and (p.stato = 'published' or is_staff())));
create policy variants_write on product_variants for all using (is_staff()) with check (is_staff());

create policy images_read on product_images for select using (
  exists (select 1 from products p where p.id = product_id and (p.stato = 'published' or is_staff())));
create policy images_write on product_images for all using (is_staff()) with check (is_staff());

-- ordini: ogni cliente vede solo i propri; staff vede e modifica tutto.
-- Gli ordini vengono creati dal server con service role (webhook / checkout).
create policy orders_select on orders for select using (user_id = auth.uid() or is_staff());
create policy orders_staff_update on orders for update using (is_staff()) with check (is_staff());
create policy order_items_select on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_staff())));

-- coupons: solo staff (la validazione avviene lato server)
create policy coupons_staff on coupons for all using (is_staff()) with check (is_staff());

-- recensioni: pubbliche se approvate; il cliente scrive solo se ha acquistato
create policy reviews_read on reviews for select using (approvata or user_id = auth.uid() or is_staff());
create policy reviews_insert on reviews for insert with check (
  user_id = auth.uid() and approvata = false and exists (
    select 1 from orders o join order_items oi on oi.order_id = o.id
    join product_variants v on v.id = oi.variant_id
    where o.user_id = auth.uid() and v.product_id = reviews.product_id
      and o.stato in ('paid', 'processing', 'shipped', 'ready_for_pickup', 'delivered')));
create policy reviews_staff on reviews for all using (is_staff()) with check (is_staff());

-- settings: lettura pubblica, scrittura admin
create policy settings_read on settings for select using (true);
create policy settings_write on settings for all using (is_admin()) with check (is_admin());

-- ───────────── Storage ─────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict do nothing;
create policy product_images_public_read on storage.objects for select using (bucket_id = 'product-images');
create policy product_images_staff_write on storage.objects for all
  using (bucket_id = 'product-images' and is_staff()) with check (bucket_id = 'product-images' and is_staff());
