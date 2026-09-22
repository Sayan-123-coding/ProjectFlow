export const getMemberName = (userId, members) => {
  if (!userId) return null;
  const member = members.find(m => m.userId === userId || m.id === userId);
  return member ? member.fullName : 'Unknown User';
};

export const formatActivityTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
};

export const renderActivityText = (activity, projectMembers = []) => {
  // Try to use actor_name if provided by the dashboard query, otherwise fallback to finding the member
  const actor = activity.actor_name || getMemberName(activity.actor_id, projectMembers) || 'Unknown User';
  const meta = activity.metadata || {};

  switch (activity.action) {
    case 'task_created':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> created the task <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
        </>
      );
    case 'task_updated':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> updated the task <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
        </>
      );
    case 'task_status_changed':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> changed status of <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
          <div className="text-sm mt-1">
            <span className="line-through text-gray-400">{meta.from}</span> → <span className="font-medium text-gray-700">{meta.to}</span>
          </div>
        </>
      );
    case 'task_priority_changed':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> changed priority of <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
          <div className="text-sm mt-1">
            <span className="line-through text-gray-400">{meta.from}</span> → <span className="font-medium text-gray-700">{meta.to}</span>
          </div>
        </>
      );
    case 'task_assigned':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> assigned <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
          <div className="text-sm mt-1 text-gray-600">
            to <span className="font-medium text-gray-900">{getMemberName(meta.new_assignee, projectMembers) || 'Unassigned'}</span>
          </div>
        </>
      );
    case 'task_deleted':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> deleted task <span className="font-medium text-gray-700">"{meta.task_title || 'Unknown Task'}"</span>
        </>
      );
    case 'project_created':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> created project <span className="font-medium text-gray-700">"{meta.project_name || 'Unknown Project'}"</span>
        </>
      );
    case 'project_updated':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> updated project <span className="font-medium text-gray-700">"{meta.new_name || 'Unknown Project'}"</span>
        </>
      );
    case 'project_deleted':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> deleted project <span className="font-medium text-gray-700">"{meta.project_name || 'Unknown Project'}"</span>
        </>
      );
    case 'project_member_added':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> added a new member <span className="font-medium text-gray-700">({meta.role})</span>
        </>
      );
    case 'project_member_role_changed':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> changed a member's role
          <div className="text-sm mt-1">
            <span className="line-through text-gray-400">{meta.from}</span> → <span className="font-medium text-gray-700">{meta.to}</span>
          </div>
        </>
      );
    case 'project_member_removed':
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> removed a member <span className="font-medium text-gray-700">({meta.role})</span>
        </>
      );
    default:
      return (
        <>
          <span className="font-medium text-gray-900">{actor}</span> performed action: {activity.action.replace(/_/g, ' ')}
        </>
      );
  }
};
