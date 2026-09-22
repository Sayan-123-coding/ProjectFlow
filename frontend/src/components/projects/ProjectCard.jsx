import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        <h3 className="truncate text-lg font-semibold text-gray-900">
          <Link to={`/projects/${project.id}`} className="hover:text-indigo-600 focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {project.name}
          </Link>
        </h3>
        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-500">
            {project.description}
          </p>
        )}
        {project.totalTasks !== undefined && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{project.completedTasks} / {project.totalTasks} ({project.completionPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full transition-all" style={{ width: `${project.completionPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <Link 
            to={`/projects/${project.id}`} 
            className="font-medium text-indigo-600 hover:text-indigo-500 relative z-10"
          >
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
