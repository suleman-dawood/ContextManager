import '../styles/StatusFilter.css';

interface StatusFilterProps {
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export function StatusFilter({
  selectedStatus,
  onSelectStatus
}: StatusFilterProps) {
  const statusOptions = [
    { key: 'all', label: 'All' },
    { key: 'inprogress', label: 'In Progress' },
    { key: 'todo', label: 'To Do' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'completed', label: 'Done' }
  ];

  return (
    <div className="status-filter">
      {statusOptions.map(option => (
        <button
          key={option.key}
          type="button"
          className={
            selectedStatus === option.key
              ? 'status-filter-btn active'
              : 'status-filter-btn'
          }
          onClick={() => onSelectStatus(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
