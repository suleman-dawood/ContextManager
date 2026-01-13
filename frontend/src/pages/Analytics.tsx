import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { analyticsApi } from '../services/api';
import type { ContextDistribution, CompletionRate } from '../types';
import { AppHeader } from '../components/AppHeader';

/**
 * Analytics page showing productivity insights
 */
export const Analytics = () => {
  const [contextDistribution, setContextDistribution] = useState<ContextDistribution[]>([]);
  const [allTasksDistribution, setAllTasksDistribution] = useState<ContextDistribution[]>([]);
  const [activeTasksDistribution, setActiveTasksDistribution] = useState<ContextDistribution[]>([]);
  const [completionRate, setCompletionRate] = useState<CompletionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    // Update displayed distribution when toggle changes
    if (showActiveOnly) {
      setContextDistribution(activeTasksDistribution);
    } else {
      setContextDistribution(allTasksDistribution);
    }
  }, [showActiveOnly, allTasksDistribution, activeTasksDistribution]);

  const loadAnalytics = async () => {
    try {
      const [allTasks, activeTasks, completion] = await Promise.all([
        analyticsApi.getContextDistribution(false),
        analyticsApi.getContextDistribution(true),
        analyticsApi.getCompletionRate()
      ]);
      setAllTasksDistribution(allTasks);
      setActiveTasksDistribution(activeTasks);
      setContextDistribution(showActiveOnly ? activeTasks : allTasks);
      setCompletionRate(completion);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <AppHeader />

      <div className="container">
        <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--black)' }}>Productivity Analytics</h1>
        <div className="charts-grid">
          {/* Chart 1: Task Distribution by Context */}
          <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
            <h2>Tasks by Context</h2>
            <p className="chart-description">Distribution of your tasks across different mental contexts</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  {showActiveOnly ? 'All Tasks' : 'Active Only'}
                </button>
              </div>
            </div>
            {contextDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contextDistribution}
                    dataKey="count"
                    nameKey="context"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ context, count }) => `${context}: ${count}`}
                  >
                    {contextDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No task data available</div>
            )}
          </div>

          {/* Chart 2: Completion Rate Over Time */}
          <div className="chart-card">
            <h2>Completion Rate (Last 7 Days)</h2>
            <p className="chart-description">Your daily task completion percentage</p>
            {completionRate.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={completionRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => `${value}%`}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#FFD700" 
                    strokeWidth={2}
                    name="Completion Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No completion data available</div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="summary-section">
          <h2>Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-value">
                {contextDistribution.reduce((sum, c) => sum + c.count, 0)}
              </div>
              <div className="summary-label">Total Tasks</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">
                {completionRate.length > 0 
                  ? Math.round(completionRate.reduce((sum, c) => sum + c.rate, 0) / completionRate.length)
                  : 0}%
              </div>
              <div className="summary-label">Avg. Completion Rate</div>
            </div>
            <div className="summary-card">
              <div className="summary-value">{contextDistribution.length}</div>
              <div className="summary-label">Active Contexts</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .analytics-page {
          min-height: 100vh;
          background: var(--white);
        }

        .analytics-header {
          background: var(--white);
          padding: 24px;
          border-bottom: 3px solid var(--black);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .analytics-header h1 {
          font-size: 24px;
          margin: 16px 0 0 0;
          color: var(--black);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }

        .chart-card {
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-card h2 {
          font-size: 18px;
          margin: 0 0 8px 0;
          color: var(--black);
        }

        .chart-description {
          color: var(--black);
          font-size: 14px;
          margin: 0 0 24px 0;
          opacity: 0.7;
        }

        .empty-chart {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--black);
          opacity: 0.5;
        }

        .summary-section {
          margin-top: 32px;
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          padding: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .summary-section h2 {
          font-size: 18px;
          margin: 0 0 20px 0;
          color: var(--black);
          border-bottom: 2px solid var(--black);
          padding-bottom: 12px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .summary-card {
          text-align: center;
          padding: 20px;
          background: var(--white);
          border-radius: 0;
          border: 2px solid var(--black);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .summary-value {
          font-size: 36px;
          font-weight: 700;
          color: var(--accent-yellow);
        }

        .summary-label {
          font-size: 14px;
          color: var(--black);
          margin-top: 8px;
          opacity: 0.7;
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-size: 18px;
          color: var(--black);
        }
      `}</style>
    </div>
  );
};

