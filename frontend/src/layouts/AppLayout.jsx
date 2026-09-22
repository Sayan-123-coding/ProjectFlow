import { Outlet, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal';
import NotificationBell from '../components/notifications/NotificationBell';

export default function AppLayout() {
  const { signOut, user, profile } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace, loading: wsLoading, error: wsError } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-indigo-600">ProjectFlow</span>
              </div>
              <div className="ml-6 flex space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center border-b-2 border-transparent hover:border-gray-300 px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center border-b-2 border-transparent hover:border-gray-300 px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Projects
                </Link>
              </div>
              
              {/* Workspace Switcher */}
              <div className="flex items-center space-x-2">
                {wsLoading ? (
                  <span className="text-sm text-gray-500 italic">Loading workspaces...</span>
                ) : wsError ? (
                  <button onClick={() => window.location.reload()} className="text-sm text-red-600 hover:text-red-800 underline">
                    Retry
                  </button>
                ) : workspaces.length > 0 ? (
                  <>
                    <span className="text-sm text-gray-500">Workspace:</span>
                    <select
                      className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                      value={currentWorkspace?.id || ''}
                      onChange={(e) => selectWorkspace(e.target.value)}
                    >
                      {workspaces.map(ws => (
                        <option key={ws.id} value={ws.id}>{ws.name}</option>
                      ))}
                    </select>
                    {currentWorkspace && (
                      <Link
                        to={`/workspaces/${currentWorkspace.id}/settings`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                        title="Workspace Settings"
                        aria-label="Workspace Settings"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </Link>
                    )}
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                      title="Create New Workspace"
                      aria-label="Create New Workspace"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-800"
                  >
                    Create Workspace
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-500 flex flex-col text-right">
                <span className="font-medium text-gray-900">{profile?.full_name || user?.email || 'User Profile'}</span>
                {user?.email && profile?.full_name && <span className="text-xs">{user.email}</span>}
              </div>
              <div className="flex items-center space-x-2">
                <NotificationBell />
                <Link
                  to="/profile"
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
