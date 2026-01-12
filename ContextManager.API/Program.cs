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
    // Railway format: postgresql://user:pass@host:5432/db
    // Convert to EF Core format: Host=host;Database=db;Username=user;Password=pass
    connectionString = ConvertRailwayConnectionString(connectionString);
}
else
{
    // Use local connection string from appsettings.json
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
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

builder.Services.AddControllers();
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
        db.Database.Migrate();
        Console.WriteLine("✅ Database migrations applied successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Database migration failed: {ex.Message}");
    }
}

// Enable Swagger in all environments (helpful for testing)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Context Manager API v1");
    c.RoutePrefix = string.Empty; // Swagger at root URL
});

// CORS must be very early in the pipeline - before UseAuthentication/UseAuthorization
// This ensures CORS headers are added even to error responses
app.UseCors("AllowFrontend");

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
    var uri = new Uri(railwayUrl);
    var userInfo = uri.UserInfo.Split(':');
    return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
}

