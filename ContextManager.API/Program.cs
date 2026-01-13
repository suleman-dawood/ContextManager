using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ContextManager.API.Data;
using ContextManager.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
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

// Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ClaudeService>();
builder.Services.AddHttpClient();

// CORS Configuration
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

// Controllers and Swagger
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "Context Manager API", 
        Version = "v1",
        Description = "AI-powered task management with mental context classification"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Initialize database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    try
    {
        await db.Database.ExecuteSqlRawAsync("SELECT 1 FROM \"Users\" LIMIT 1");
    }
    catch
    {
        // Database not initialized - run SQL script
        var sqlPath = Path.Combine(AppContext.BaseDirectory, "Scripts", "init.sql");
        if (!File.Exists(sqlPath))
        {
            sqlPath = Path.Combine(Directory.GetCurrentDirectory(), "Scripts", "init.sql");
        }
        
        if (File.Exists(sqlPath))
        {
            var sql = await File.ReadAllTextAsync(sqlPath);
            await db.Database.ExecuteSqlRawAsync(sql);
        }
        else
        {
            await db.Database.EnsureCreatedAsync();
        }
    }
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
        
        // Log the full error for debugging
        Console.WriteLine($"Unhandled exception: {exception?.GetType().Name}: {errorMessage}");
        if (exception?.InnerException != null)
        {
            Console.WriteLine($"Inner exception: {exception.InnerException.Message}");
        }
        Console.WriteLine($"Stack trace: {exception?.StackTrace}");
        
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
        {
            message = errorMessage,
            error = app.Environment.IsDevelopment() ? exception?.ToString() : null
        }));
    });
});

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Context Manager API v1");
    c.RoutePrefix = string.Empty;
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

