using System;
using System.Collections.Generic;

namespace ContextManager.API.DTOs
{
    /// <summary>
    /// Request to generate a new AI-powered session plan for a specific date
    /// </summary>
    public class GenerateSessionPlanRequest
    {
        /// <summary>
        /// The date to generate the session plan for
        /// </summary>
        public DateTime PlanDate { get; set; }
    }
    
    /// <summary>
    /// Request to update the order of tasks in a session plan
    /// </summary>
    public class UpdateSessionPlanOrderRequest
    {
        /// <summary>
        /// Array of task IDs in the new desired order
        /// </summary>
        public List<Guid> TaskIds { get; set; } = new();
    }
    
    /// <summary>
    /// Response containing a session plan with ordered tasks
    /// </summary>
    public class SessionPlanResponse
    {
        /// <summary>
        /// Unique identifier for the session plan
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// The date this session plan is for
        /// </summary>
        public DateTime PlanDate { get; set; }
        
        /// <summary>
        /// When the plan was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// When the plan was last modified by user
        /// </summary>
        public DateTime? LastModifiedAt { get; set; }
        
        /// <summary>
        /// Whether this plan has been customized by the user
        /// </summary>
        public bool IsCustomized { get; set; }
        
        /// <summary>
        /// Ordered list of tasks in the session plan
        /// </summary>
        public List<SessionPlanItemResponse> Items { get; set; } = new();
        
        /// <summary>
        /// Total estimated time for all tasks in minutes
        /// </summary>
        public int TotalEstimatedMinutes { get; set; }
    }
    
    /// <summary>
    /// A single task item within a session plan
    /// </summary>
    public class SessionPlanItemResponse
    {
        /// <summary>
        /// Unique identifier for the session plan item
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// The task details
        /// </summary>
        public TaskResponse Task { get; set; } = null!;
        
        /// <summary>
        /// Order/position in the session (0-indexed)
        /// </summary>
        public int Order { get; set; }
        
        /// <summary>
        /// Context group number for visual grouping
        /// </summary>
        public int GroupNumber { get; set; }
        
        /// <summary>
        /// AI reasoning for including this task
        /// </summary>
        public string Reasoning { get; set; } = string.Empty;
        
        /// <summary>
        /// Start time for this task (e.g., "9:00 AM")
        /// </summary>
        public string StartTime { get; set; } = string.Empty;
        
        /// <summary>
        /// End time for this task (e.g., "10:30 AM")
        /// </summary>
        public string EndTime { get; set; } = string.Empty;
    }
}

