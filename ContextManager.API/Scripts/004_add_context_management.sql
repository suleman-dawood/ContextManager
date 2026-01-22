-- Add UserId in a safe, backfillable way for existing installs.
ALTER TABLE "Contexts" ADD COLUMN IF NOT EXISTS "UserId" uuid;

-- Ensure a demo user exists for any legacy contexts that had no owner.
INSERT INTO "Users" ("Id", "Email", "Name", "PasswordHash", "CreatedAt")
VALUES ('11111111-1111-1111-1111-111111111111', 'demo@contextmanager.local', 'Demo User', 'uHOrySyYOmd5J9sDT1NcDaW8o4Twlm+1iqCc0GOvF6U=', '2024-01-01T00:00:00Z')
ON CONFLICT ("Id") DO NOTHING;

-- Backfill existing contexts to the demo user if they were created before UserId existed.
UPDATE "Contexts"
SET "UserId" = '11111111-1111-1111-1111-111111111111'
WHERE "UserId" IS NULL;

ALTER TABLE "Contexts" ALTER COLUMN "UserId" SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'FK_Contexts_Users_UserId'
    ) THEN
        ALTER TABLE "Contexts"
            ADD CONSTRAINT "FK_Contexts_Users_UserId"
            FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS "IX_Contexts_UserId" ON "Contexts" ("UserId");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Contexts_UserId_Name" ON "Contexts" ("UserId", "Name");