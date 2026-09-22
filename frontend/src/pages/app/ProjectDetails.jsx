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
  const [canManageProject, setCanManageProject] = useState(false);
  
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
        <Link to="/projects" className="text-sm font-medium text-orange-500 hover:text-orange-400 transition-colors">
          &larr; Back to Projects
        </Link>
        <div className="rounded-xl bg-red-900/20 border border-red-900/30 p-4">
          <p className="text-sm text-red-400">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link to="/projects" className="text-[13px] font-bold text-pf-600 hover:text-pf-400 transition-colors tracking-wide uppercase">
          &larr; Back to Projects
        </Link>
      </div>

      <div className="surface-2 overflow-hidden sm:rounded-2xl border border-pf-800/30">
        {deleteError && (
          <div className="rounded-t-2xl bg-[rgba(239,68,68,0.1)] p-4 border-b border-[rgba(239,68,68,0.2)]">
            <p className="text-sm font-semibold text-[rgba(248,113,113,0.9)]">{deleteError}</p>
          </div>
        )}
        
        {isEditing ? (
          <div className="px-5 py-6 sm:p-8">
            <form onSubmit={handleUpdate}>
              {editError && (
                <div className="mb-5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] p-4 text-sm font-semibold text-[rgba(248,113,113,0.9)]">
                  {editError}
                </div>
              )}
              <div className="space-y-5 max-w-xl">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-pf-200">Project Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-dark mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-bold text-pf-200">Description</label>
                  <textarea
                    id="description"
                    rows={4}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="input-dark mt-2"
                  />
                </div>
                <div className="flex space-x-3 pt-3">
                  <button
                    type="submit"
                    disabled={editLoading || !editName.trim()}
                    className="btn-primary"
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
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="px-5 py-6 sm:p-8 flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="mb-5 sm:mb-0">
              <h3 className="text-3xl font-bold leading-tight text-pf-100 tracking-wide sm:truncate">
                {project.name}
              </h3>
              {project.description && (
                <p className="mt-3 text-[15px] leading-relaxed text-pf-400 max-w-3xl">
                  {project.description}
                </p>
              )}
            </div>
            {canManageProject && (
              <div className="flex space-x-3 sm:mt-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="inline-flex items-center rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] px-4 py-2 text-sm font-bold text-[rgba(248,113,113,0.9)] shadow-sm hover:bg-[rgba(239,68,68,0.15)] hover:text-red-300 transition-colors disabled:bg-transparent"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="surface-1 overflow-hidden sm:rounded-2xl border border-pf-800/20">
        <div className="p-6">
          <ProjectMembers projectId={projectId} currentWorkspace={currentWorkspace} onPermissionsLoad={setCanManageProject} />
        </div>
      </div>

      <div className="overflow-hidden sm:rounded-2xl bg-transparent shadow-none backdrop-blur-none p-0">
        <div className="p-0">
          <TaskList projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
