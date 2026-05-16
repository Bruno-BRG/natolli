create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  image_url text,
  price_cents integer not null check (price_cents > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  color text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents > 0),
  total_cents integer not null check (total_cents > 0),
  customer_name text not null,
  customer_phone text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'in_production', 'completed', 'canceled')),
  order_source text not null default 'site' check (order_source in ('site', 'manual')),
  payment_provider text not null default 'mercado_pago',
  payment_preference_id text,
  created_at timestamptz not null default now()
);

alter table public.orders
add column if not exists order_source text not null default 'site';

alter table public.orders
drop constraint if exists orders_status_check;

alter table public.orders
add constraint orders_status_check check (status in ('pending', 'paid', 'in_production', 'completed', 'canceled'));

alter table public.orders
drop constraint if exists orders_source_check;

alter table public.orders
add constraint orders_source_check check (order_source in ('site', 'manual'));

alter table public.products enable row level security;
alter table public.orders enable row level security;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_source_idx on public.orders (order_source);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Products are readable by everyone" on public.products;
create policy "Products are readable by everyone"
on public.products
for select
to anon, authenticated
using (active = true);

drop policy if exists "Product images are readable by everyone" on storage.objects;
create policy "Product images are readable by everyone"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

insert into public.products (id, name, description, image_url, price_cents, active)
values
  (
    'bolsa-bordo',
    'Bolsa artesanal bordo',
    'Bolsa feita a mao com trama encorpada e alca de madeira.',
    '/loja/img/bolsa-bordo-alca-madeira.png',
    18990,
    true
  ),
  (
    'bolsa-rosa',
    'Bolsa tiracolo rosa bebe',
    'Modelo compacto com corrente, franja e acabamento delicado.',
    '/loja/img/bolsa-rosa-franja.png',
    16990,
    true
  ),
  (
    'peca-personalizada',
    'Peca personalizada',
    'Escolha o modelo, a cor da linha e os detalhes do seu pedido.',
    '/loja/img/logo-principal.png',
    12000,
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  price_cents = excluded.price_cents,
  active = excluded.active;
