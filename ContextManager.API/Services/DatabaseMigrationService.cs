using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;

namespace ContextManager.API.Services
{
    /// responsible for running database migrations in order
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

        public async Task MigrateAsync()
        {
            try
            {
                // ensure database exists
                var canConnect = await _db.Database.CanConnectAsync();
                
                if (!canConnect)
                {
                    _logger.LogInformation("Database does not exist. Creating database...");
                    await _db.Database.EnsureCreatedAsync();
                }

                await EnsureMigrationTrackingTableAsync();
                var migrationScripts = GetMigrationScripts();

                foreach (var script in migrationScripts)
                {
                    if (script.Name.StartsWith("000_"))
                    {
                        continue;
                    }

                    var migrationId = ExtractMigrationId(script.Name);

                    if (await IsMigrationAppliedAsync(migrationId))
                    {
                        _logger.LogDebug("Migration already applied: {MigrationId}", migrationId);
                        continue;
                    }

                    _logger.LogInformation("Applying migration: {MigrationId}", migrationId);
                    await RunMigrationScriptAsync(script.FullName);

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
                    // table might already exist, ignore
                }
            }
        }

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
                // return false to run migrations
                return false;
            }
        }

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

        private async Task RunMigrationScriptAsync(string scriptPath)
        {
            if (!File.Exists(scriptPath))
            {
                throw new FileNotFoundException($"Migration script not found: {scriptPath}");
            }

            var sql = await File.ReadAllTextAsync(scriptPath);
            await _db.Database.ExecuteSqlRawAsync(sql);
        }

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

        private string ExtractMigrationId(string filename)
        {
            return Path.GetFileNameWithoutExtension(filename);
        }

        private string GetScriptPath(string scriptName)
        {
            var scriptsDir = GetScriptsDirectory();
            return Path.Combine(scriptsDir, scriptName);
        }

        private string GetScriptsDirectory()
        {
            var baseDirectory = AppContext.BaseDirectory;
            var currentDirectory = Directory.GetCurrentDirectory();
            
            var possiblePaths = new[]
            {
                Path.Combine(baseDirectory, "Scripts"),
                Path.Combine(currentDirectory, "Scripts"),
                Path.Combine(currentDirectory, "..", "Scripts"),
                Path.Combine(baseDirectory, "..", "..", "..", "Scripts"),
            };

            foreach (var path in possiblePaths)
            {
                if (Directory.Exists(path))
                {
                    return path;
                }
            }

            return possiblePaths[0];
        }
    }
}
