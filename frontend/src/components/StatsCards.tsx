import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import type { Task } from '../types';
import { TaskStatus } from '../types';

interface StatsCardsProps {
  tasks: Task[];
}

/**
 * Dashboard stats cards showing key metrics
 */
export const StatsCards = ({ tasks }: StatsCardsProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
  const totalMinutes = tasks
    .filter(t => t.status !== TaskStatus.Completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="stats-cards">
      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#FFD700' }}>
          <Clock size={24} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#FFD700' }}>
          <CheckCircle2 size={24} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value">{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#FF8C00' }}>
          <TrendingUp size={24} color="#FFFFFF" />
        </div>
        <div className="stat-content">
          <div className="stat-value">{completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon" style={{ background: '#FFD700' }}>
          <Clock size={24} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value">{Math.round(totalMinutes / 60)}h</div>
          <div className="stat-label">Pending Work</div>
        </div>
      </div>

      <style>{`
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0;
          border: 2px solid var(--black);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--black);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--black);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

