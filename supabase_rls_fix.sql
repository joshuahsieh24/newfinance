-- Fix Row Level Security for transactions table
-- Run this in your Supabase SQL Editor

-- Option 1: Disable RLS completely (for testing)
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Option 2: Create a policy that allows all operations (alternative)
-- CREATE POLICY "Allow all operations" ON transactions FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON transactions FOR ALL WITH CHECK (true);

-- Option 3: Create a specific policy for the test user
-- CREATE POLICY "Allow test user" ON transactions FOR ALL USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Verify the table structure
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'transactions';

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'transactions'; 