import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { projectService } from '../../services/project.service';
import ProjectCard from '../../components/projects/ProjectCard';

export default function Projects() {
  const { currentWorkspace, loading: wsLoading } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  useEffect(() => {
    if (!currentWorkspace) {
      setProjects([]);
      return;
    }

    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const { projects: data } = await projectService.getProjects(currentWorkspace.id);
        setProjects(data || []);
      } catch (err) {
        if (err.status === 403) {
          setError("You don't have access to view projects in this workspace.");
        } else {
          setError("Failed to load projects.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [currentWorkspace]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };
    if (showCreateModal) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showCreateModal]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      const { project } = await projectService.createProject(currentWorkspace.id, {
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
      });
      setProjects((prev) => [...prev, project]);
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err) {
      setCreateError(err.message || 'Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  if (wsLoading) {
    return <div className="p-8 text-center text-gray-500">Loading workspaces...</div>;
  }

  if (!currentWorkspace) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">No Workspace Selected</h2>
        <p className="mt-2 text-gray-500">Please select or create a workspace to view projects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-pf-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-semibold leading-6 text-pf-100 tracking-tight">Projects</h3>
          <p className="mt-2 text-sm text-pf-400">
            Workspace: <span className="text-pf-200 font-medium">{currentWorkspace.name}</span>
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            type="button"
            className="btn-primary"
          >
            New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-pf-400">Loading projects...</div>
      ) : error ? (
        <div className="rounded-md bg-red-900/20 border border-red-900/30 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center rounded-2xl border-2 border-dashed border-pf-800/50 bg-pf-900/40 p-12 backdrop-blur-sm">
          <svg className="mx-auto h-12 w-12 text-pf-600 mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-pf-200">No projects</h3>
          <p className="mt-1 text-sm text-pf-400">Get started by creating a new project.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              type="button"
              className="btn-primary"
            >
              New Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 relative">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Inline Modal for Creation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-pf-900/80 transition-opacity backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative transform overflow-hidden rounded-2xl bg-pf-900 border border-pf-600/20 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg surface-2">
              <form onSubmit={handleCreateProject}>
                <div className="px-6 py-5 border-b border-pf-800/50">
                  <h3 className="text-lg font-semibold leading-6 text-pf-100">Create New Project</h3>
                </div>
                <div className="px-6 py-6">
                  {createError && (
                    <div className="mb-6 rounded-lg bg-red-900/20 border border-red-900/30 p-4 text-sm text-red-400">
                      {createError}
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-pf-200 mb-1.5">Project Name</label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="input-dark"
                        placeholder="E.g., Website Redesign"
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-pf-200 mb-1.5">Description (optional)</label>
                      <textarea
                        id="description"
                        rows={3}
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="input-dark resize-none"
                        placeholder="Briefly describe the project goals..."
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-pf-900/50 px-6 py-4 border-t border-pf-800/50 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading || !newProjectName.trim()}
                    className="btn-primary w-full sm:w-auto"
                  >
                    {createLoading ? 'Creating...' : 'Create Project'}
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
