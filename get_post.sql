create or replace function public.get_post(p_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select public.feed_post_json(p_id);
$$;

revoke all on function public.get_post(uuid) from public, anon;
grant execute on function public.get_post(uuid) to authenticated;

notify pgrst, 'reload schema';
