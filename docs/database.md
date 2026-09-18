# Database Design

## 1. Database

PostgreSQL via Supabase.

Supabase Auth manages user accounts.

We do not create a custom `users` table for the first version.

---

## 2. Transactions

Table: `transactions`

| Column | Type | Rules |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Required, references authenticated user |
| type | TEXT | `INCOME` or `EXPENSE` |
| amount | NUMERIC(15,2) | Required, greater than 0 |
| description | TEXT | Optional |
| transaction_at | TIMESTAMPTZ | Required |
| created_at | TIMESTAMPTZ | Default current time |
| updated_at | TIMESTAMPTZ | Default current time |

---

## 3. Relationship

One authenticated user can have many transactions.

User
    |
    | 1
    |
    | N
Transaction

Each transaction belongs to exactly one user.

---

## 4. Transaction Types

Allowed values:

- INCOME
- EXPENSE

Example:

07:00 | INCOME | 100 Ar | Client A
09:00 | INCOME | 200 Ar | null
15:00 | INCOME | 300 Ar | Sale

Daily income total = 600 Ar

---

## 5. Calculated Values

The following values are NOT stored in the database:

- Daily income total
- Daily expense total
- Total incomes
- Total expenses
- Total benefits

They are calculated from transactions.

Total Benefits:

Total Incomes - Total Expenses

---

## 6. Security

Each transaction contains a `user_id`.

Row Level Security (RLS) will ensure that users can only:

- Read their own transactions
- Create their own transactions
- Update their own transactions
- Delete their own transactions

---

## 7. Indexing

Indexes will be created for:

- user_id
- transaction_at
- user_id + type + transaction_at

These indexes will improve filtering by user, type and date.
