// Tipi del database (schema in supabase/migrations/0001_schema.sql).
// Scritti a mano nel formato di `supabase gen types`: rigenerarli con `npm run db:types` quando il progetto è collegato.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Rel<Col extends string, Ref extends string, OneToOne extends boolean = false> = {
  foreignKeyName: string;
  columns: [Col];
  isOneToOne: OneToOne;
  referencedRelation: Ref;
  referencedColumns: ["id" | "user_id"];
};

type Table<Row, Insert, Relationships extends Rel<string, string, boolean>[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        {
          id: string;
          nome: string | null;
          cognome: string | null;
          telefono: string | null;
          ruolo: Database["public"]["Enums"]["user_role"];
          newsletter_consent: boolean;
          created_at: string;
        },
        {
          id: string;
          nome?: string | null;
          cognome?: string | null;
          telefono?: string | null;
          ruolo?: Database["public"]["Enums"]["user_role"];
          newsletter_consent?: boolean;
          created_at?: string;
        }
      >;
      addresses: Table<
        {
          id: string;
          user_id: string;
          nome: string;
          via: string;
          civico: string;
          cap: string;
          citta: string;
          provincia: string;
          telefono: string | null;
          predefinito: boolean;
        },
        {
          id?: string;
          user_id: string;
          nome: string;
          via: string;
          civico: string;
          cap: string;
          citta: string;
          provincia: string;
          telefono?: string | null;
          predefinito?: boolean;
        }
      >;
      categories: Table<
        { id: string; parent_id: string | null; nome: string; slug: string; immagine: string | null; ordine: number },
        { id?: string; parent_id?: string | null; nome: string; slug: string; immagine?: string | null; ordine?: number },
        [Rel<"parent_id", "categories">]
      >;
      brands: Table<
        { id: string; nome: string; slug: string; logo: string | null; descrizione: string | null },
        { id?: string; nome: string; slug: string; logo?: string | null; descrizione?: string | null }
      >;
      products: Table<
        {
          id: string;
          titolo: string;
          slug: string;
          brand_id: string | null;
          category_id: string | null;
          descrizione: string | null;
          punti_chiave: string[];
          materiale: string | null;
          cura: string | null;
          stato: Database["public"]["Enums"]["product_status"];
          in_evidenza: boolean;
          seo_title: string | null;
          seo_description: string | null;
          search_vector: unknown | null;
          created_at: string;
        },
        {
          id?: string;
          titolo: string;
          slug: string;
          brand_id?: string | null;
          category_id?: string | null;
          descrizione?: string | null;
          punti_chiave?: string[];
          materiale?: string | null;
          cura?: string | null;
          stato?: Database["public"]["Enums"]["product_status"];
          in_evidenza?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
        },
        [Rel<"brand_id", "brands">, Rel<"category_id", "categories">]
      >;
      product_variants: Table<
        {
          id: string;
          product_id: string;
          sku: string;
          misura: string | null;
          colore: string | null;
          taglia: string | null;
          prezzo: number;
          prezzo_barrato: number | null;
          stock: number;
          peso_g: number | null;
          ean: string | null;
        },
        {
          id?: string;
          product_id: string;
          sku: string;
          misura?: string | null;
          colore?: string | null;
          taglia?: string | null;
          prezzo: number;
          prezzo_barrato?: number | null;
          stock?: number;
          peso_g?: number | null;
          ean?: string | null;
        },
        [Rel<"product_id", "products">]
      >;
      product_images: Table<
        { id: string; product_id: string; variant_id: string | null; url: string; alt: string; ordine: number },
        { id?: string; product_id: string; variant_id?: string | null; url: string; alt?: string; ordine?: number },
        [Rel<"product_id", "products">, Rel<"variant_id", "product_variants">]
      >;
      carts: Table<{ user_id: string; updated_at: string }, { user_id: string; updated_at?: string }>;
      cart_items: Table<
        { cart_id: string; variant_id: string; quantita: number },
        { cart_id: string; variant_id: string; quantita: number },
        [Rel<"cart_id", "carts">, Rel<"variant_id", "product_variants">]
      >;
      wishlists: Table<
        { user_id: string; product_id: string },
        { user_id: string; product_id: string },
        [Rel<"product_id", "products">]
      >;
      orders: Table<
        {
          id: string;
          numero: string;
          user_id: string | null;
          email: string;
          stato: Database["public"]["Enums"]["order_status"];
          metodo_consegna: Database["public"]["Enums"]["delivery_method"];
          indirizzo: Json | null;
          subtotale: number;
          spedizione: number;
          sconto: number;
          totale: number;
          coupon_code: string | null;
          stripe_session_id: string | null;
          tracking: string | null;
          note: string | null;
          stock_scalato: boolean;
          created_at: string;
        },
        {
          id?: string;
          numero?: string;
          user_id?: string | null;
          email: string;
          stato?: Database["public"]["Enums"]["order_status"];
          metodo_consegna: Database["public"]["Enums"]["delivery_method"];
          indirizzo?: Json | null;
          subtotale: number;
          spedizione?: number;
          sconto?: number;
          totale: number;
          coupon_code?: string | null;
          stripe_session_id?: string | null;
          tracking?: string | null;
          note?: string | null;
          stock_scalato?: boolean;
          created_at?: string;
        }
      >;
      order_items: Table<
        { id: string; order_id: string; variant_id: string | null; titolo: string; prezzo: number; quantita: number },
        { id?: string; order_id: string; variant_id?: string | null; titolo: string; prezzo: number; quantita: number },
        [Rel<"order_id", "orders">, Rel<"variant_id", "product_variants">]
      >;
      coupons: Table<
        {
          codice: string;
          tipo: Database["public"]["Enums"]["coupon_type"];
          valore: number;
          minimo_ordine: number;
          scadenza: string | null;
          utilizzi_max: number | null;
          utilizzi: number;
          attivo: boolean;
        },
        {
          codice: string;
          tipo: Database["public"]["Enums"]["coupon_type"];
          valore: number;
          minimo_ordine?: number;
          scadenza?: string | null;
          utilizzi_max?: number | null;
          utilizzi?: number;
          attivo?: boolean;
        }
      >;
      reviews: Table<
        {
          id: string;
          product_id: string;
          user_id: string;
          stelle: number;
          testo: string | null;
          approvata: boolean;
          created_at: string;
        },
        {
          id?: string;
          product_id: string;
          user_id: string;
          stelle: number;
          testo?: string | null;
          approvata?: boolean;
          created_at?: string;
        },
        [Rel<"product_id", "products">]
      >;
      settings: Table<{ chiave: string; valore: Json }, { chiave: string; valore: Json }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_staff: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      decrement_stock: { Args: { p_order_id: string }; Returns: undefined };
      search_products: {
        Args: { q: string; max_results?: number };
        Returns: { id: string; titolo: string; slug: string; rank: number }[];
      };
    };
    Enums: {
      user_role: "customer" | "staff" | "admin";
      product_status: "draft" | "published";
      order_status:
        | "pending"
        | "paid"
        | "processing"
        | "shipped"
        | "ready_for_pickup"
        | "delivered"
        | "cancelled"
        | "refunded";
      delivery_method: "shipping" | "pickup";
      coupon_type: "percent" | "fixed";
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> = PublicSchema["Enums"][T];
