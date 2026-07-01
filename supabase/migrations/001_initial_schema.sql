-- ===========================
-- ENUMS
-- ===========================
create type agent_status as enum ('online', 'idle', 'busy', 'offline');
create type agent_role as enum ('owner', 'admin', 'agent');
create type inbox_channel as enum ('web_widget', 'email', 'whatsapp', 'instagram');
create type conversation_status as enum ('pending', 'open', 'resolved', 'snoozed');
create type message_type as enum ('incoming', 'outgoing', 'activity');
create type message_content_type as enum ('text', 'html', 'input_email', 'input_select');
create type sender_type as enum ('contact', 'agent', 'bot');

-- ===========================
-- 1. ORGANIZATIONS（テナント）
-- ===========================
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  plan        text not null default 'free',
  timezone    text not null default 'Asia/Tokyo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table organizations enable row level security;

create policy "Members can view own org"
  on organizations for select
  using (id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Owner can update org"
  on organizations for update
  using (id in (
    select organization_id from agents
    where user_id = auth.uid() and role = 'owner'
  ));

-- ===========================
-- 2. AGENTS
-- ===========================
create table agents (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  display_name      text not null,
  avatar_url        text,
  role              agent_role   not null default 'agent',
  status            agent_status not null default 'offline',
  status_updated_at timestamptz  not null default now(),
  created_at        timestamptz  not null default now(),
  unique (organization_id, user_id)
);
alter table agents enable row level security;

create policy "Agents in same org can view"
  on agents for select
  using (organization_id in (
    select organization_id from agents a2 where a2.user_id = auth.uid()
  ));

create policy "Own agent row update"
  on agents for update
  using (user_id = auth.uid());

create policy "Admin can manage agents"
  on agents for all
  using (organization_id in (
    select organization_id from agents a2
    where a2.user_id = auth.uid() and a2.role in ('owner', 'admin')
  ));

create index idx_agents_org on agents(organization_id);
create index idx_agents_user on agents(user_id);

-- ===========================
-- 3. INBOXES
-- ===========================
create table inboxes (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  channel         inbox_channel not null default 'web_widget',
  site_url        text,
  widget_color    text not null default '#3B82F6',
  welcome_message text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);
alter table inboxes enable row level security;

create policy "Org members can manage inboxes"
  on inboxes for all
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create index idx_inboxes_org on inboxes(organization_id);

-- ===========================
-- 4. CONTACTS
-- ===========================
create table contacts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email           text,
  name            text,
  phone           text,
  avatar_url      text,
  attributes      jsonb not null default '{}',
  last_seen_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table contacts enable row level security;

create policy "Org members can view contacts"
  on contacts for select
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Org members can update contacts"
  on contacts for update
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Public insert via widget"
  on contacts for insert
  with check (true);

create index idx_contacts_org on contacts(organization_id);
create index idx_contacts_email on contacts(organization_id, email);

-- ===========================
-- 5. CONVERSATIONS
-- ===========================
create table conversations (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  inbox_id          uuid not null references inboxes(id) on delete cascade,
  contact_id        uuid references contacts(id) on delete set null,
  assigned_agent_id uuid references agents(id) on delete set null,
  status            conversation_status not null default 'pending',
  subject           text,
  meta              jsonb not null default '{}',
  first_reply_at    timestamptz,
  resolved_at       timestamptz,
  snoozed_until     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
alter table conversations enable row level security;

create policy "Org members view conversations"
  on conversations for select
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Org members manage conversations"
  on conversations for update
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Public insert via widget"
  on conversations for insert
  with check (true);

create index idx_conv_org_status on conversations(organization_id, status);
create index idx_conv_agent on conversations(assigned_agent_id);
create index idx_conv_contact on conversations(contact_id);
create index idx_conv_updated on conversations(organization_id, updated_at desc);

-- ===========================
-- 6. MESSAGES
-- ===========================
create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  sender_type     sender_type          not null,
  sender_agent_id uuid references agents(id) on delete set null,
  message_type    message_type         not null default 'incoming',
  content_type    message_content_type not null default 'text',
  content         text not null,
  attachments     jsonb not null default '[]',
  is_private_note boolean not null default false,
  created_at      timestamptz not null default now()
);
alter table messages enable row level security;

create policy "Org members view messages"
  on messages for select
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Org members insert messages"
  on messages for insert
  with check (
    organization_id in (
      select organization_id from agents where user_id = auth.uid()
    )
    or sender_type = 'contact'
  );

create policy "Public insert via widget"
  on messages for insert
  with check (sender_type = 'contact');

create index idx_messages_conv on messages(conversation_id, created_at);
create index idx_messages_org on messages(organization_id);

-- ===========================
-- 7. CANNED_RESPONSES
-- ===========================
create table canned_responses (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  short_code      text not null,
  content         text not null,
  created_by      uuid references agents(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (organization_id, short_code)
);
alter table canned_responses enable row level security;

create policy "Org members manage canned responses"
  on canned_responses for all
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

-- ===========================
-- 8. KB_CATEGORIES + KB_ARTICLES
-- ===========================
create table kb_categories (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  icon            text,
  position        int not null default 0,
  created_at      timestamptz not null default now()
);
alter table kb_categories enable row level security;

create policy "Org members manage kb_categories"
  on kb_categories for all
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Public read published categories"
  on kb_categories for select using (true);

create table kb_articles (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  category_id     uuid references kb_categories(id) on delete set null,
  title           text not null,
  content         text not null,
  slug            text not null,
  is_published    boolean not null default false,
  views           int not null default 0,
  author_id       uuid references agents(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (organization_id, slug)
);
alter table kb_articles enable row level security;

create policy "Org members manage articles"
  on kb_articles for all
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create policy "Public read published articles"
  on kb_articles for select
  using (is_published = true);

create index idx_kb_articles_org on kb_articles(organization_id, is_published);

-- ===========================
-- 9. LABELS
-- ===========================
create table labels (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title           text not null,
  color           text not null default '#6B7280',
  unique (organization_id, title)
);
alter table labels enable row level security;

create policy "Org members manage labels"
  on labels for all
  using (organization_id in (
    select organization_id from agents where user_id = auth.uid()
  ));

create table conversation_labels (
  conversation_id uuid not null references conversations(id) on delete cascade,
  label_id        uuid not null references labels(id) on delete cascade,
  primary key (conversation_id, label_id)
);
alter table conversation_labels enable row level security;

create policy "Org members manage conversation labels"
  on conversation_labels for all
  using (
    conversation_id in (
      select id from conversations where organization_id in (
        select organization_id from agents where user_id = auth.uid()
      )
    )
  );

-- ===========================
-- 10. AGENT_STATUS_LOG
-- ===========================
create table agent_status_log (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references agents(id) on delete cascade,
  status      agent_status not null,
  started_at  timestamptz not null default now(),
  ended_at    timestamptz
);
alter table agent_status_log enable row level security;

create policy "Own agent log or admin"
  on agent_status_log for select
  using (
    agent_id = (select id from agents where user_id = auth.uid())
    or agent_id in (
      select id from agents where organization_id in (
        select organization_id from agents a2
        where a2.user_id = auth.uid() and a2.role in ('owner', 'admin')
      )
    )
  );

create policy "Own agent can insert log"
  on agent_status_log for insert
  with check (
    agent_id = (select id from agents where user_id = auth.uid())
  );

create index idx_status_log_agent on agent_status_log(agent_id, started_at desc);

-- ===========================
-- UPDATED_AT triggers
-- ===========================
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at_column();

create trigger update_contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at_column();

create trigger update_conversations_updated_at
  before update on conversations
  for each row execute function update_updated_at_column();

create trigger update_kb_articles_updated_at
  before update on kb_articles
  for each row execute function update_updated_at_column();
