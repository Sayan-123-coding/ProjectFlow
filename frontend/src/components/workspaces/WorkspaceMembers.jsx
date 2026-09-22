import { useState, useEffect } from 'react';
import { workspaceService } from '../../services/workspace.service';
import { useAuth } from '../../context/AuthContext';

export default function WorkspaceMembers({ workspaceId }) {
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { members: data } = await workspaceService.getWorkspaceMembers(workspaceId);
        if (isMounted) {
          setMembers(data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load workspace members.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    if (workspaceId) {
      fetchMembers();
    }
    
    return () => {
      isMounted = false;
    };
  }, [workspaceId]);

  const currentUserMember = members.find(m => m.userId === user?.id);
  const isOwner = currentUserMember?.role === 'OWNER';
  const isOwnerOrManager = isOwner || currentUserMember?.role === 'MANAGER';

  const handleRoleChange = async (memberId, newRole, oldRole) => {
    try {
      setActionError(null);
      setUpdatingId(memberId);
      
      const { member: updatedMember } = await workspaceService.updateWorkspaceMember(workspaceId, memberId, { role: newRole });
      
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updatedMember.role } : m));
    } catch (err) {
      setActionError(err.message || 'Failed to update member role.');
      // Restore previous role is not strictly needed if we didn't optimistically update, 
      // but since we await the response before setting state, we are safe.
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveMember = async (member) => {
    if (window.confirm(`Are you sure you want to remove ${member.fullName} from the workspace?`)) {
      try {
        setActionError(null);
        setRemovingId(member.id);
        
        await workspaceService.removeWorkspaceMember(workspaceId, member.id);
        
        setMembers(prev => prev.filter(m => m.id !== member.id));
      } catch (err) {
        setActionError(err.message || 'Failed to remove member.');
      } finally {
        setRemovingId(null);
      }
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setIsInviting(true);
      setInviteError(null);
      await workspaceService.addWorkspaceMember(workspaceId, { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      setInviteRole('member');
      
      // Refresh members list
      const { members: data } = await workspaceService.getWorkspaceMembers(workspaceId);
      setMembers(data || []);
      setShowInviteForm(false);
    } catch (err) {
      setInviteError(err.message || 'Failed to invite member.');
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500 py-4">Loading workspace members...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (members.length === 0) {
    return <div className="text-gray-500 py-4 italic">No members found.</div>;
  }

  return (
    <div className="space-y-4">
      {isOwnerOrManager && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            {showInviteForm ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>
      )}

      {showInviteForm && isOwnerOrManager && (
        <div className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200">
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="user@example.com"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Role</label>
              <div className="mt-2">
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="mt-4 sm:mt-0 inline-flex w-full sm:w-auto items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isInviting ? 'Inviting...' : 'Invite'}
            </button>
          </form>
          {inviteError && <p className="mt-2 text-sm text-red-600">{inviteError}</p>}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Joined</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {members.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const isTargetOwner = member.role === 'OWNER';
              
              // Only OWNER can modify others. 
              // OWNER cannot modify themselves.
              const canModify = isOwner && !isCurrentUser;

              return (
                <tr key={member.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      {member.fullName}
                      {isCurrentUser && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {canModify && !isTargetOwner ? (
                      <select
                        value={member.role}
                        disabled={updatingId === member.id || removingId === member.id}
                        onChange={(e) => handleRoleChange(member.id, e.target.value, member.role)}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6 disabled:opacity-50"
                      >
                        <option value="MANAGER">MANAGER</option>
                        <option value="MEMBER">MEMBER</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                        {member.role}
                      </span>
                    )}
                    {updatingId === member.id && <span className="ml-2 text-xs text-indigo-500">Updating...</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 hidden sm:table-cell">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    {canModify && !isTargetOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        disabled={updatingId === member.id || removingId === member.id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {removingId === member.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
