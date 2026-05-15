-- Signed-in review reminder infrastructure.

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminders_enabled boolean not null default false,
  email_enabled boolean not null default true,
  morning_push_time time not null default time '09:00',
  evening_followup_time time not null default time '18:00',
  timezone text not null default 'UTC',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  timezone text not null default 'UTC',
  platform text,
  user_agent text,
  enabled boolean not null default true,
  failure_count integer not null default 0,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

do $$
begin
  create type public.notification_delivery_stage as enum ('morning_push', 'immediate_email', 'evening_email', 'test_push');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_delivery_channel as enum ('push', 'email');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.notification_delivery_status as enum ('pending', 'sent', 'failed_transient', 'failed_permanent', 'skipped');
exception when duplicate_object then null;
end $$;

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_date date not null,
  stage public.notification_delivery_stage not null,
  channel public.notification_delivery_channel not null,
  status public.notification_delivery_status not null default 'pending',
  due_count integer not null default 0,
  sent_at timestamptz,
  clicked_at timestamptz,
  reviewed_after_send boolean not null default false,
  error_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date, stage, channel)
);

create index if not exists notification_preferences_updated_at_idx on public.notification_preferences(updated_at desc);
create index if not exists notification_subscriptions_user_enabled_idx on public.notification_subscriptions(user_id, enabled);
create index if not exists notification_subscriptions_updated_at_idx on public.notification_subscriptions(updated_at desc);
create index if not exists notification_deliveries_user_date_idx on public.notification_deliveries(user_id, local_date desc);
create index if not exists notification_deliveries_stage_status_idx on public.notification_deliveries(stage, status, local_date);

alter table public.notification_preferences enable row level security;
alter table public.notification_subscriptions enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "Users can read their own notification preferences"
  on public.notification_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own notification preferences"
  on public.notification_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own notification preferences"
  on public.notification_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own notification subscriptions"
  on public.notification_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update their own notification subscriptions"
  on public.notification_subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can read their own notification deliveries"
  on public.notification_deliveries for select
  to authenticated
  using (auth.uid() = user_id);
