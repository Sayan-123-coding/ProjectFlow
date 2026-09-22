import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-pf-900 min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-pf-900/80 backdrop-blur-md border-b border-pf-800/50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pf-800/40 flex items-center justify-center border border-pf-600/20 shadow-inner">
                <svg className="w-5 h-5 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-wide text-pf-100">ProjectFlow</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-6">
            <Link to="/login" className="text-sm font-bold leading-6 text-pf-400 hover:text-pf-200 transition-colors uppercase tracking-widest">
              Sign in
            </Link>
            <Link
              to="/register"
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative isolate pt-20 pb-20 sm:pt-32 lg:pb-32 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-pf-800/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
            <div className="mx-auto max-w-3xl">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-4 py-1.5 text-[13px] font-bold leading-6 text-pf-400 ring-1 ring-pf-800/50 hover:ring-pf-800 transition-all bg-pf-900/50 backdrop-blur-sm uppercase tracking-widest flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pf-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pf-400"></span>
                  </span>
                  v2.0 Production Ready
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-pf-100 sm:text-7xl mb-8 leading-[1.1]">
                Manage projects, track tasks, and <span className="text-pf-400">ship faster.</span>
              </h1>
              <p className="mt-6 text-[17px] leading-relaxed text-pf-400 mb-10 max-w-2xl mx-auto font-medium">
                ProjectFlow is the minimal, high-performance project management workspace designed for modern engineering teams to collaborate without the clutter.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3.5 text-base"
                >
                  Get Started Free
                </Link>
                <Link to="/login" className="text-[15px] font-bold leading-6 text-pf-200 group uppercase tracking-widest flex items-center gap-2 hover:text-pf-100 transition-colors">
                  Sign In <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className="mt-20 sm:mt-32 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="rounded-2xl surface-2 p-2 sm:p-4 ring-1 ring-inset ring-pf-800/50 shadow-2xl backdrop-blur-sm lg:-m-4 lg:rounded-[2rem] lg:p-4">
              <div className="rounded-xl bg-pf-900 shadow-sm ring-1 ring-pf-800/50 overflow-hidden">
                {/* Mockup Header */}
                <div className="border-b border-pf-800/50 bg-pf-900 px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[rgba(248,113,113,0.5)] border border-[rgba(248,113,113,0.2)]"></div>
                    <div className="w-3 h-3 rounded-full bg-pf-600/50 border border-pf-600/20"></div>
                    <div className="w-3 h-3 rounded-full bg-[rgba(74,222,128,0.5)] border border-[rgba(74,222,128,0.2)]"></div>
                  </div>
                  <div className="mx-auto bg-pf-900/50 rounded-md px-3 py-1.5 text-xs text-pf-400 shadow-sm border border-pf-800/50 w-64 text-center font-mono font-medium flex items-center justify-center gap-2">
                    <svg className="w-3 h-3 text-pf-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    app.projectflow.com
                  </div>
                </div>
                {/* Mockup Board */}
                <div className="p-6 surface-1 flex gap-6 overflow-hidden h-[450px]">
                  {['TODO', 'IN PROGRESS', 'DONE'].map((col, i) => (
                    <div key={col} className="w-1/3 flex flex-col gap-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-pf-400 uppercase tracking-widest flex items-center gap-2">
                          {col} 
                          <span className="bg-pf-800/40 text-pf-200 rounded-md px-2 py-0.5 font-bold border border-pf-800/50 text-[10px]">{3 - i}</span>
                        </h3>
                      </div>
                      {[...Array(3 - i)].map((_, j) => (
                        <div key={j} className="surface-2 p-5 rounded-xl shadow-sm border border-pf-800/50 flex flex-col gap-4 hover:border-pf-600/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                              i === 0 ? 'bg-[rgba(239,68,68,0.1)] text-[rgba(248,113,113,0.9)] border border-[rgba(239,68,68,0.2)]' : 
                              i === 1 ? 'bg-[rgba(59,130,246,0.1)] text-[rgba(96,165,250,0.9)] border border-[rgba(59,130,246,0.2)]' : 
                              'bg-pf-800/40 text-pf-200 border border-pf-600/20'
                            }`}>
                              {i === 0 ? 'HIGH' : i === 1 ? 'MEDIUM' : 'LOW'}
                            </span>
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-pf-600 border-2 border-pf-900 shadow-sm"></div>
                              {j % 2 === 0 && <div className="w-6 h-6 rounded-full bg-pf-400 border-2 border-pf-900 shadow-sm"></div>}
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <div className="h-3.5 bg-pf-800/60 rounded-md w-4/5"></div>
                            <div className="h-3.5 bg-pf-800/40 rounded-md w-3/5"></div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-pf-600">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              <span className="text-[10px] font-bold">{j + 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-pf-600">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                              <span className="text-[10px] font-bold">{i * 2 + j}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="py-24 sm:py-32 surface-1 border-t border-pf-800/30 relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16 space-y-4">
              <h2 className="text-[13px] font-bold leading-7 text-pf-400 uppercase tracking-widest">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-pf-100 sm:text-4xl">
                Built for modern software teams
              </p>
            </div>
            <div className="mx-auto max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
                
                <div className="flex flex-col surface-2 p-8 rounded-2xl shadow-sm border border-pf-800/30 hover:border-pf-600/30 transition-all group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-pf-200 mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pf-800/40 border border-pf-600/20 group-hover:bg-pf-800/60 transition-colors">
                      <svg className="h-6 w-6 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Contextual Workspaces
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-400">
                    <p className="flex-auto font-medium">Separate organization-level workspaces from project members. Keep teams focused on their specific goals.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl shadow-sm border border-pf-800/30 hover:border-pf-600/30 transition-all group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-pf-200 mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pf-800/40 border border-pf-600/20 group-hover:bg-pf-800/60 transition-colors">
                      <svg className="h-6 w-6 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    Interactive Kanban
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-400">
                    <p className="flex-auto font-medium">Drag and drop tasks with status and priority tracking. Visualize your sprint progression instantly.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl shadow-sm border border-pf-800/30 hover:border-pf-600/30 transition-all group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-pf-200 mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pf-800/40 border border-pf-600/20 group-hover:bg-pf-800/60 transition-colors">
                      <svg className="h-6 w-6 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Activity Audit Trail
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-400">
                    <p className="flex-auto font-medium">Automated logging for all project and task modifications. Never lose track of who changed what and when.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl shadow-sm border border-pf-800/30 hover:border-pf-600/30 transition-all group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-pf-200 mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pf-800/40 border border-pf-600/20 group-hover:bg-pf-800/60 transition-colors">
                      <svg className="h-6 w-6 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    Role-Based Access
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-400">
                    <p className="flex-auto font-medium">Owner, Manager, and Member permissions built for cross-functional teams to collaborate securely.</p>
                  </dd>
                </div>

              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-pf-900 border-t border-pf-800/30 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pf-800/40 flex items-center justify-center border border-pf-600/20 shadow-inner">
               <svg className="w-4 h-4 text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <span className="font-bold text-pf-200 tracking-wide">ProjectFlow</span>
          </div>
          <p className="text-center text-[13px] font-bold leading-5 text-pf-400">
            &copy; {new Date().getFullYear()} ProjectFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] font-bold text-pf-400 hover:text-pf-200 transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[13px] font-bold text-pf-400 hover:text-pf-200 transition-colors uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
