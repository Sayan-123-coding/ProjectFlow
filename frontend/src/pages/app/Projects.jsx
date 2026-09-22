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
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h3 className="text-2xl font-bold leading-6 text-gray-900">Projects</h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            Workspace: {currentWorkspace.name}
          </p>
        </div>
        <div className="mt-3 sm:ml-4 sm:mt-0">
          <button
            onClick={() => setShowCreateModal(true)}
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            + New Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500">Loading projects...</div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              type="button"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              + New Project
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
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <form onSubmit={handleCreateProject}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Create New Project</h3>
                  
                  {createError && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                      {createError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">Project Name</label>
                      <div className="mt-2">
                        <input
                          type="text"
                          id="name"
                          required
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">Description</label>
                      <div className="mt-2">
                        <textarea
                          id="description"
                          rows={3}
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={createLoading || !newProjectName.trim()}
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:bg-indigo-400"
                  >
                    {createLoading ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
