-- Migration 003: Remove legacy TaskSuggestions table
-- This table has been replaced by the SessionPlans system
-- WARNING: This will delete all historical suggestion data

-- Drop indexes first
DROP INDEX IF EXISTS "IX_TaskSuggestions_UserId";
DROP INDEX IF EXISTS "IX_TaskSuggestions_TaskId";
DROP INDEX IF EXISTS "IX_TaskSuggestions_ContextId";

-- Drop the table
DROP TABLE IF EXISTS "TaskSuggestions";

