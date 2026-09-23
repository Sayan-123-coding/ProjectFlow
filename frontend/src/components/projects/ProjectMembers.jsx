import { useState, useEffect } from 'react';
import { projectMemberService } from '../../services/projectMember.service';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProjectMembers({ projectId, currentWorkspace, onPermissionsLoad }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canManageProject, setCanManageProject] = useState(false);

  // Add Member State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  // General action error
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!projectId || !currentWorkspace) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [membersRes, wsMembersRes] = await Promise.all([
          projectMemberService.getProjectMembers(projectId),
          api.get(`/workspaces/${currentWorkspace.id}/members`)
        ]);
        const fetchedMembers = membersRes.members || [];
        const fetchedWsMembers = wsMembersRes.members || [];
        setMembers(fetchedMembers);
        setWorkspaceMembers(fetchedWsMembers);

        const isWorkspaceOwner = fetchedWsMembers.some(m => m.userId === user?.id && (m.role === 'OWNER' || m.role === 'MANAGER'));
        const currentUserProjectRole = fetchedMembers.find(m => m.userId === user?.id)?.role;
        const canManage = isWorkspaceOwner || currentUserProjectRole === 'MANAGER';
        setCanManageProject(canManage);
        
        if (onPermissionsLoad) {
          onPermissionsLoad(canManage);
        }
      } catch (err) {
        if (err.status === 403) {
          setError("You don't have permission to manage members in this project.");
        } else {
          setError("Unable to load project members.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, currentWorkspace]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      setAddError("Please select a user.");
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const { member } = await projectMemberService.addProjectMember(projectId, {
        userId: selectedUserId,
        role: selectedRole
      });
      
      // Inject fullName and avatarUrl from the workspace member list since the backend add response 
      // might not deeply populate them immediately, or we can just refetch, but let's try to find it locally.
      const wsMember = workspaceMembers.find(m => m.userId === selectedUserId);
      const newMemberData = {
        ...member,
        fullName: wsMember?.fullName || 'Unknown User',
        avatarUrl: wsMember?.avatarUrl || null,
        userId: selectedUserId
      };

      setMembers(prev => [...prev, newMemberData]);
      setShowAddModal(false);
      setSelectedUserId('');
      setSelectedRole('MEMBER');
    } catch (err) {
      setAddError(err.message || 'Failed to add member');
    } finally {
      setAddLoading(false);
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    setActionError(null);
    try {
      const { member: updatedMember } = await projectMemberService.updateProjectMember(projectId, memberId, {
        role: newRole
      });
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: updatedMember.role } : m));
    } catch (err) {
      if (err.status === 403) {
        setActionError("Project MANAGERs cannot change member roles, or you lack permission.");
      } else {
        setActionError(err.message || 'Failed to update role');
      }
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    setActionError(null);
    if (!window.confirm(`Remove ${memberName || 'this member'} from the project?`)) {
      return;
    }

    try {
      await projectMemberService.removeProjectMember(projectId, memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      setActionError(err.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading project members...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-950/40 p-4 border border-red-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
        <p className="text-sm font-bold text-red-400 drop-shadow-sm">{error}</p>
      </div>
    );
  }

  // Filter out users who are already in the project
  const availableUsers = workspaceMembers.filter(
    wsMem => !members.some(pm => pm.userId === wsMem.userId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-5 relative">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-pf-600/50 via-white/10 to-transparent"></div>
        <h3 className="text-base font-extrabold leading-6 text-white drop-shadow-sm uppercase tracking-widest">Project Members</h3>
        {canManageProject && (
          <button
            onClick={() => setShowAddModal(true)}
            type="button"
            className="btn-primary"
          >
            + Add Member
          </button>
        )}
      </div>

      {actionError && (
        <div className="rounded-xl bg-red-950/40 p-4 border border-red-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          <p className="text-sm font-bold text-red-400 drop-shadow-sm">{actionError}</p>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center rounded-2xl glass-panel p-12 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pf-600 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <p className="mt-1 text-sm font-bold text-white uppercase tracking-widest drop-shadow-sm">No members have been added to this project yet.</p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden sm:rounded-2xl relative z-10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent"></div>
          <table className="min-w-full divide-y divide-white/10 relative z-10">
            <thead className="bg-black/40">
              <tr>
                <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-bold text-pf-400 uppercase tracking-widest sm:pl-6 drop-shadow-sm">Name</th>
                <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-pf-400 uppercase tracking-widest drop-shadow-sm">Role</th>
                <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-transparent">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-[15px] font-bold text-white tracking-wide sm:pl-6 drop-shadow-sm group-hover:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-pf-600 rounded-full blur-md opacity-30"></div>
                        {member.avatarUrl ? (
                          <img className="h-8 w-8 rounded-full border border-white/20 relative z-10 shadow-sm" src={member.avatarUrl} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white font-extrabold relative z-10 shadow-inner">
                            {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-bold text-white">{member.fullName || 'Unknown User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-[13px] font-bold text-pf-200">
                    {canManageProject ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        className="input-dark py-1.5 sm:max-w-xs disabled:opacity-50"
                      >
                        <option value="MANAGER" className="bg-black text-white">Manager</option>
                        <option value="MEMBER" className="bg-black text-white">Member</option>
                      </select>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-pf-400 border border-white/10 uppercase tracking-widest drop-shadow-sm">
                        {member.role.charAt(0) + member.role.slice(1).toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-bold sm:pr-6">
                    {canManageProject && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.fullName)}
                        className="text-red-400 hover:text-red-300 hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] transition-all uppercase tracking-widest text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-pf-900/80 transition-opacity backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
            <div className="relative transform overflow-hidden rounded-2xl glass-panel text-left transition-all sm:my-8 sm:w-full sm:max-w-lg z-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pf-600 to-pf-400"></div>
              <form onSubmit={handleAddMember}>
                <div className="px-6 py-5 border-b border-white/10 bg-black/20">
                  <h3 className="text-lg font-extrabold leading-6 text-white drop-shadow-sm">Add Project Member</h3>
                </div>
                
                <div className="px-6 py-6">
                  {addError && (
                    <div className="mb-6 rounded-xl bg-red-950/40 border border-red-500/30 p-4 text-sm font-bold text-red-400 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                      {addError}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="user" className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-1.5 drop-shadow-sm">Select Workspace Member</label>
                      <div className="mt-2">
                        <select
                          id="user"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="input-dark w-full"
                          required
                        >
                          <option value="" disabled className="bg-black text-white">-- Select a user --</option>
                          {availableUsers.map(u => (
                            <option key={u.userId} value={u.userId} className="bg-black text-white">{u.fullName} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      {availableUsers.length === 0 && (
                        <p className="mt-3 text-sm font-bold text-pf-200/80 drop-shadow-sm">All workspace members are already in this project.</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-bold text-pf-400 uppercase tracking-widest mb-1.5 drop-shadow-sm">Project Role</label>
                      <div className="mt-2">
                        <select
                          id="role"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="input-dark w-full"
                        >
                          <option value="MEMBER" className="bg-black text-white">Member</option>
                          <option value="MANAGER" className="bg-black text-white">Manager</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/40 px-6 py-4 border-t border-white/10 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading || !selectedUserId}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {addLoading ? 'Adding...' : 'Add Member'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
