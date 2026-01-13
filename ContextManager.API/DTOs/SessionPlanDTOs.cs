using System;
using System.Collections.Generic;

namespace ContextManager.API.DTOs
{
    public class GenerateSessionPlanRequest
    {
        public DateTime PlanDate { get; set; }
    }
    
    public class UpdateSessionPlanOrderRequest
    {
        public List<Guid> TaskIds { get; set; } = new();
    }
    
    public class SessionPlanResponse
    {
        public Guid Id { get; set; }
        public DateTime PlanDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastModifiedAt { get; set; }
        public bool IsCustomized { get; set; }
        public List<SessionPlanItemResponse> Items { get; set; } = new();
        public int TotalEstimatedMinutes { get; set; }
    }
    
    public class SessionPlanItemResponse
    {
        public Guid Id { get; set; }
        public TaskResponse Task { get; set; } = null!;
        public int Order { get; set; }
        public int GroupNumber { get; set; }
        public string Reasoning { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
    }
}

