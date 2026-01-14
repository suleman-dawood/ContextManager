import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import type { Task } from '../types';
import { TaskStatus } from '../types';
import '../styles/StatsCards.css';

interface StatsCardsProps {
  tasks: Task[];
}

export const StatsCards = ({ tasks }: StatsCardsProps) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
  const totalMinutes = tasks
    .filter(t => t.status !== TaskStatus.Completed)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="stats-cards grid-auto-fit">
      <div className="stat-card">
        <div className="stat-icon stat-icon-yellow">
          <Clock size={20} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value text-black">{totalTasks}</div>
          <div className="stat-label text-secondary">Total Tasks</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-yellow">
          <CheckCircle2 size={20} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value text-black">{completedTasks}</div>
          <div className="stat-label text-secondary">Completed</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-orange">
          <TrendingUp size={20} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value text-black">{completionRate}%</div>
          <div className="stat-label text-secondary">Completion Rate</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon stat-icon-yellow">
          <Clock size={20} color="#000000" />
        </div>
        <div className="stat-content">
          <div className="stat-value text-black">{Math.round(totalMinutes / 60)}h</div>
          <div className="stat-label text-secondary">Pending Work</div>
        </div>
      </div>
    </div>
  );
};

