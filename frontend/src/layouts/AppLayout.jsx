import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';

export default function AppLayout() {
  const { signOut, user, profile } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace, loading: wsLoading } = useWorkspace();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold text-indigo-600">ProjectFlow</span>
              </div>
              
              {/* Workspace Switcher */}
              {!wsLoading && workspaces.length > 0 && (
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Workspace:</span>
                  <select
                    className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    value={currentWorkspace?.id || ''}
                    onChange={(e) => selectWorkspace(e.target.value)}
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-gray-500 flex flex-col text-right">
                <span className="font-medium text-gray-900">{profile?.full_name || 'Loading...'}</span>
                <span className="text-xs">{user?.email}</span>
              </span>
              <button
                onClick={signOut}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
