using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ContextManager.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Users table
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            // Create unique index on Email
            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            // Create Contexts table
            migrationBuilder.CreateTable(
                name: "Contexts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Color = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    Icon = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contexts", x => x.Id);
                });

            // Create Tasks table
            migrationBuilder.CreateTable(
                name: "Tasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContextId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    EstimatedMinutes = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DueDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tasks_Contexts_ContextId",
                        column: x => x.ContextId,
                        principalTable: "Contexts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create TaskSuggestions table
            migrationBuilder.CreateTable(
                name: "TaskSuggestions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContextId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConfidenceScore = table.Column<float>(type: "real", nullable: false),
                    Reasoning = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserAccepted = table.Column<bool>(type: "boolean", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskSuggestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskSuggestions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskSuggestions_Tasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TaskSuggestions_Contexts_ContextId",
                        column: x => x.ContextId,
                        principalTable: "Contexts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            // Create indexes
            migrationBuilder.CreateIndex(
                name: "IX_Tasks_UserId",
                table: "Tasks",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks_ContextId",
                table: "Tasks",
                column: "ContextId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSuggestions_UserId",
                table: "TaskSuggestions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSuggestions_TaskId",
                table: "TaskSuggestions",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskSuggestions_ContextId",
                table: "TaskSuggestions",
                column: "ContextId");

            // Seed default contexts
            migrationBuilder.InsertData(
                table: "Contexts",
                columns: new[] { "Id", "Name", "Description", "Color", "Icon" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "Deep Work", "Complex problem-solving, coding, writing, research", "#3B82F6", "brain" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "Meetings", "Collaborative sessions, discussions, video calls", "#10B981", "users" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "Admin", "Email management, scheduling, documentation, planning", "#F59E0B", "clipboard" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "Creative", "Brainstorming, design, prototyping, experimentation", "#8B5CF6", "palette" },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "Learning", "Reading, courses, tutorials, skill development", "#EC4899", "book" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "TaskSuggestions");
            migrationBuilder.DropTable(name: "Tasks");
            migrationBuilder.DropTable(name: "Contexts");
            migrationBuilder.DropTable(name: "Users");
        }
    }
}

