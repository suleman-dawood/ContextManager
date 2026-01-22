using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ContextManager.API.Data;
using ContextManager.API.DTOs;
using ContextManager.API.Models;


namespace ContextManager.API.Services
{
    public class ContextService 
    {
        private readonly ApplicationDbContext _db;
        private const int max_contexts = 10;
        private const int min_contexts = 3;

        public ContextService(ApplicationDbContext db)
        {
            _db = db;
        }
    
        public async Task<List<ContextResponse>> GetContextsAsync(Guid userId)
        {
            var contexts = await _db.Contexts.Where(c => c.UserId == userId).ToListAsync();
            return contexts.Select(MapToDTO).ToList();
        }

        public async Task<ContextResponse> GetContextAsync(Guid userId, Guid contextId)
        {
            var context = await _db.Contexts.FirstOrDefaultAsync(c => c.Id == contextId && c.UserId == userId);
            if (context == null)
            {
                throw new InvalidOperationException("Context not found");
            }
            return MapToDTO(context);
        }

        public async Task<ContextResponse> CreateContextAsync(Guid userId, CreateContextRequest request)
        {
            var context = new Context { Id = Guid.NewGuid(), UserId = userId, Name = request.Name, Description = request.Description, Color = request.Color, Icon = request.Icon };
            var contextCount = await _db.Contexts.CountAsync(c => c.UserId == userId);
            if (await _db.Contexts.AnyAsync(c => c.UserId == userId && c.Id != context.Id && c.Name == request.Name))
            {
                throw new InvalidOperationException("Context with this name already exists");
            }
            if (contextCount >= max_contexts)
            {
                throw new InvalidOperationException("Maximum number of contexts reached");
            }

            _db.Contexts.Add(context);
            await _db.SaveChangesAsync();
            return MapToDTO(context);
        }

        public async Task<ContextResponse> UpdateContextAsync(Guid userId, Guid contextId, UpdateContextRequest request)
        {
            var context = await _db.Contexts.FirstOrDefaultAsync(c => c.Id == contextId && c.UserId == userId);
            if (context == null)
            {
                throw new InvalidOperationException("Context not found");
            }
            if (await _db.Contexts.AnyAsync(c => c.UserId == userId && c.Id != contextId && c.Name == request.Name))
            {
                throw new InvalidOperationException("Context with this name already exists");
            }
            context.Name = request.Name;
            context.Description = request.Description;
            context.Color = request.Color;
            context.Icon = request.Icon;
            await _db.SaveChangesAsync();
            return MapToDTO(context);
        }

        // Use fully-qualified Task here to avoid conflict with Models.Task.
        public async System.Threading.Tasks.Task DeleteContextAsync(Guid userId, Guid contextId)
        {
            var context = await _db.Contexts.FirstOrDefaultAsync(c => c.Id == contextId && c.UserId == userId);
            var contextCount = await _db.Contexts.CountAsync(c => c.UserId == userId);
            if (context == null)
            {
                throw new InvalidOperationException("Context not found");
            }
            if (contextCount <= min_contexts)
            {
                throw new InvalidOperationException("Minimum number of contexts reached");
            }
            if (await _db.Tasks.AnyAsync(t => t.ContextId == contextId && t.UserId == userId))
            {
                throw new InvalidOperationException("Context has tasks assigned to it. Delete them before deleting context.");
            }
            _db.Contexts.Remove(context);
            await _db.SaveChangesAsync();
        }

        private ContextResponse MapToDTO(Context context)
        {
            return new ContextResponse { Id = context.Id, Name = context.Name, Description = context.Description, Color = context.Color, Icon = context.Icon };
        }
    }
}