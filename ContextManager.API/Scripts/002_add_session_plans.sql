
CREATE TABLE IF NOT EXISTS "SessionPlans" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "PlanDate" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "LastModifiedAt" timestamp with time zone,
    "IsCustomized" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_SessionPlans" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SessionPlans_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_SessionPlans_UserId_PlanDate" ON "SessionPlans" ("UserId", "PlanDate");

CREATE TABLE IF NOT EXISTS "SessionPlanItems" (
    "Id" uuid NOT NULL,
    "SessionPlanId" uuid NOT NULL,
    "TaskId" uuid NOT NULL,
    "Order" integer NOT NULL,
    "GroupNumber" integer NOT NULL,
    "Reasoning" character varying(500),
    CONSTRAINT "PK_SessionPlanItems" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SessionPlanItems_SessionPlans_SessionPlanId" FOREIGN KEY ("SessionPlanId") REFERENCES "SessionPlans" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_SessionPlanItems_Tasks_TaskId" FOREIGN KEY ("TaskId") REFERENCES "Tasks" ("Id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IX_SessionPlanItems_SessionPlanId_Order" ON "SessionPlanItems" ("SessionPlanId", "Order");

CREATE INDEX IF NOT EXISTS "IX_SessionPlanItems_TaskId" ON "SessionPlanItems" ("TaskId");

