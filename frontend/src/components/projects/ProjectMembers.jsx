import { useState, useEffect } from 'react';
import { projectMemberService } from '../../services/projectMember.service';
import { api } from '../../services/api';

export default function ProjectMembers({ projectId, currentWorkspace }) {
  const [members, setMembers] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setMembers(membersRes.members || []);
        setWorkspaceMembers(wsMembersRes.members || []);
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
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // Filter out users who are already in the project
  const availableUsers = workspaceMembers.filter(
    wsMem => !members.some(pm => pm.userId === wsMem.userId)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Project Members</h3>
        <button
          onClick={() => setShowAddModal(true)}
          type="button"
          className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        >
          + Add Member
        </button>
      </div>

      {actionError && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{actionError}</p>
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
          <p className="mt-1 text-sm text-gray-500">No members have been added to this project yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        {member.avatarUrl ? (
                          <img className="h-8 w-8 rounded-full" src={member.avatarUrl} alt="" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                            {member.fullName ? member.fullName.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{member.fullName || 'Unknown User'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                      className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="MANAGER">Manager</option>
                      <option value="MEMBER">Member</option>
                    </select>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <button
                      onClick={() => handleRemoveMember(member.id, member.fullName)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddModal(false)}></div>
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form onSubmit={handleAddMember}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Add Project Member</h3>
                  
                  {addError && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                      {addError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="user" className="block text-sm font-medium leading-6 text-gray-900">Select Workspace Member</label>
                      <div className="mt-2">
                        <select
                          id="user"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                          required
                        >
                          <option value="" disabled>-- Select a user --</option>
                          {availableUsers.map(u => (
                            <option key={u.userId} value={u.userId}>{u.fullName} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                      {availableUsers.length === 0 && (
                        <p className="mt-2 text-sm text-gray-500">All workspace members are already in this project.</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium leading-6 text-gray-900">Project Role</label>
                      <div className="mt-2">
                        <select
                          id="role"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MANAGER">Manager</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={addLoading || !selectedUserId}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:bg-indigo-400"
                  >
                    {addLoading ? 'Adding...' : 'Add Member'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
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
