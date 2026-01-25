-- 005_add_recuranttasks: Recurring task templates and instance links.
-- Run manually in Railway SQL console, or via API startup migrations. Idempotent.

ALTER TABLE "Tasks" ADD COLUMN IF NOT EXISTS "RecurringTaskTemplateId" uuid;
ALTER TABLE "Tasks" ADD COLUMN IF NOT EXISTS "IsRecurringInstance" boolean NOT NULL DEFAULT FALSE;

UPDATE "Tasks" SET "IsRecurringInstance" = TRUE WHERE "RecurringTaskTemplateId" IS NOT NULL;

ALTER TABLE "Tasks" ALTER COLUMN "IsRecurringInstance" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "RecurringTasks" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "ContextId" uuid NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Description" character varying(2000),
    "EstimatedMinutes" integer NOT NULL,
    "Priority" integer NOT NULL,
    "RecurrenceType" integer NOT NULL,
    "RecurrenceDays" character varying(100),
    "RecurrenceStartDate" timestamp with time zone NOT NULL,
    "RecurrenceEndDate" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT TRUE,
    CONSTRAINT "PK_RecurringTasks" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_RecurringTasks_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_RecurringTasks_Contexts_ContextId" FOREIGN KEY ("ContextId") REFERENCES "Contexts" ("Id") ON DELETE RESTRICT
);

-- Add FK only if not already present (idempotent for Railway manual runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'FK_Tasks_RecurringTasks_RecurringTaskTemplateId'
  ) THEN
    ALTER TABLE "Tasks" ADD CONSTRAINT "FK_Tasks_RecurringTasks_RecurringTaskTemplateId"
      FOREIGN KEY ("RecurringTaskTemplateId") REFERENCES "RecurringTasks" ("Id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "IX_RecurringTasks_UserId" ON "RecurringTasks" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_RecurringTasks_ContextId" ON "RecurringTasks" ("ContextId");
CREATE INDEX IF NOT EXISTS "IX_RecurringTasks_IsActive" ON "RecurringTasks" ("IsActive");
CREATE INDEX IF NOT EXISTS "IX_Tasks_RecurringTaskTemplateId" ON "Tasks" ("RecurringTaskTemplateId");