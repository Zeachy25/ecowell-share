create or replace function public.get_public_post(p_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'id',              p.id,
    'caption',         p.caption,
    'place_name',      g.name,
    'place_address',   g.address,
    'place_score',     gs.quiet_score_avg,
    'photo_path', (
      select m.storage_path
      from public.post_media m
      where m.post_id = p.id
      order by m.sort_order
      limit 1
    ),
    'place_photo_url', g.photo_url
  )
  from public.posts p
  left join public.green_spaces g on g.id = p.place_id
  left join public.green_spaces_with_stats gs on gs.id = p.place_id
  where p.id = p_id;
$$;

revoke all on function public.get_public_post(uuid) from public;
grant execute on function public.get_public_post(uuid) to anon;

notify pgrst, 'reload schema';
