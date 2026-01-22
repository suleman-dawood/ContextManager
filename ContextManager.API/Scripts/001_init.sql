
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" uuid NOT NULL,
    "Email" character varying(255) NOT NULL,
    "Name" character varying(100) NOT NULL,
    "PasswordHash" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");

CREATE TABLE IF NOT EXISTS "Contexts" (
    "Id" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Description" character varying(200) NOT NULL,
    "Color" character varying(7) NOT NULL,
    "Icon" character varying(100) NOT NULL,
    CONSTRAINT "PK_Contexts" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "Tasks" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "ContextId" uuid NOT NULL,
    "Title" character varying(200) NOT NULL,
    "Description" character varying(2000),
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

CREATE INDEX IF NOT EXISTS "IX_Tasks_UserId" ON "Tasks" ("UserId");
CREATE INDEX IF NOT EXISTS "IX_Tasks_ContextId" ON "Tasks" ("ContextId");


