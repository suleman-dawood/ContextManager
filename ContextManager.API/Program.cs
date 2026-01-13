using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ContextManager.API.Data;
using ContextManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrEmpty(connectionString))
{
    connectionString = ConvertRailwayConnectionString(connectionString);
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Database connection string not configured");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
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

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ClaudeService>();
builder.Services.AddScoped<SessionPlanService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<DatabaseMigrationService>();
builder.Services.AddHttpClient();

// CORS config
var allowedOrigins = new List<string> { "http://localhost:3000", "http://localhost:5173" };
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
if (!string.IsNullOrEmpty(frontendUrl))
{
    allowedOrigins.Add(frontendUrl);
}

var isProduction = builder.Configuration["ASPNETCORE_ENVIRONMENT"] == "Production";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (isProduction)
        {
            policy.SetIsOriginAllowed(origin =>
                origin.Contains("railway.app") || 
                origin.Contains("localhost") ||
                origin.Contains("127.0.0.1") ||
                allowedOrigins.Contains(origin) ||
                (frontendUrl != null && origin == frontendUrl));
        }
        else
        {
            policy.WithOrigins(allowedOrigins.ToArray());
        }
        
        policy.AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

var app = builder.Build();

// database migrations on startup
using (var scope = app.Services.CreateScope())
{
    var migrationService = scope.ServiceProvider.GetRequiredService<DatabaseMigrationService>();
    await migrationService.MigrateAsync();
}

app.UseCors("AllowFrontend");

app.UseExceptionHandler(appBuilder =>
{
    appBuilder.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        
        var exception = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>()?.Error;
        var errorMessage = exception?.Message ?? "An internal server error occurred";
        
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
        {
            message = errorMessage,
            error = app.Environment.IsDevelopment() ? exception?.ToString() : null
        }));
    });
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();

string ConvertRailwayConnectionString(string railwayUrl)
{
    var uri = new Uri(railwayUrl);
    var userInfo = uri.UserInfo.Split(':');
    var username = Uri.UnescapeDataString(userInfo[0]);
    var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    var database = uri.AbsolutePath.TrimStart('/');
    
    return $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}

