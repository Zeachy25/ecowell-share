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
    'created_at',      p.created_at,
    'author_name',     pr.full_name,
    'author_avatar',   pr.avatar_url,
    'place_name',      g.name,
    'place_address',   g.address,
    'place_score',     gs.quiet_score_avg,
    'lat',             st_y(g.center::geometry),
    'lng',             st_x(g.center::geometry),
    'photo_path', (
      select m.storage_path
      from public.post_media m
      where m.post_id = p.id
      order by m.sort_order
      limit 1
    ),
    'photo_paths', coalesce((
      select jsonb_agg(m.storage_path order by m.sort_order)
      from public.post_media m
      where m.post_id = p.id
    ), '[]'::jsonb),
    'place_photo_url', g.photo_url,
    'like_count',    (select count(*) from public.post_likes l where l.post_id = p.id),
    'comment_count', (select count(*) from public.post_comments c where c.post_id = p.id),
    'share_count',   (select count(*) from public.posts s where s.shared_post_id = p.id)
  )
  from public.posts p
  left join public.public_profiles pr on pr.id = p.user_id
  left join public.green_spaces g on g.id = p.place_id
  left join public.green_spaces_with_stats gs on gs.id = p.place_id
  where p.id = p_id;
$$;

revoke all on function public.get_public_post(uuid) from public;
grant execute on function public.get_public_post(uuid) to anon;

notify pgrst, 'reload schema';
