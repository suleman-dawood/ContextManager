using Microsoft.EntityFrameworkCore;
using ContextManager.API.Models;

namespace ContextManager.API.Data
{
    /// <summary>
    /// Database context for the Context Manager application
    /// Manages all entity relationships and database operations
    /// </summary>
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Database tables (DbSets)
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Context> Contexts { get; set; } = null!;
        public DbSet<Models.Task> Tasks { get; set; } = null!;
        public DbSet<SessionPlan> SessionPlans { get; set; } = null!;
        public DbSet<SessionPlanItem> SessionPlanItems { get; set; } = null!;

        /// <summary>
        /// Configures entity relationships and seeds initial data
        /// </summary>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Explicitly set table names (PostgreSQL case sensitivity)
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Context>().ToTable("Contexts");
            modelBuilder.Entity<Models.Task>().ToTable("Tasks");
            modelBuilder.Entity<SessionPlan>().ToTable("SessionPlans");
            modelBuilder.Entity<SessionPlanItem>().ToTable("SessionPlanItems");

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique(); // Email must be unique for login
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // Configure Context entity
            modelBuilder.Entity<Context>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Color).IsRequired().HasMaxLength(7); // Hex color
                entity.Property(e => e.Icon).IsRequired().HasMaxLength(50);
            });

            // Configure Task entity
            modelBuilder.Entity<Models.Task>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                
                // Relationship: Task belongs to User
                entity.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade); // Delete tasks when user is deleted
                
                // Relationship: Task belongs to Context
                entity.HasOne(t => t.Context)
                    .WithMany()
                    .HasForeignKey(t => t.ContextId)
                    .OnDelete(DeleteBehavior.Restrict); // Don't allow context deletion if tasks exist
            });

            // Configure SessionPlan entity
            modelBuilder.Entity<SessionPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                // Relationship: SessionPlan belongs to User
                entity.HasOne(sp => sp.User)
                    .WithMany()
                    .HasForeignKey(sp => sp.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Create index for querying by user and date
                entity.HasIndex(sp => new { sp.UserId, sp.PlanDate }).IsUnique();
            });

            // Configure SessionPlanItem entity
            modelBuilder.Entity<SessionPlanItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reasoning).HasMaxLength(500);
                
                // Relationship: SessionPlanItem belongs to SessionPlan
                entity.HasOne(spi => spi.SessionPlan)
                    .WithMany(sp => sp.Items)
                    .HasForeignKey(spi => spi.SessionPlanId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Relationship: SessionPlanItem references Task
                entity.HasOne(spi => spi.Task)
                    .WithMany()
                    .HasForeignKey(spi => spi.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Create index for ordering
                entity.HasIndex(spi => new { spi.SessionPlanId, spi.Order });
            });

            // Seed default contexts (5 pre-defined mental modes)
            modelBuilder.Entity<Context>().HasData(
                new Context
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Name = "Deep Work",
                    Description = "Complex problem-solving, coding, writing, research",
                    Color = "#3B82F6",
                    Icon = "brain"
                },
                new Context
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Name = "Meetings",
                    Description = "Collaborative sessions, discussions, video calls",
                    Color = "#10B981",
                    Icon = "users"
                },
                new Context
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    Name = "Admin",
                    Description = "Email management, scheduling, documentation, planning",
                    Color = "#F59E0B",
                    Icon = "clipboard"
                },
                new Context
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Name = "Creative",
                    Description = "Brainstorming, design, prototyping, experimentation",
                    Color = "#8B5CF6",
                    Icon = "palette"
                },
                new Context
                {
                    Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                    Name = "Learning",
                    Description = "Reading, courses, tutorials, skill development",
                    Color = "#EC4899",
                    Icon = "book"
                }
            );
        }
    }
}

