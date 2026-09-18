create table public.transactions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    type text not null
        check (type in ('INCOME', 'EXPENSE')),

    amount numeric(15, 2) not null
        check (amount > 0),

    description text,

    transaction_at timestamptz not null default now(),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_transactions_user_id
    on public.transactions(user_id);

create index idx_transactions_transaction_at
    on public.transactions(transaction_at);

create index idx_transactions_user_type_date
    on public.transactions(user_id, type, transaction_at);


-- Automatically update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_transactions_updated_at
before update on public.transactions
for each row
execute function public.set_updated_at();


-- Enable Row Level Security
alter table public.transactions enable row level security;
