-- Shop House Giarre — correzioni allo schema v1

-- ───────────── Indirizzi: al massimo un predefinito per utente ─────────────
create unique index addresses_un_predefinito on addresses (user_id) where predefinito;

-- ───────────── Numero ordine: SH-YYYY-NNNNN che riparte ogni anno ─────────────
create table order_counters (
  anno int primary key,
  ultimo int not null
);
alter table order_counters enable row level security; -- nessuna policy: solo funzioni security definer

create or replace function genera_numero_ordine() returns text
language plpgsql security definer set search_path = public as $$
declare
  a int := extract(year from now() at time zone 'Europe/Rome')::int;
  n int;
begin
  insert into order_counters (anno, ultimo) values (a, 1)
    on conflict (anno) do update set ultimo = order_counters.ultimo + 1
    returning ultimo into n;
  return 'SH-' || a || '-' || lpad(n::text, 5, '0');
end $$;
revoke execute on function genera_numero_ordine() from public, anon, authenticated;

-- Riprende la numerazione dalla vecchia sequenza per gli ordini già esistenti
insert into order_counters (anno, ultimo)
  select split_part(numero, '-', 2)::int, max(split_part(numero, '-', 3)::int)
  from orders group by 1
  on conflict do nothing;

alter table orders alter column numero set default genera_numero_ordine();
drop sequence order_number_seq;

-- ───────────── Ricerca: aggiorna i prodotti quando cambia il nome della marca ─────────────
create or replace function brands_refresh_search_vector() returns trigger
language plpgsql as $$
begin
  update products set brand_id = brand_id where brand_id = new.id; -- riattiva products_search_vector_trg
  return null;
end $$;
create trigger brands_refresh_search_vector_trg after update of nome on brands
  for each row when (old.nome is distinct from new.nome)
  execute function brands_refresh_search_vector();

-- ───────────── Ricerca: tolleranza ai refusi sulle singole parole del titolo ─────────────
-- similarity() confrontava la query con l'intero titolo: "tovaglja" non trovava
-- "Tovaglia da tavola 100% cotone". word_similarity() confronta con la parola più vicina.
create or replace function search_products(q text, max_results int default 8)
returns table (id uuid, titolo text, slug text, rank real)
language sql stable as $$
  select p.id, p.titolo, p.slug,
    greatest(
      ts_rank(p.search_vector, websearch_to_tsquery('italian', unaccent(q))),
      word_similarity(unaccent(lower(q)), unaccent(lower(p.titolo)))
    )::real as rank
  from products p
  where p.stato = 'published'
    and (p.search_vector @@ websearch_to_tsquery('italian', unaccent(q))
         or q <% p.titolo
         or p.titolo ilike '%' || q || '%')
  order by rank desc
  limit max_results;
$$;

-- ───────────── Stock: decrement_stock non cambia più lo stato dell'ordine ─────────────
-- Il webhook Stripe imposta stato = 'paid' separatamente.
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
  update orders set stock_scalato = true where id = p_order_id;
end $$;
revoke execute on function decrement_stock(uuid) from public, anon, authenticated;

-- ───────────── Coupon: incremento atomico degli utilizzi ─────────────
-- Restituisce false se il coupon non esiste, è disattivo, scaduto o esaurito.
create or replace function incrementa_utilizzo_coupon(p_codice text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  update coupons set utilizzi = utilizzi + 1
    where codice = p_codice and attivo
      and (scadenza is null or scadenza > now())
      and (utilizzi_max is null or utilizzi < utilizzi_max);
  return found;
end $$;
revoke execute on function incrementa_utilizzo_coupon(text) from public, anon, authenticated;

-- ───────────── Recensioni: il cliente può modificare o cancellare la propria ─────────────
-- Dopo una modifica la recensione torna in attesa di approvazione.
create policy reviews_update_own on reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and approvata = false and exists (
    select 1 from orders o join order_items oi on oi.order_id = o.id
    join product_variants v on v.id = oi.variant_id
    where o.user_id = auth.uid() and v.product_id = reviews.product_id
      and o.stato in ('paid', 'processing', 'shipped', 'ready_for_pickup', 'delivered')));
create policy reviews_delete_own on reviews for delete using (user_id = auth.uid());
