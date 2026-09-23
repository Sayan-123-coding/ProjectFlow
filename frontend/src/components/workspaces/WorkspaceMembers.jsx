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
            className="btn-primary"
          >
            {showInviteForm ? 'Cancel' : '+ Invite Member'}
          </button>
        </div>
      )}

      {showInviteForm && isOwnerOrManager && (
        <div className="glass-panel p-5 sm:rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pf-600 to-transparent"></div>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row items-end gap-5 relative z-10">
            <div className="flex-1 w-full">
              <label htmlFor="email" className="block text-sm font-bold leading-6 text-pf-400 uppercase tracking-widest drop-shadow-sm">Email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="input-dark mt-1 w-full"
                  placeholder="user@example.com"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label htmlFor="role" className="block text-sm font-bold leading-6 text-pf-400 uppercase tracking-widest drop-shadow-sm">Role</label>
              <div className="mt-2">
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="input-dark mt-1 w-full"
                >
                  <option value="member" className="bg-black text-white">Member</option>
                  <option value="admin" className="bg-black text-white">Admin</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={isInviting}
              className="btn-primary mt-4 sm:mt-0 w-full sm:w-auto"
            >
              {isInviting ? 'Inviting...' : 'Invite'}
            </button>
          </form>
          {inviteError && <p className="mt-3 text-sm font-semibold text-[rgba(248,113,113,0.9)]">{inviteError}</p>}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl bg-red-950/40 border border-red-500/30 p-4 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          <p className="text-sm font-bold text-red-400 drop-shadow-sm">{actionError}</p>
        </div>
      )}

      <div className="glass-panel overflow-hidden sm:rounded-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent"></div>
        <table className="min-w-full divide-y divide-white/10 relative z-10">
          <thead className="bg-black/40">
            <tr>
              <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold text-pf-400 uppercase tracking-widest sm:pl-6 drop-shadow-sm">Name</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Role</th>
              <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-pf-400 hidden sm:table-cell uppercase tracking-widest drop-shadow-sm">Joined</th>
              <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 bg-transparent">
            {members.map((member) => {
              const isCurrentUser = member.userId === user?.id;
              const isTargetOwner = member.role === 'OWNER';
              
              // Only OWNER can modify others. 
              // OWNER cannot modify themselves.
              const canModify = isOwner && !isCurrentUser;

              return (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-[15px] font-bold text-white tracking-wide sm:pl-6 drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                    <div className="flex items-center">
                      {member.fullName}
                      {isCurrentUser && (
                        <span className="ml-3 inline-flex items-center rounded-full bg-pf-600/20 px-2 py-0.5 text-[10px] font-bold text-pf-200 border border-pf-400/30 uppercase tracking-widest shadow-[0_0_8px_rgba(151,125,255,0.2)]">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-bold text-pf-200">
                    {canModify && !isTargetOwner ? (
                      <select
                        value={member.role}
                        disabled={updatingId === member.id || removingId === member.id}
                        onChange={(e) => handleRoleChange(member.id, e.target.value, member.role)}
                        className="input-dark py-1.5 sm:max-w-xs disabled:opacity-50"
                      >
                        <option value="MANAGER" className="bg-black text-white">MANAGER</option>
                        <option value="MEMBER" className="bg-black text-white">MEMBER</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-pf-400 border border-white/10 uppercase tracking-widest drop-shadow-sm">
                        {member.role}
                      </span>
                    )}
                    {updatingId === member.id && <span className="ml-2 text-xs font-semibold text-pf-600">Updating...</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-medium text-pf-400 hidden sm:table-cell">
                    {new Date(member.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-bold sm:pr-6">
                    {canModify && !isTargetOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        disabled={updatingId === member.id || removingId === member.id}
                        className="text-red-400 hover:text-red-300 hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-all disabled:opacity-50 uppercase tracking-widest text-[11px]"
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
