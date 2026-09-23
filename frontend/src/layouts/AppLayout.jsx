import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal';
import NotificationBell from '../components/notifications/NotificationBell';

export default function AppLayout() {
  const { signOut, user, profile } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace, loading: wsLoading, error: wsError } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex text-pf-200 relative overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/10 bg-[#0b0c10]/95 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.1)] h-screen transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Branding & Workspace Selector */}
        <div className="p-5 border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent"></div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(0,51,255,0.2)] border border-white/10">
              <svg className="w-5 h-5 text-pf-600 drop-shadow-[0_0_8px_rgba(0,51,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xl font-extrabold text-white tracking-wide drop-shadow-md">ProjectFlow</span>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-pf-200 uppercase tracking-widest pl-1">Workspace</label>
            <div className="flex items-center space-x-2">
              {wsLoading ? (
                <span className="text-sm text-pf-400 italic">Loading...</span>
              ) : wsError ? (
                <button onClick={() => window.location.reload()} className="text-sm text-red-400 hover:text-red-300 underline">Retry</button>
              ) : workspaces.length > 0 ? (
                <div className="flex-1 relative">
                  <select
                    className="block w-full rounded-md bg-white/5 border border-white/10 py-2.5 pl-3 pr-8 text-white text-sm focus:border-pf-600 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-pf-600 transition-all appearance-none shadow-inner cursor-pointer hover:border-pf-400/50"
                    value={currentWorkspace?.id || ''}
                    onChange={(e) => selectWorkspace(e.target.value)}
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id} className="bg-pf-900 text-white">{ws.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-pf-400">
                    <svg className="h-4 w-4 drop-shadow-[0_0_5px_rgba(151,125,255,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full text-left py-2.5 px-3 text-sm rounded-md border border-dashed border-pf-400/30 text-pf-400 hover:text-pf-200 hover:border-pf-400 transition-colors bg-white/5"
                >
                  + Create Workspace
                </button>
              )}
            </div>
            
            {currentWorkspace && (
              <div className="flex items-center space-x-2 mt-2 pl-1">
                <Link
                  to={`/workspaces/${currentWorkspace.id}/settings`}
                  className="text-[12px] text-pf-400 hover:text-pf-200 transition-colors flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                <span className="text-pf-600/50">&bull;</span>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="text-[12px] text-pf-400 hover:text-pf-200 transition-colors flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          <label className="px-3 text-[11px] font-bold text-pf-200 uppercase tracking-widest mb-2 block">Menu</label>
          <NavLink
            to="/dashboard"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-pf-600/20 to-pf-800/10 text-white border border-pf-600/30 shadow-[0_0_15px_rgba(0,51,255,0.15)]' 
                  : 'text-pf-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <svg className="w-5 h-5 mr-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-pf-600/20 to-pf-800/10 text-white border border-pf-600/30 shadow-[0_0_15px_rgba(0,51,255,0.15)]' 
                  : 'text-pf-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`
            }
          >
            <svg className="w-5 h-5 mr-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Projects
          </NavLink>
        </div>

        {/* Profile & Settings (Bottom) */}
        <div className="p-4 border-t border-white/5 bg-[#111319]/50">
          <div className="flex items-center justify-between px-2 mb-4">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pf-600 to-pf-800 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-pf-400/30 shadow-[0_0_10px_rgba(0,51,255,0.3)]">
                {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold text-white truncate">{profile?.full_name || 'User'}</span>
                {user?.email && <span className="text-[11px] font-medium text-pf-400 truncate">{user.email}</span>}
              </div>
            </div>
            <NotificationBell />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/profile"
              className="flex items-center justify-center py-1.5 px-2 rounded-md bg-white/5 text-xs font-bold text-pf-200 border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-inner"
            >
              Profile
            </Link>
            <button
              onClick={signOut}
              className="flex items-center justify-center py-1.5 px-2 rounded-md bg-red-950/20 text-xs font-bold text-red-400 border border-transparent hover:bg-red-900/40 hover:text-red-200 hover:border-red-500/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-black/5 bg-white/10 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0b0c10] flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-pf-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-lg font-extrabold text-slate-800 tracking-wide">ProjectFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-black/5 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
