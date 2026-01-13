using System;

namespace ContextManager.API.Models
{
    /// <summary>
    /// Represents a user's session plan for a specific date
    /// Stores the AI-generated order of tasks and allows user customization
    /// </summary>
    public class SessionPlan
    {
        /// <summary>
        /// Unique identifier for the session plan
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// ID of the user who owns this session plan
        /// </summary>
        public Guid UserId { get; set; }
        
        /// <summary>
        /// The date this session plan is for (date only, no time)
        /// </summary>
        public DateTime PlanDate { get; set; }
        
        /// <summary>
        /// When the session plan was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// When the session plan was last modified by user
        /// </summary>
        public DateTime? LastModifiedAt { get; set; }
        
        /// <summary>
        /// Whether this is an AI-generated plan or user-modified
        /// </summary>
        public bool IsCustomized { get; set; }
        
        // Navigation properties
        public User User { get; set; } = null!;
        public ICollection<SessionPlanItem> Items { get; set; } = new List<SessionPlanItem>();
    }
    
    /// <summary>
    /// Represents a single task item within a session plan
    /// Tracks the order and grouping of tasks in the session
    /// </summary>
    public class SessionPlanItem
    {
        /// <summary>
        /// Unique identifier for the session plan item
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// ID of the session plan this item belongs to
        /// </summary>
        public Guid SessionPlanId { get; set; }
        
        /// <summary>
        /// ID of the task
        /// </summary>
        public Guid TaskId { get; set; }
        
        /// <summary>
        /// Order/position in the session (0-indexed)
        /// </summary>
        public int Order { get; set; }
        
        /// <summary>
        /// Context group number for visual grouping
        /// Tasks with same context will have same group number
        /// </summary>
        public int GroupNumber { get; set; }
        
        /// <summary>
        /// AI reasoning for including this task in the session
        /// </summary>
        public string Reasoning { get; set; } = string.Empty;
        
        // Navigation properties
        public SessionPlan SessionPlan { get; set; } = null!;
        public Task Task { get; set; } = null!;
    }
}

