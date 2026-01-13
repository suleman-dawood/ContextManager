-- Migration 001: Initial database schema
-- Creates Users, Contexts, and Tasks tables
-- Seeds default contexts

-- Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(255) NOT NULL,
    "Name" character varying(100) NOT NULL,
    "PasswordHash" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- Create unique index on Email if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");

-- Create Contexts table
CREATE TABLE IF NOT EXISTS "Contexts" (
    "Id" uuid NOT NULL,
    "Name" character varying(50) NOT NULL,
    "Description" character varying(200) NOT NULL,
    "Color" character varying(7) NOT NULL,
    "Icon" character varying(50) NOT NULL,
    CONSTRAINT "PK_Contexts" PRIMARY KEY ("Id")
);

-- Create Tasks table
CREATE TABLE IF NOT EXISTS "Tasks" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "ContextId" uuid NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Description" character varying(1000),
    "EstimatedMinutes" integer NOT NULL,
    "Priority" integer NOT NULL,
    "Status" integer NOT NULL,
    "DueDate" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CompletedAt" timestamp with time zone,
    CONSTRAINT "PK_Tasks" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Tasks_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_Tasks_Contexts_ContextId" FOREIGN KEY ("ContextId") REFERENCES "Contexts" ("Id") ON DELETE RESTRICT
);

-- Create indexes for Tasks table
CREATE INDEX IF NOT EXISTS "IX_Tasks_UserId" ON "Tasks" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Tasks_ContextId" ON "Tasks" ("ContextId");

-- Seed default contexts (only if they don't exist)
INSERT INTO "Contexts" ("Id", "Name", "Description", "Color", "Icon")
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Deep Work', 'Complex problem-solving, coding, writing, research', '#3B82F6', 'brain'),
    ('22222222-2222-2222-2222-222222222222', 'Meetings', 'Collaborative sessions, discussions, video calls', '#10B981', 'users'),
    ('33333333-3333-3333-3333-333333333333', 'Admin', 'Email management, scheduling, documentation, planning', '#F59E0B', 'clipboard'),
    ('44444444-4444-4444-4444-444444444444', 'Creative', 'Brainstorming, design, prototyping, experimentation', '#8B5CF6', 'palette'),
    ('55555555-5555-5555-5555-555555555555', 'Learning', 'Reading, courses, tutorials, skill development', '#EC4899', 'book')
ON CONFLICT ("Id") DO NOTHING;

