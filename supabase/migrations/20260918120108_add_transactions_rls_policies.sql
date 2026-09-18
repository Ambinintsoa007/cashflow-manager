-- Read own transactions
create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using (auth.uid() = user_id);


-- Create own transactions
create policy "Users can create their own transactions"
on public.transactions
for insert
to authenticated
with check (auth.uid() = user_id);


-- Update own transactions
create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


-- Delete own transactions
create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using (auth.uid() = user_id);
