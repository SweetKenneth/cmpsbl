-- Proprietary Evolution artifact registry for candidate ingest, discoveries, and crystallized capabilities
create table if not exists public.artifact_registry (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  slug text not null,
  tier text not null default 'candidate',
  category text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artifact_registry_slug_key unique (slug)
);

create index if not exists idx_artifact_registry_user_category_tier_created
  on public.artifact_registry (user_id, category, tier, created_at desc);
create index if not exists idx_artifact_registry_category_created
  on public.artifact_registry (category, created_at desc);
create index if not exists idx_artifact_registry_metadata_gin
  on public.artifact_registry using gin (metadata);

alter table public.artifact_registry enable row level security;

create policy "Users can view their own artifacts"
on public.artifact_registry
for select
using (auth.uid() = user_id);

create policy "Users can create their own artifacts"
on public.artifact_registry
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own artifacts"
on public.artifact_registry
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own artifacts"
on public.artifact_registry
for delete
using (auth.uid() = user_id);

create or replace function public.update_artifact_registry_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_artifact_registry_updated_at
before update on public.artifact_registry
for each row
execute function public.update_artifact_registry_updated_at();