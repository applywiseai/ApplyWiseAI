-- FIRST ADMIN SETUP
-- 1) Create a user in Supabase Dashboard > Authentication > Users.
-- 2) Replace the email below and run this SQL.
-- 3) Do not expose the service-role key to the browser.

insert into public.app_users (id,email,full_name,role,is_active)
select id,email,coalesce(raw_user_meta_data->>'full_name',email),'ADMIN',true
from auth.users
where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (id) do update set role='ADMIN',is_active=true;
