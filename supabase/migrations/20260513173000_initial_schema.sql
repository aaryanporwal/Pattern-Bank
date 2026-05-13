-- Initial PatternBank schema for self-hosted Supabase projects.
-- This migration intentionally keeps problem IDs as text because the app
-- creates IDs locally before syncing and upserts on problems.id.

create table if not exists public.problems (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  leetcode_number integer,
  url text,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  patterns text[] not null default '{}',
  confidence integer not null check (confidence between 1 and 5),
  notes text not null default '',
  date_added date not null default current_date,
  last_reviewed date,
  next_review_date date not null default current_date,
  updated_at timestamptz not null default now(),
  exclude_from_review boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  problem_id text not null,
  old_confidence integer check (old_confidence is null or old_confidence between 1 and 5),
  new_confidence integer not null check (new_confidence between 1 and 5),
  patterns text[] not null default '{}',
  review_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_review_goal integer not null default 5 check (daily_review_goal between 1 and 20),
  hide_patterns_during_review boolean not null default false,
  enabled_extra_patterns text[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  message text not null check (length(btrim(message)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists problems_user_id_idx on public.problems(user_id);
create index if not exists problems_user_next_review_date_idx on public.problems(user_id, next_review_date);
create index if not exists problems_user_updated_at_idx on public.problems(user_id, updated_at desc);
create index if not exists problems_created_at_idx on public.problems(created_at desc);

create index if not exists review_log_user_id_idx on public.review_log(user_id);
create index if not exists review_log_problem_id_idx on public.review_log(problem_id);
create index if not exists review_log_created_at_idx on public.review_log(created_at desc);
create index if not exists review_log_user_review_date_idx on public.review_log(user_id, review_date);
create index if not exists review_log_user_problem_created_at_idx on public.review_log(user_id, problem_id, created_at desc);

create index if not exists user_preferences_updated_at_idx on public.user_preferences(updated_at desc);

create index if not exists feedback_user_id_idx on public.feedback(user_id);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);

alter table public.problems enable row level security;
alter table public.review_log enable row level security;
alter table public.user_preferences enable row level security;
alter table public.feedback enable row level security;

create policy "Users can read their own problems"
  on public.problems for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own problems"
  on public.problems for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own problems"
  on public.problems for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own problems"
  on public.problems for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own review log"
  on public.review_log for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own review log"
  on public.review_log for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own review log"
  on public.review_log for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own review log"
  on public.review_log for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own preferences"
  on public.user_preferences for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own preferences"
  on public.user_preferences for delete
  to authenticated
  using (auth.uid() = user_id);

create policy "Anyone can submit feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

create policy "Users can read their own feedback"
  on public.feedback for select
  to authenticated
  using (auth.uid() = user_id);
