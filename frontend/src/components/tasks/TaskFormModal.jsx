import { useState, useEffect } from 'react';
import { taskService } from '../../services/task.service';

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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h3>
              
              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">Task Title</label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="title"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm sm:leading-6 border"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm sm:leading-6 border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isEditing && (
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                      <div className="mt-2">
                        <select
                          id="status"
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm border"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium leading-6 text-gray-900">Priority</label>
                    <div className="mt-2">
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm border"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="assignee_id" className="block text-sm font-medium leading-6 text-gray-900">Assignee</label>
                    <div className="mt-2">
                      <select
                        id="assignee_id"
                        name="assignee_id"
                        value={formData.assignee_id}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-gray-900 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm border"
                      >
                        <option value="">Unassigned</option>
                        {projectMembers.map(m => (
                          <option key={m.userId} value={m.userId}>{m.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium leading-6 text-gray-900">Due Date</label>
                    <div className="mt-2">
                      <input
                        type="date"
                        id="due_date"
                        name="due_date"
                        value={formData.due_date}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 py-1.5 px-3 text-gray-900 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm sm:leading-6 border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:bg-indigo-400"
              >
                {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Task')}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
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
