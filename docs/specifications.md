# Functional Specifications

## 1. Project

Cashflow Manager

## 2. Objective

Allow users to record, manage and monitor their incomes and expenses.

## 3. Authentication

Users can:

- Sign up
- Log in
- Log out

All users have the same permissions.

Each user can only access their own financial data.

## 4. Incomes

Users can:

- Add an income
- Edit an income
- Delete an income
- View incomes
- Filter incomes by date
- View daily totals
- View totals for a selected period

Each income contains:

- Date and time
- Amount
- Optional description

Example:

07:00 - 100 Ar - Client A  
09:00 - 200 Ar  
15:00 - 300 Ar - Sale  

Daily total: 600 Ar

## 5. Expenses

Expenses follow the same behaviour as incomes.

Each expense contains:

- Date and time
- Amount
- Optional description

## 6. Filters

- Today
- This month
- Last month
- This year
- Last year
- All time
- Custom date range

## 7. Global Totals

### Total Incomes

Sum of all user incomes.

### Total Expenses

Sum of all user expenses.

### Total Benefits

Total Benefits = Total Incomes - Total Expenses
