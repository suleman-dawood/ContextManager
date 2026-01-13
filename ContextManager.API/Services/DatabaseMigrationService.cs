using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;

namespace ContextManager.API.Services
{
    /// <summary>
    /// Service responsible for running database migrations in order
    /// Tracks applied migrations to avoid re-running them
    /// </summary>
    public class DatabaseMigrationService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<DatabaseMigrationService> _logger;

        public DatabaseMigrationService(
            ApplicationDbContext db,
            ILogger<DatabaseMigrationService> logger)
        {
            _db = db;
            _logger = logger;
        }

        /// <summary>
        /// Ensures database is initialized and all migrations are applied
        /// Migrations are run in numerical order and only once
        /// </summary>
        public async Task MigrateAsync()
        {
            try
            {
                // Ensure database exists
                var canConnect = await _db.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    _logger.LogInformation("Database does not exist. Creating database...");
                    await _db.Database.EnsureCreatedAsync();
                }

                // Create migration tracking table first
                await EnsureMigrationTrackingTableAsync();

                // Get all migration scripts in order (numbered: 000_, 001_, 002_, etc.)
                var migrationScripts = GetMigrationScripts();

                foreach (var script in migrationScripts)
                {
                    // Skip migration tracking script (000_) - it's handled separately
                    if (script.Name.StartsWith("000_"))
                    {
                        continue;
                    }

                    var migrationId = ExtractMigrationId(script.Name);

                    // Check if migration has already been applied
                    if (await IsMigrationAppliedAsync(migrationId))
                    {
                        _logger.LogDebug("Migration already applied: {MigrationId}", migrationId);
                        continue;
                    }

                    // Run the migration
                    _logger.LogInformation("Applying migration: {MigrationId}", migrationId);
                    await RunMigrationScriptAsync(script.FullName);

                    // Record migration as applied
                    await RecordMigrationAppliedAsync(migrationId);
                    _logger.LogInformation("Migration completed: {MigrationId}", migrationId);
                }

                _logger.LogInformation("All migrations completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during database migration");
                throw;
            }
        }

        /// <summary>
        /// Ensures the migration tracking table exists
        /// </summary>
        private async Task EnsureMigrationTrackingTableAsync()
        {
            var trackingScriptPath = GetScriptPath("000_migration_tracking.sql");
            
            if (File.Exists(trackingScriptPath))
            {
                try
                {
                    var sql = await File.ReadAllTextAsync(trackingScriptPath);
                    await _db.Database.ExecuteSqlRawAsync(sql);
                }
                catch
                {
                    // Table might already exist, ignore
                }
            }
        }

        /// <summary>
        /// Checks if a migration has already been applied
        /// </summary>
        private async Task<bool> IsMigrationAppliedAsync(string migrationId)
        {
            try
            {
                var connection = _db.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                using var command = connection.CreateCommand();
                command.CommandText = @"SELECT COUNT(*) FROM ""__Migrations"" WHERE ""MigrationId"" = $1";
                var param = command.CreateParameter();
                param.ParameterName = "$1";
                param.Value = migrationId;
                command.Parameters.Add(param);
                
                var count = await command.ExecuteScalarAsync();
                var exists = Convert.ToInt64(count) > 0;
                
                return exists;
            }
            catch
            {
                // If query fails, migration table might not exist yet - return false to run migrations
                return false;
            }
        }

        /// <summary>
        /// Records that a migration has been applied
        /// </summary>
        private async Task RecordMigrationAppliedAsync(string migrationId)
        {
            try
            {
                var connection = _db.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }

                using var command = connection.CreateCommand();
                command.CommandText = @"INSERT INTO ""__Migrations"" (""MigrationId"", ""AppliedAt"") VALUES ($1, $2) ON CONFLICT (""MigrationId"") DO NOTHING";
                
                var param1 = command.CreateParameter();
                param1.ParameterName = "$1";
                param1.Value = migrationId;
                command.Parameters.Add(param1);
                
                var param2 = command.CreateParameter();
                param2.ParameterName = "$2";
                param2.Value = DateTime.UtcNow;
                command.Parameters.Add(param2);
                
                await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to record migration {MigrationId} - it may already be recorded", migrationId);
            }
        }

        /// <summary>
        /// Runs a migration script
        /// </summary>
        private async Task RunMigrationScriptAsync(string scriptPath)
        {
            if (!File.Exists(scriptPath))
            {
                throw new FileNotFoundException($"Migration script not found: {scriptPath}");
            }

            var sql = await File.ReadAllTextAsync(scriptPath);
            await _db.Database.ExecuteSqlRawAsync(sql);
        }

        /// <summary>
        /// Gets all migration scripts from the Scripts directory
        /// Returns them sorted by filename (numerical order)
        /// </summary>
        private List<FileInfo> GetMigrationScripts()
        {
            var scriptsDirectory = GetScriptsDirectory();
            if (!Directory.Exists(scriptsDirectory))
            {
                _logger.LogWarning("Scripts directory not found: {Directory}", scriptsDirectory);
                return new List<FileInfo>();
            }

            var scripts = Directory.GetFiles(scriptsDirectory, "*.sql")
                .Where(f => Path.GetFileName(f).StartsWith("0"))
                .Select(f => new FileInfo(f))
                .OrderBy(f => f.Name)
                .ToList();

            return scripts;
        }

        /// <summary>
        /// Extracts migration ID from script filename
        /// Example: "001_init.sql" -> "001_init"
        /// </summary>
        private string ExtractMigrationId(string filename)
        {
            return Path.GetFileNameWithoutExtension(filename);
        }

        /// <summary>
        /// Gets the path to a specific script file
        /// </summary>
        private string GetScriptPath(string scriptName)
        {
            var scriptsDir = GetScriptsDirectory();
            return Path.Combine(scriptsDir, scriptName);
        }

        /// <summary>
        /// Gets the Scripts directory path
        /// Tries multiple locations for flexibility
        /// </summary>
        private string GetScriptsDirectory()
        {
            var baseDirectory = AppContext.BaseDirectory;
            var currentDirectory = Directory.GetCurrentDirectory();
            
            var possiblePaths = new[]
            {
                Path.Combine(baseDirectory, "Scripts"),
                Path.Combine(currentDirectory, "Scripts"),
                Path.Combine(currentDirectory, "..", "Scripts"),
                Path.Combine(baseDirectory, "..", "..", "..", "Scripts"), // For bin/Debug/net8.0
            };

            foreach (var path in possiblePaths)
            {
                if (Directory.Exists(path))
                {
                    return path;
                }
            }

            // Return first path as default (will show error if doesn't exist)
            return possiblePaths[0];
        }
    }
}
