import { useState, useEffect } from 'react';
import { projectService } from '../../services/project.service';
import { renderActivityText, formatActivityTime } from '../../utils/activityFormatters';

export default function TaskDetailsModal({ task, projectMembers, onClose, onEdit, onDelete }) {
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [activityError, setActivityError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      try {
        setLoadingActivities(true);
        // Using project.service.js which we added earlier
        const { activities: data } = await projectService.getProjectActivities(task.project_id, {
          task_id: task.id,
          limit: 50
        });
        if (isMounted) {
          setActivities(data || []);
          setActivityError(null);
        }
      } catch (err) {
        if (isMounted) {
          setActivityError('Failed to load activity history.');
        }
      } finally {
        if (isMounted) {
          setLoadingActivities(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, [task.id, task.project_id]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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

  const getMemberName = (userId) => {
    if (!userId) return null;
    const member = projectMembers.find(m => m.userId === userId);
    return member ? member.fullName : 'Unknown User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'None';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const isOverdue = task.status !== 'COMPLETED' && task.due_date && new Date(task.due_date) < new Date();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
          {/* Header */}
          <div className="bg-white px-6 py-5 border-b border-gray-200 flex justify-between items-start">
            <h3 className="text-xl font-semibold leading-6 text-gray-900 pr-8 break-words">
              {task.title}
            </h3>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="bg-gray-50 px-6 py-6 sm:flex sm:flex-row h-[70vh] overflow-y-auto">
            {/* Left Column: Details */}
            <div className="sm:w-2/3 sm:pr-8">
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <div className="text-sm text-gray-900 bg-white p-4 rounded-md border border-gray-200 min-h-[100px] whitespace-pre-wrap">
                  {task.description || <span className="text-gray-400 italic">No description provided.</span>}
                </div>
              </div>

              <div className="mb-8 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onEdit(); // Trigger edit modal in TaskList
                  }}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onDelete(); // Trigger delete logic
                  }}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Delete
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-4 border-b border-gray-200 pb-2">Activity History</h4>
                
                {loadingActivities ? (
                  <div className="text-sm text-gray-500 text-center py-4">Loading activity...</div>
                ) : activityError ? (
                  <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{activityError}</div>
                ) : activities.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No activity yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {activities.map((activity, idx) => (
                      <li key={activity.id} className="relative flex gap-x-4">
                        {idx !== activities.length - 1 && (
                          <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-4">
                            <div className="w-px bg-gray-200" />
                          </div>
                        )}
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-white">
                          <div className="h-1.5 w-1.5 rounded-full bg-gray-300 ring-1 ring-gray-300" />
                        </div>
                        <div className="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                          <div className="mb-1">{renderActivityText(activity, projectMembers)}</div>
                          <time className="text-xs text-gray-400">
                            {formatActivityTime(activity.created_at)}
                          </time>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Right Column: Meta */}
            <div className="mt-8 sm:mt-0 sm:w-1/3 space-y-6 bg-white p-4 rounded-md border border-gray-200 h-fit">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Status</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Priority</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Assignee</h4>
                <div className="text-sm text-gray-900 font-medium">
                  {getMemberName(task.assignee_id) || <span className="text-gray-400 italic font-normal">Unassigned</span>}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Creator</h4>
                <div className="text-sm text-gray-900">
                  {getMemberName(task.creator_id)}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Due Date
                  {isOverdue && <span className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-700 ring-1 ring-inset ring-red-600/10">⚠ OVERDUE</span>}
                </h4>
                <div className="text-sm text-gray-900">
                  {formatDate(task.due_date)}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Created</h4>
                <div className="text-sm text-gray-500">
                  {formatDate(task.created_at)}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Updated</h4>
                <div className="text-sm text-gray-500">
                  {formatDate(task.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
