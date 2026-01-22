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

            modelBuilder.Entity<Context>(entity =>
            {
                entity.HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(c => new { c.UserId, c.Name }).IsUnique();
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Description).IsRequired().HasMaxLength(200);
                entity.Property(c => c.Color).IsRequired().HasMaxLength(7); // hex color
                entity.Property(c => c.Icon).IsRequired().HasMaxLength(100);
                entity.HasKey(e => e.Id);
            });
        }
    }
}

