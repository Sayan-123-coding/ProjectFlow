export default function TaskCard({ task, projectMembers, onUpdate, onDelete, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'badge-neutral';
      case 'IN_PROGRESS': return 'badge-blue';
      case 'COMPLETED': return 'badge-green';
      default: return 'badge-neutral';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'badge-neutral';
      case 'MEDIUM': return 'badge-yellow';
      case 'HIGH': return 'badge-orange';
      case 'URGENT': return 'badge-red';
      default: return 'badge-neutral';
    }
  };

  const getAssigneeName = () => {
    if (!task.assignee_id) return 'Unassigned';
    const member = projectMembers.find(m => m.userId === task.assignee_id);
    return member ? member.fullName : 'Unknown User';
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // prevent opening details
    onUpdate(task); 
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // prevent opening details
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  const isOverdue = task.status !== 'COMPLETED' && task.due_date && new Date(task.due_date) < new Date();

  return (
    <div 
      className={`rounded-xl border ${isOverdue ? 'border-red-500/30 bg-[rgba(239,68,68,0.05)]' : 'surface-1'} p-4 hover:border-pf-400/50 hover:shadow-md transition-all duration-200 relative cursor-pointer group`}
      onClick={() => onClick && onClick(task)}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-[15px] font-bold text-pf-100 pr-10 leading-tight">{task.title}</h4>
        <div className="absolute top-3 right-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-pf-900/90 p-1 rounded-md border border-pf-800/50 shadow-sm">
          <button
            onClick={handleEditClick}
            className="text-pf-400 hover:text-pf-100 transition-colors"
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-pf-400 hover:text-red-400 transition-colors"
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
        
      {task.description && (
        <p className="text-[13px] text-pf-400 mb-4 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={getStatusColor(task.status)}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={getPriorityColor(task.priority)}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex justify-between items-end mt-3 border-t border-pf-800/30 pt-3">
        <div className="flex items-center space-x-2.5">
          {/* Avatar simulation */}
          <div className="w-6 h-6 rounded-full bg-pf-600 flex items-center justify-center text-pf-900 font-bold text-[10px]" title={getAssigneeName()}>
            {getAssigneeName().charAt(0).toUpperCase()}
          </div>
          {task.due_date && (
            <div className="flex flex-col">
              <span className={`text-[11px] font-semibold tracking-wide ${isOverdue ? 'text-red-400' : 'text-pf-400'}`}>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        <div className="text-[10px] font-semibold text-pf-600 uppercase tracking-widest">
          {task.id.slice(0, 5)}
        </div>
      </div>
    </div>
  );
}
