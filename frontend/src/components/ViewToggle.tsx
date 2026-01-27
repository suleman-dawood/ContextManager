import '../styles/ViewToggle.css';

interface ViewToggleProps {
  activeView: string;
  views: Array<{ id: string; label: string }>;
  onViewChange: (viewId: string) => void;
}

export function ViewToggle({ activeView, views, onViewChange }: ViewToggleProps) {
  return (
    <div className="view-toggle">
      {views.map((view) => (
        <button
          key={view.id}
          className={activeView === view.id ? 'view-toggle-btn view-toggle-btn-active' : 'view-toggle-btn'}
          onClick={() => onViewChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
