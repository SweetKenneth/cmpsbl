do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'artifact_registry_slug_key'
      and conrelid = 'public.artifact_registry'::regclass
  ) then
    alter table public.artifact_registry drop constraint artifact_registry_slug_key;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'artifact_registry_user_slug_key'
      and conrelid = 'public.artifact_registry'::regclass
  ) then
    alter table public.artifact_registry
      add constraint artifact_registry_user_slug_key unique (user_id, slug);
  end if;
end
$$;