import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl surface-1 group transition-all duration-300 hover:-translate-y-1 hover:border-pf-600/50 hover:bg-pf-800/30 hover:shadow-lg">
      <div className="p-6">
        <h3 className="truncate text-lg font-bold text-pf-100 group-hover:text-white transition-colors">
          <Link to={`/projects/${project.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {project.name}
          </Link>
        </h3>
        {project.description && (
          <p className="mt-2.5 line-clamp-2 text-sm text-pf-400">
            {project.description}
          </p>
        )}
        {project.totalTasks !== undefined && (
          <div className="mt-6">
            <div className="flex justify-between text-[11px] uppercase tracking-wider text-pf-400 font-semibold mb-2">
              <span>Progress</span>
              <span><span className="text-pf-200">{project.completedTasks}</span> / {project.totalTasks} ({project.completionPercentage}%)</span>
            </div>
            <div className="w-full bg-pf-900/50 rounded-full h-1.5 overflow-hidden border border-pf-800/30">
              <div className="bg-pf-400 h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${project.completionPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-pf-800/30 bg-pf-900/30 px-6 py-4 rounded-b-2xl flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-pf-600">
          Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Link 
          to={`/projects/${project.id}`} 
          className="text-[13px] font-semibold text-pf-400 relative z-10 transition-colors flex items-center gap-1 group-hover:text-pf-200"
        >
          Open
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
