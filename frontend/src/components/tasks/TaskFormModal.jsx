export default function TaskFormModal({ task, projectId, projectMembers, onClose, onSuccess }) {
  const isEditing = !!task;
  
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '' // Format for date input
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Clean data
      const dataToSubmit = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || null,
        due_date: formData.due_date || null
      };

      if (isEditing) {
        const { task: updatedTask } = await taskService.updateTask(task.id, dataToSubmit);
        onSuccess(updatedTask);
      } else {
        const { task: newTask } = await taskService.createTask(projectId, dataToSubmit);
        onSuccess(newTask);
      }
    } catch (err) {
      if (err.status === 403) {
        setError('You do not have permission to perform this action.');
      } else {
        setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} task`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-pf-900/80 backdrop-blur-md transition-opacity" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-2xl surface-2 border border-pf-600/20 text-left transition-all sm:my-8 sm:w-full sm:max-w-2xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="px-6 pb-6 pt-6">
              <h3 className="text-xl font-bold leading-6 text-pf-100 mb-5 tracking-wide">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h3>
              
              {error && (
                <div className="mb-5 rounded-xl bg-[rgba(239,68,68,0.1)] p-4 text-sm text-[rgba(248,113,113,0.9)] border border-[rgba(239,68,68,0.2)]">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold leading-6 text-pf-200">Task Title</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="input-dark w-full"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold leading-6 text-pf-200">Description</label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className="input-dark w-full resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {isEditing && (
                    <div>
                      <label htmlFor="status" className="block text-sm font-semibold leading-6 text-pf-200">Status</label>
                      <div className="mt-2">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="input-dark w-full"
                        >
                          <option value="TODO" className="bg-pf-900">To Do</option>
                          <option value="IN_PROGRESS" className="bg-pf-900">In Progress</option>
                          <option value="COMPLETED" className="bg-pf-900">Completed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold leading-6 text-pf-200">Priority</label>
                    <div className="mt-2">
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="input-dark w-full"
                      >
                        <option value="LOW" className="bg-pf-900">Low</option>
                        <option value="MEDIUM" className="bg-pf-900">Medium</option>
                        <option value="HIGH" className="bg-pf-900">High</option>
                        <option value="URGENT" className="bg-pf-900">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assignee_id" className="block text-sm font-semibold leading-6 text-pf-200">Assignee</label>
                    <div className="mt-2">
                      <select
                        id="assignee_id"
                        name="assignee_id"
                        value={formData.assignee_id}
                        onChange={handleChange}
                        className="input-dark w-full"
                      >
                        <option value="" className="bg-pf-900">Unassigned</option>
                        {projectMembers.map(m => (
                          <option key={m.userId} value={m.userId} className="bg-pf-900">{m.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="due_date" className="block text-sm font-semibold leading-6 text-pf-200">Due Date</label>
                    <div className="mt-2">
                      <input
                        type="date"
                        id="due_date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        className="input-dark w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 bg-pf-900/50 sm:flex sm:flex-row-reverse border-t border-pf-800/50">
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="btn-primary w-full sm:ml-3 sm:w-auto"
              >
                {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
