-- Migration 000: Create migration tracking table
-- This table tracks which migrations have been applied
-- Must run before any other migrations

CREATE TABLE IF NOT EXISTS "__Migrations" (
    "MigrationId" character varying(255) NOT NULL,
    "AppliedAt" timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT "PK___Migrations" PRIMARY KEY ("MigrationId")
);

