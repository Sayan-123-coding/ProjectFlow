import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { useWorkspace } from '../../context/WorkspaceContext';
import ProjectMembers from '../../components/projects/ProjectMembers';
import TaskList from '../../components/tasks/TaskList';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete State
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const { project: data } = await projectService.getProject(projectId);
        setProject(data);
        setEditName(data.name);
        setEditDesc(data.description || '');
      } catch (err) {
        if (err.status === 404) {
          setError('Project not found or inaccessible.');
        } else if (err.status === 403) {
          setError('You do not have permission to view this project.');
        } else {
          setError('Failed to load project details.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const { project: updatedProject } = await projectService.updateProject(projectId, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setProject(updatedProject);
      setIsEditing(false);
    } catch (err) {
      if (err.status === 403) {
        setEditError('You do not have permission to edit this project.');
      } else {
        setEditError(err.message || 'Failed to update project');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await projectService.deleteProject(projectId);
      navigate('/projects');
    } catch (err) {
      if (err.status === 403) {
        setDeleteError('Only the Workspace OWNER can delete a project.');
      } else {
        setDeleteError(err.message || 'Failed to delete project');
      }
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to Projects
        </Link>
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          &larr; Back to Projects
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        {deleteError && (
          <div className="rounded-t-lg bg-red-50 p-4 border-b border-red-200">
            <p className="text-sm text-red-700">{deleteError}</p>
          </div>
        )}
        
        {isEditing ? (
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleUpdate}>
              {editError && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {editError}
                </div>
              )}
              <div className="space-y-4 max-w-xl">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Project Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={editLoading || !editName.trim()}
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
                  >
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(project.name);
                      setEditDesc(project.description || '');
                      setEditError(null);
                    }}
                    className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-4 py-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:tracking-tight">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-2 text-sm text-gray-500 max-w-3xl">
                  {project.description}
                </p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:bg-red-400"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="p-6">
          <ProjectMembers projectId={projectId} currentWorkspace={currentWorkspace} />
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="p-6">
          <TaskList projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
