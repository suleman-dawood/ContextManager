using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ContextManager.API.Data;
using ContextManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// 1. Configure Database Connection
// ========================================

// Get connection string (Railway or local)
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine($"📦 Found DATABASE_URL environment variable");
    try
    {
        // Railway format: postgresql://user:pass@host:5432/db
        // Convert to EF Core format: Host=host;Database=db;Username=user;Password=pass
        connectionString = ConvertRailwayConnectionString(connectionString);
        Console.WriteLine($"✅ Converted DATABASE_URL successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Failed to convert DATABASE_URL: {ex.Message}");
        throw;
    }
}
else
{
    Console.WriteLine($"⚠️  DATABASE_URL not found, using appsettings.json");
    // Use local connection string from appsettings.json
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrEmpty(connectionString))
    {
        Console.WriteLine($"❌ No connection string found in appsettings.json either!");
    }
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// ========================================
// 2. Configure JWT Authentication
// ========================================

// Get JWT settings from environment variables (Railway) or configuration
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? builder.Configuration["JwtSettings:Secret"] 
    ?? "development-secret-key-minimum-32-chars-long";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "ContextManager";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "ContextManager";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
    };
});

// ========================================
// 3. Register Services
// ========================================

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ClaudeService>();
builder.Services.AddHttpClient(); // For ClaudeService HTTP requests

// ========================================
// 4. Configure CORS (for React frontend)
// ========================================

var allowedOrigins = new List<string>
{
    "http://localhost:3000",   // Local development
    "http://localhost:5173"    // Vite default port
};

// Add Railway frontend URL from environment variable if set
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
if (!string.IsNullOrEmpty(frontendUrl))
{
    allowedOrigins.Add(frontendUrl);
}

// Add common Railway patterns (wildcard doesn't work, so we allow all origins in production)
var isProduction = builder.Configuration["ASPNETCORE_ENVIRONMENT"] == "Production";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (isProduction)
        {
            // In production, allow any Railway domain
            policy.SetIsOriginAllowed(origin =>
            {
                return origin.Contains("railway.app") || 
                       origin.Contains("localhost") ||
                       origin.Contains("127.0.0.1") ||
                       allowedOrigins.Contains(origin) ||
                       (frontendUrl != null && origin == frontendUrl);
            });
        }
        else
        {
            // In development, use specific origins
            policy.WithOrigins(allowedOrigins.ToArray());
        }
        
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// ========================================
// 5. Add Controllers and Swagger
// ========================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Ensure JSON responses work properly
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Context Manager API", 
        Version = "v1",
        Description = "AI-powered task management with mental context classification"
    });

    // Add JWT authentication to Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ========================================
// 6. Build and Configure App
// ========================================

var app = builder.Build();

// Apply database migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        Console.WriteLine("🔄 Attempting database connection...");
        var canConnect = await db.Database.CanConnectAsync();
        if (canConnect)
        {
            Console.WriteLine("✅ Database connection successful!");
            
            // Get pending migrations
            var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
            var pendingList = pendingMigrations.ToList();
            
            if (pendingList.Any())
            {
                Console.WriteLine($"📦 Found {pendingList.Count} pending migration(s):");
                foreach (var migration in pendingList)
                {
                    Console.WriteLine($"   - {migration}");
                }
            }
            else
            {
                Console.WriteLine("✅ No pending migrations");
            }
            
            // Get applied migrations
            var appliedMigrations = await db.Database.GetAppliedMigrationsAsync();
            var appliedList = appliedMigrations.ToList();
            
            if (appliedList.Any())
            {
                Console.WriteLine($"📋 Applied migrations ({appliedList.Count}):");
                foreach (var migration in appliedList)
                {
                    Console.WriteLine($"   - {migration}");
                }
            }
            else
            {
                Console.WriteLine("⚠️  No migrations have been applied yet!");
            }
            
            // Check if tables exist by trying to query Users table
            bool usersTableExists = false;
            try
            {
                await db.Database.ExecuteSqlRawAsync("SELECT 1 FROM \"Users\" LIMIT 1");
                usersTableExists = true;
                Console.WriteLine("✅ Users table exists");
            }
            catch
            {
                usersTableExists = false;
                Console.WriteLine("⚠️  Users table does not exist");
            }
            
            if (!usersTableExists)
            {
                // If tables don't exist, create them using EnsureCreated
                // This will create all tables based on DbContext models
                Console.WriteLine("🔄 Creating database tables (no migrations found)...");
                await db.Database.EnsureCreatedAsync();
                Console.WriteLine("✅ Database tables created successfully");
            }
            else if (pendingList.Any())
            {
                // Tables exist but there are pending migrations - apply them
                Console.WriteLine("🔄 Applying pending migrations...");
                await db.Database.MigrateAsync();
                Console.WriteLine("✅ Migrations applied successfully");
            }
            else
            {
                Console.WriteLine("✅ Database is up to date");
            }
        }
        else
        {
            Console.WriteLine("❌ Cannot connect to database");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database connection/migration failed:");
        Console.WriteLine($"   Error: {ex.Message}");
        Console.WriteLine($"   Type: {ex.GetType().Name}");
        if (ex.InnerException != null)
        {
            Console.WriteLine($"   Inner: {ex.InnerException.Message}");
        }
        // Don't throw - let the app start anyway
    }
}

// CORS must be THE FIRST middleware - before everything else
// This ensures CORS headers are added to ALL responses, including errors
app.UseCors("AllowFrontend");

// Global exception handler to ensure CORS headers on errors
app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        var errorMessage = exception?.Message ?? "An internal server error occurred";
        
        // Log the error
        Console.WriteLine($"❌ Unhandled exception: {errorMessage}");
        if (exception != null)
        {
            Console.WriteLine($"   Stack trace: {exception.StackTrace}");
        }
        
        // Response already has CORS headers from UseCors middleware above
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
        {
            message = errorMessage,
            error = app.Environment.IsDevelopment() ? exception?.ToString() : null
        }));
    });
});

// Enable Swagger in all environments (helpful for testing)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Context Manager API v1");
    c.RoutePrefix = string.Empty; // Swagger at root URL
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

Console.WriteLine($"🚀 Context Manager API starting...");
Console.WriteLine($"📊 Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"🗄️  Database: {(connectionString?.Contains("railway") == true ? "Railway PostgreSQL" : "Local PostgreSQL")}");

app.Run();

// ========================================
// Helper Method for Railway Connection
// ========================================

/// <summary>
/// Converts Railway's DATABASE_URL format to Entity Framework connection string
/// </summary>
string ConvertRailwayConnectionString(string railwayUrl)
{
    try
    {
        var uri = new Uri(railwayUrl);
        var userInfo = uri.UserInfo.Split(':');
        
        // Handle URL-encoded passwords (common in Railway)
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        
        var database = uri.AbsolutePath.TrimStart('/');
        
        var connectionString = $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
        
        Console.WriteLine($"🔗 Connecting to database: {uri.Host}:{uri.Port}/{database} as {username}");
        
        return connectionString;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error parsing DATABASE_URL: {ex.Message}");
        Console.WriteLine($"   DATABASE_URL format: postgresql://user:pass@host:port/dbname");
        throw;
    }
}

