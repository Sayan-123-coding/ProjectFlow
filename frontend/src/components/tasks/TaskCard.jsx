export default function TaskCard({ task, projectMembers, onUpdate, onDelete, onClick }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssigneeName = () => {
    if (!task.assignee_id) return 'Unassigned';
    const member = projectMembers.find(m => m.userId === task.assignee_id);
    return member ? member.fullName : 'Unknown User';
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // prevent opening details
    onUpdate(task); // we will refactor the internal state out in a moment
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // prevent opening details
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow relative cursor-pointer"
      onClick={() => onClick && onClick(task)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-lg font-semibold text-gray-900 pr-8">{task.title}</h4>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleEditClick}
            className="text-gray-400 hover:text-indigo-600"
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-gray-400 hover:text-red-600"
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
        
        {task.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
        
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div>
            <span className="block mb-1">Assignee: <span className="font-medium text-gray-700">{getAssigneeName()}</span></span>
            {task.due_date && (
              <span className="block">Due: <span className="font-medium text-gray-700">{new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
            )}
          </div>
          <div>
            Updated: {new Date(task.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
  );
}
