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
          className="fixed inset-0 bg-pf-900/80 backdrop-blur-md transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        <div className="relative transform overflow-hidden rounded-2xl surface-2 border border-pf-600/20 text-left transition-all sm:my-8 sm:w-full sm:max-w-3xl shadow-2xl">
          {/* Header */}
          <div className="px-6 py-5 border-b border-pf-800/50 flex justify-between items-start bg-pf-900/40">
            <h3 className="text-xl font-bold leading-6 text-pf-100 pr-8 break-words tracking-wide">
              {task.title}
            </h3>
            <button
              type="button"
              className="rounded-full text-pf-400 hover:text-pf-100 p-1 hover:bg-pf-800/50 transition-colors focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 sm:flex sm:flex-row h-[70vh] overflow-y-auto">
            {/* Left Column: Details */}
            <div className="sm:w-2/3 sm:pr-8">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-pf-200 mb-2">Description</h4>
                <div className="text-[13px] text-pf-400 bg-pf-900/30 p-4 rounded-xl border border-pf-800/30 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                  {task.description || <span className="text-pf-600 italic font-medium">No description provided.</span>}
                </div>
              </div>

              <div className="mb-8 flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onEdit(); // Trigger edit modal in TaskList
                  }}
                  className="btn-secondary"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onDelete(); // Trigger delete logic
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] px-4 py-2 text-[13px] font-bold text-red-400 hover:bg-[rgba(239,68,68,0.15)] hover:text-red-300 transition-colors tracking-wide"
                >
                  Delete
                </button>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-pf-200 mb-4 border-b border-pf-800/30 pb-2">Activity History</h4>
                
                {loadingActivities ? (
                  <div className="text-[13px] text-pf-600 font-medium text-center py-4">Loading activity...</div>
                ) : activityError ? (
                  <div className="text-[13px] text-[rgba(248,113,113,0.9)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] p-3 rounded-xl font-medium">{activityError}</div>
                ) : activities.length === 0 ? (
                  <div className="text-[13px] text-pf-600 italic font-medium">No activity yet.</div>
                ) : (
                  <ul className="space-y-4">
                    {activities.map((activity, idx) => (
                      <li key={activity.id} className="relative flex gap-x-4">
                        {idx !== activities.length - 1 && (
                          <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-4">
                            <div className="w-px bg-pf-800/50" />
                          </div>
                        )}
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-transparent">
                          <div className="h-1.5 w-1.5 rounded-full bg-pf-400 ring-1 ring-pf-600/50" />
                        </div>
                        <div className="flex-auto py-0.5 text-[13px] leading-5 text-pf-400">
                          <div className="mb-1 text-pf-200 font-medium">{renderActivityText(activity, projectMembers)}</div>
                          <time className="text-[11px] text-pf-600 font-semibold tracking-wide">
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
            <div className="mt-8 sm:mt-0 sm:w-1/3 space-y-6 bg-pf-900/30 p-5 rounded-xl border border-pf-800/30 h-fit">
              <div>
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Status</h4>
                <span className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Priority</h4>
                <span className={getPriorityColor(task.priority)}>
                  {task.priority}
                </span>
              </div>

              <div className="pt-4 border-t border-pf-800/30">
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Assignee</h4>
                <div className="text-[13px] text-pf-200 font-semibold">
                  {getMemberName(task.assignee_id) || <span className="text-pf-600 italic font-medium">Unassigned</span>}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Creator</h4>
                <div className="text-[13px] text-pf-200 font-semibold">
                  {getMemberName(task.creator_id)}
                </div>
              </div>

              <div className="pt-4 border-t border-pf-800/30">
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  Due Date
                  {isOverdue && <span className="inline-flex items-center rounded-md bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] px-1.5 py-0.5 text-[10px] font-bold text-red-400">⚠ OVERDUE</span>}
                </h4>
                <div className="text-[13px] text-pf-200 font-semibold">
                  {formatDate(task.due_date)}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Created</h4>
                <div className="text-[13px] text-pf-400 font-medium">
                  {formatDate(task.created_at)}
                </div>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-pf-600 uppercase tracking-widest mb-2">Updated</h4>
                <div className="text-[13px] text-pf-400 font-medium">
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
