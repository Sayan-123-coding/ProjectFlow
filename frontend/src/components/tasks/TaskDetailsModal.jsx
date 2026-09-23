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

        <div className="relative transform overflow-hidden rounded-2xl glass-panel text-left transition-all sm:my-8 sm:w-full sm:max-w-3xl z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pf-600 to-pf-400"></div>
          {/* Header */}
          <div className="px-6 py-6 border-b border-white/10 bg-black/20 flex justify-between items-start">
            <h3 className="text-xl font-extrabold leading-6 text-white pr-8 break-words drop-shadow-sm">
              {task.title}
            </h3>
            <button
              type="button"
              className="rounded-full text-pf-400 hover:text-white hover:bg-white/10 p-1 transition-all focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-8 sm:flex sm:flex-row h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Left Column: Details */}
            <div className="sm:w-2/3 sm:pr-8">
              <div className="mb-6">
                <h4 className="text-xs font-bold text-pf-400 uppercase tracking-widest mb-2.5 drop-shadow-sm">Description</h4>
                <div className="text-[14px] font-medium text-pf-200/90 bg-black/40 p-5 rounded-xl border border-white/10 min-h-[100px] whitespace-pre-wrap leading-relaxed shadow-inner">
                  {task.description || <span className="text-pf-600 italic font-medium">No description provided.</span>}
                </div>
              </div>

              <div className="mb-8 flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onEdit(); // Trigger edit modal in TaskList
                  }}
                  className="btn-primary"
                >
                  Edit Task
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose(); // Close details
                    onDelete(); // Trigger delete logic
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-red-950/40 border border-red-500/30 px-5 py-2.5 text-sm font-bold text-red-400 hover:bg-red-900/60 hover:text-red-300 hover:border-red-400/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] transition-all tracking-widest uppercase"
                >
                  Delete
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-pf-400 uppercase tracking-widest mb-5 border-b border-white/10 pb-3 drop-shadow-sm">Activity History</h4>
                
                {loadingActivities ? (
                  <div className="text-[13px] text-pf-600 font-bold tracking-widest uppercase text-center py-4 drop-shadow-sm">Loading activity...</div>
                ) : activityError ? (
                  <div className="text-[13px] text-red-400 bg-red-950/40 border border-red-500/30 p-4 rounded-xl font-bold shadow-[0_0_10px_rgba(239,68,68,0.1)] drop-shadow-sm">{activityError}</div>
                ) : activities.length === 0 ? (
                  <div className="text-[13px] text-pf-600 italic font-medium">No activity yet.</div>
                ) : (
                  <ul className="space-y-6">
                    {activities.map((activity, idx) => (
                      <li key={activity.id} className="relative flex gap-x-5">
                        {idx !== activities.length - 1 && (
                          <div className="absolute left-0 top-0 flex w-6 justify-center -bottom-6">
                            <div className="w-[1.5px] bg-gradient-to-b from-pf-600/50 to-transparent" />
                          </div>
                        )}
                        <div className="relative flex h-6 w-6 flex-none items-center justify-center bg-transparent">
                          <div className="h-2 w-2 rounded-full bg-pf-400 ring-2 ring-pf-600/50 shadow-[0_0_5px_rgba(151,125,255,0.5)]" />
                        </div>
                        <div className="flex-auto py-0.5 text-[13px] leading-5 text-pf-200">
                          <div className="mb-1.5 font-bold text-white drop-shadow-sm">{renderActivityText(activity, projectMembers)}</div>
                          <time className="text-[11px] text-pf-600 font-bold tracking-widest uppercase">
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
            <div className="mt-8 sm:mt-0 sm:w-1/3 space-y-6 bg-black/40 p-6 rounded-2xl border border-white/10 h-fit shadow-inner">
              <div>
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Status</h4>
                <span className={`${getStatusColor(task.status)} drop-shadow-sm`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Priority</h4>
                <span className={`${getPriorityColor(task.priority)} drop-shadow-sm`}>
                  {task.priority}
                </span>
              </div>

              <div className="pt-5 border-t border-white/10">
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Assignee</h4>
                <div className="text-[14px] text-white font-bold drop-shadow-sm">
                  {getMemberName(task.assignee_id) || <span className="text-pf-600 italic font-medium">Unassigned</span>}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Creator</h4>
                <div className="text-[14px] text-white font-bold drop-shadow-sm">
                  {getMemberName(task.creator_id)}
                </div>
              </div>

              <div className="pt-5 border-t border-white/10">
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 flex items-center gap-2 drop-shadow-sm">
                  Due Date
                  {isOverdue && <span className="inline-flex items-center rounded-md bg-red-950/40 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400 shadow-[0_0_5px_rgba(239,68,68,0.2)]">⚠ OVERDUE</span>}
                </h4>
                <div className="text-[14px] text-white font-bold drop-shadow-sm">
                  {formatDate(task.due_date)}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Created</h4>
                <div className="text-[13px] text-pf-200/90 font-bold">
                  {formatDate(task.created_at)}
                </div>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold text-pf-600 uppercase tracking-widest mb-2.5 drop-shadow-sm">Updated</h4>
                <div className="text-[13px] text-pf-200/90 font-bold">
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
