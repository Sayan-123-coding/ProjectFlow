import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl glass-panel group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(0,51,255,0.2)] hover:border-pf-600/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="p-6 relative z-10">
        <h3 className="truncate text-lg font-extrabold text-white transition-colors drop-shadow-sm group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          <Link to={`/projects/${project.id}`} className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {project.name}
          </Link>
        </h3>
        {project.description && (
          <p className="mt-2.5 line-clamp-2 text-sm font-medium text-pf-200/80">
            {project.description}
          </p>
        )}
        {project.totalTasks !== undefined && (
          <div className="mt-6">
            <div className="flex justify-between text-[11px] uppercase tracking-widest text-pf-400 font-bold mb-2">
              <span>Progress</span>
              <span><span className="text-white drop-shadow-sm">{project.completedTasks}</span> / {project.totalTasks} ({project.completionPercentage}%)</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10 shadow-inner">
              <div className="bg-gradient-to-r from-pf-600 to-pf-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(151,125,255,0.5)]" style={{ width: `${project.completionPercentage}%` }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 bg-black/20 px-6 py-4 rounded-b-2xl flex items-center justify-between relative z-10">
        <span className="text-[11px] font-bold uppercase tracking-widest text-pf-400">
          Created {new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <Link 
          to={`/projects/${project.id}`} 
          className="text-[13px] font-bold text-pf-200 relative z-10 transition-colors flex items-center gap-1 group-hover:text-white group-hover:drop-shadow-[0_0_5px_rgba(196,181,253,0.5)]"
        >
          Open
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
