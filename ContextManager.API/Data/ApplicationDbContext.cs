using Microsoft.EntityFrameworkCore;
using ContextManager.API.Models;

namespace ContextManager.API.Data
{
    /// manages entity relationships and database operations
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Context> Contexts { get; set; } = null!;
        public DbSet<Models.Task> Tasks { get; set; } = null!;
        public DbSet<SessionPlan> SessionPlans { get; set; } = null!;
        public DbSet<SessionPlanItem> SessionPlanItems { get; set; } = null!;

        /// overrriding SaveChanges to ensure all DateTime values are UTC
        public override int SaveChanges()
        {
            EnsureUtcDates();
            return base.SaveChanges();
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            EnsureUtcDates();
            return await base.SaveChangesAsync(cancellationToken);
        }

        private void EnsureUtcDates()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == Microsoft.EntityFrameworkCore.EntityState.Added || 
                           e.State == Microsoft.EntityFrameworkCore.EntityState.Modified);

            foreach (var entry in entries)
            {
                foreach (var property in entry.Properties)
                {
                    if (property.Metadata.ClrType == typeof(DateTime) || property.Metadata.ClrType == typeof(DateTime?))
                    {
                        if (property.CurrentValue != null && property.CurrentValue is DateTime dateTime)
                        {
                            if (dateTime.Kind != DateTimeKind.Utc)
                            {
                                property.CurrentValue = dateTime.Kind == DateTimeKind.Unspecified
                                    ? DateTime.SpecifyKind(dateTime, DateTimeKind.Utc)
                                    : dateTime.ToUniversalTime();
                            }
                        }
                    }
                }
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // explicitly setting table names due to PostgreSQL case sensitivity
            modelBuilder.Entity<User>().ToTable("Users");
            modelBuilder.Entity<Context>().ToTable("Contexts");
            modelBuilder.Entity<Models.Task>().ToTable("Tasks");
            modelBuilder.Entity<SessionPlan>().ToTable("SessionPlans");
            modelBuilder.Entity<SessionPlanItem>().ToTable("SessionPlanItems");

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique(); 
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            modelBuilder.Entity<Context>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Color).IsRequired().HasMaxLength(7); // hex color
                entity.Property(e => e.Icon).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<Models.Task>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(2000);
                
                entity.HasOne(t => t.User)
                    .WithMany()
                    .HasForeignKey(t => t.UserId)
                    .OnDelete(DeleteBehavior.Cascade); // delete tasks when user is deleted
                
                entity.HasOne(t => t.Context)
                    .WithMany()
                    .HasForeignKey(t => t.ContextId)
                    .OnDelete(DeleteBehavior.Restrict); // don't allow context deletion if tasks exist
            });

            modelBuilder.Entity<SessionPlan>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(sp => sp.User)
                    .WithMany()
                    .HasForeignKey(sp => sp.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // index for querying by user and date
                entity.HasIndex(sp => new { sp.UserId, sp.PlanDate }).IsUnique();
            });

            modelBuilder.Entity<SessionPlanItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Reasoning).HasMaxLength(2000);
                
                entity.HasOne(spi => spi.SessionPlan)
                    .WithMany(sp => sp.Items)
                    .HasForeignKey(spi => spi.SessionPlanId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(spi => spi.Task) // many to many relationship
                    .WithMany()
                    .HasForeignKey(spi => spi.TaskId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasIndex(spi => new { spi.SessionPlanId, spi.Order });
            });

            // 5 pre-defined contexts
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

