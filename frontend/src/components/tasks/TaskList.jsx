import { useState, useEffect } from 'react';
import { taskService } from '../../services/task.service';
import { projectMemberService } from '../../services/projectMember.service';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';
import TaskFormModal from './TaskFormModal';
import KanbanBoard from './KanbanBoard';
import TaskDetailsModal from './TaskDetailsModal';

export default function TaskList({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'

  // Pagination & Filters State
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignee_id: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  useEffect(() => {
    // Fetch project members once for assignee mapping
    const fetchMembers = async () => {
      try {
        const { members } = await projectMemberService.getProjectMembers(projectId);
        setProjectMembers(members || []);
      } catch (err) {
        console.error('Failed to load project members for tasks', err);
      }
    };
    if (projectId) fetchMembers();
  }, [projectId]);

  useEffect(() => {
    // Implement debounce for search or just fetch when filters change
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, filters.search, filters.status, filters.priority, filters.assignee_id, filters.sortBy, filters.sortOrder, pagination.page]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const { tasks: data, pagination: pag } = await taskService.getTasks(projectId, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      setTasks(data || []);
      setPagination(pag);
    } catch (err) {
      if (err.status === 403) {
        setError("You don't have permission to access these tasks.");
      } else {
        setError("Unable to load tasks.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleTaskCreated = (newTask) => {
    setShowCreateModal(false);
    fetchTasks();
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditTask(null);
    if (selectedTask && selectedTask.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleTaskDeleted = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(null);
      }
      fetchTasks(); // Re-fetch to update pagination
    } catch (err) {
      if (err.status === 403) {
        alert("Only managers can delete tasks");
      } else {
        alert(err.message || 'Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus, oldStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const { task: updatedTask } = await taskService.updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err) {
      // Rollback on failure
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: oldStatus } : t));
      alert(err.message || 'Failed to update task status. Your changes were not saved.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-xl font-bold leading-6 text-white tracking-wide">Tasks</h3>
        
        <div className="flex items-center space-x-4">
          <div className="inline-flex rounded-lg shadow-sm border border-white/10 p-1 bg-zinc-900/50" role="group">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'board' ? 'bg-zinc-800 text-orange-500 shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Board
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            type="button"
            className="btn-primary"
          >
            + New Task
          </button>
        </div>
      </div>

      <TaskFilters 
        filters={filters} 
        onChange={handleFilterChange} 
        projectMembers={projectMembers} 
      />

      {error && (
        <div className="rounded-xl bg-red-900/20 border border-red-900/30 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && tasks.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Loading tasks...</div>
      ) : !loading && tasks.length === 0 ? (
        <div className="text-center rounded-2xl border-2 border-dashed border-white/10 bg-zinc-900/30 p-12 backdrop-blur-sm">
          <p className="mt-1 text-sm text-gray-400">
            {Object.values(filters).some(v => v !== '' && v !== 'created_at' && v !== 'desc') 
              ? "No tasks found matching your filters." 
              : "This project doesn't have any tasks yet. Create your first task."}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {tasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  projectMembers={projectMembers}
                  onUpdate={setEditTask}
                  onDelete={handleTaskDeleted}
                  onClick={setSelectedTask}
                />
              ))}
            </div>
          ) : (
            <KanbanBoard 
              tasks={tasks}
              projectMembers={projectMembers}
              onUpdate={setEditTask}
              onDelete={handleTaskDeleted}
              onStatusChange={handleStatusChange}
              onClick={setSelectedTask}
            />
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 glass-panel px-4 py-3 sm:px-6 rounded-2xl mt-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn-secondary"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="btn-secondary"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium text-white">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-zinc-900 border-y border-white/10">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 bg-zinc-900 border border-white/10 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <TaskFormModal
          projectId={projectId}
          projectMembers={projectMembers}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {editTask && (
        <TaskFormModal
          task={editTask}
          projectId={projectId}
          projectMembers={projectMembers}
          onClose={() => setEditTask(null)}
          onSuccess={handleTaskUpdated}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          projectMembers={projectMembers}
          onClose={() => setSelectedTask(null)}
          onEdit={() => setEditTask(selectedTask)}
          onDelete={() => handleTaskDeleted(selectedTask.id)}
        />
      )}
    </div>
  );
}
