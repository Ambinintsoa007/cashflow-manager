# Business Rules

## 1. Users

- A user must be authenticated to access the application.
- All users have the same permissions.
- A user can only access their own transactions.

## 2. Transactions

A transaction belongs to one user.

A transaction must contain:

- A type
- An amount
- A date and time

A description is optional.

Allowed transaction types:

- INCOME
- EXPENSE

The amount must be greater than 0.

## 3. Income

A user can:

- Create an income
- Edit an income
- Delete an income
- View their incomes
- Filter incomes by date

Several incomes can exist on the same day.

Example:

07:00 - 100 Ar  
09:00 - 200 Ar  
15:00 - 300 Ar  

Daily total = 600 Ar

Each income remains stored separately.

## 4. Expense

Expenses follow the same rules as incomes.

Several expenses can exist on the same day.

Each expense remains stored separately.

## 5. Daily Totals

Daily totals are calculated from transactions.

They are not stored in the database.

Example:

100 Ar + 200 Ar + 300 Ar = 600 Ar

If a transaction is edited or deleted, the daily total must update automatically.

## 6. Filters

Transactions can be filtered by:

- Today
- This month
- Last month
- This year
- Last year
- All time
- Custom date range

The displayed total must always correspond to the active filter.

## 7. Global Totals

Total Incomes:

Sum of all INCOME transactions belonging to the user.

Total Expenses:

Sum of all EXPENSE transactions belonging to the user.

Total Benefits:

Total Incomes - Total Expenses

These values are calculated and are not stored.

## 8. Data Isolation

Users must never be able to:

- View another user's transactions
- Edit another user's transactions
- Delete another user's transactions

This rule will be enforced using Supabase Row Level Security (RLS).

## 9. Modification

A transaction can be modified after creation.

Editable fields:

- Amount
- Description
- Date and time
- Type

## 10. Deletion

A transaction can be deleted.

After deletion:

- Daily totals must update
- Filtered totals must update
- Global totals must update
