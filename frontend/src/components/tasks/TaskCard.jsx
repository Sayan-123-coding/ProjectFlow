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
      className={`rounded-xl border ${isOverdue ? 'border-red-500/50 bg-red-950/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10 glass-panel'} p-4 hover:border-pf-400/50 hover:shadow-[0_10px_20px_rgba(0,51,255,0.15)] hover:-translate-y-1 transition-all duration-300 relative cursor-pointer group overflow-hidden`}
      onClick={() => onClick && onClick(task)}
    >
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h4 className="text-[15px] font-extrabold text-white pr-10 leading-tight drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all">{task.title}</h4>
        <div className="absolute top-3 right-3 flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10 shadow-sm">
          <button
            onClick={handleEditClick}
            className="text-pf-400 hover:text-white transition-colors"
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-pf-400 hover:text-red-400 hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-all"
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
        
      {task.description && (
        <p className="text-[13px] font-medium text-pf-200/80 mb-4 line-clamp-2 leading-relaxed relative z-10">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4 relative z-10">
        <span className={`${getStatusColor(task.status)} drop-shadow-sm`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`${getPriorityColor(task.priority)} drop-shadow-sm`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex justify-between items-end mt-3 border-t border-white/10 pt-3 relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* Avatar simulation */}
          <div className="w-6 h-6 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white font-extrabold text-[10px] shadow-[0_0_8px_rgba(151,125,255,0.2)]" title={getAssigneeName()}>
            {getAssigneeName().charAt(0).toUpperCase()}
          </div>
          {task.due_date && (
            <div className="flex flex-col">
              <span className={`text-[11px] font-bold tracking-widest uppercase drop-shadow-sm ${isOverdue ? 'text-red-400' : 'text-pf-400'}`}>
                {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
        <div className="text-[10px] font-bold text-pf-600/70 uppercase tracking-widest">
          {task.id.slice(0, 5)}
        </div>
      </div>
    </div>
  );
}
