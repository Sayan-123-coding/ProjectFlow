import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">


      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-pf-900/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner group-hover:shadow-[0_0_15px_rgba(0,51,255,0.4)] transition-all duration-300">
                <svg className="w-5 h-5 text-pf-600 drop-shadow-[0_0_8px_rgba(0,51,255,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-extrabold text-2xl tracking-wide text-white">ProjectFlow</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-6">
            <Link to="/login" className="text-sm font-bold leading-6 text-pf-200 hover:text-white transition-colors uppercase tracking-widest hover:drop-shadow-[0_0_8px_rgba(196,181,253,0.8)]">
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
          
          <div className={`mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10 transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="mx-auto max-w-3xl">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-5 py-1.5 text-[13px] font-bold leading-6 text-pf-800 ring-1 ring-pf-600/40 hover:ring-pf-600/80 transition-all bg-white/60 backdrop-blur-md uppercase tracking-widest flex items-center gap-3 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pf-600 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pf-600 shadow-[0_0_8px_rgba(0,51,255,1)]"></span>
                  </span>
                  v2.0 Production Ready
                </div>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-slate-800 sm:text-7xl mb-8 leading-[1.1]">
                Manage projects, track tasks, and <span className="text-gradient-neon">ship faster.</span>
              </h1>
              <p className="mt-6 text-[18px] leading-relaxed text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
                ProjectFlow is the minimal, high-performance project management workspace designed for modern engineering teams to collaborate without the clutter.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3.5 text-base"
                >
                  Get Started Free
                </Link>
                <Link to="/login" className="text-[15px] font-bold leading-6 text-slate-700 group uppercase tracking-widest flex items-center gap-2 hover:text-pf-800 transition-colors">
                  Sign In <span aria-hidden="true" className="transition-transform group-hover:translate-x-1 text-pf-600">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className={`mt-20 sm:mt-32 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="glass-panel p-2 sm:p-4 lg:-m-4 lg:p-4">
              <div className="rounded-xl bg-pf-900/80 shadow-2xl overflow-hidden ring-1 ring-white/10">
                {/* Mockup Header */}
                <div className="border-b border-white/10 bg-black/40 backdrop-blur-md px-4 py-3 flex items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-500/50 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-500/50 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-500/50 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                  </div>
                  <div className="mx-auto bg-black/30 rounded-md px-4 py-1.5 text-xs text-pf-200/60 shadow-inner border border-white/5 w-64 text-center font-mono font-medium flex items-center justify-center gap-2">
                    <svg className="w-3 h-3 text-pf-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                    app.projectflow.com
                  </div>
                </div>
                {/* Mockup Board */}
                <div className="p-6 bg-gradient-to-br from-pf-900/80 to-black/90 flex gap-6 overflow-hidden h-[450px]">
                  {['TODO', 'IN PROGRESS', 'DONE'].map((col, i) => (
                    <div key={col} className="w-1/3 flex flex-col gap-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-pf-200 uppercase tracking-widest flex items-center gap-2">
                          {col} 
                          <span className="bg-white/10 text-white rounded-md px-2 py-0.5 font-bold border border-white/10 text-[10px] shadow-[0_0_5px_rgba(255,255,255,0.1)]">{3 - i}</span>
                        </h3>
                      </div>
                      {[...Array(3 - i)].map((_, j) => (
                        <div key={j} className="surface-2 p-5 rounded-xl flex flex-col gap-4">
                          <div className="flex justify-between items-start">
                            <span className={`badge-${i === 0 ? 'red' : i === 1 ? 'blue' : 'neutral'}`}>
                              {i === 0 ? 'HIGH' : i === 1 ? 'MEDIUM' : 'LOW'}
                            </span>
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pf-600 to-pf-800 border-2 border-pf-900 shadow-sm"></div>
                              {j % 2 === 0 && <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pf-400 to-purple-600 border-2 border-pf-900 shadow-sm"></div>}
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <div className="h-3.5 bg-white/20 rounded-md w-4/5"></div>
                            <div className="h-3.5 bg-white/10 rounded-md w-3/5"></div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5 text-pf-400">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              <span className="text-[10px] font-bold">{j + 1}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-pf-400">
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
        <div className="py-24 sm:py-32 bg-pf-900/80 backdrop-blur-3xl border-t border-white/5 relative z-10">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16 space-y-4">
              <h2 className="text-[13px] font-bold leading-7 text-pf-400 uppercase tracking-widest text-gradient-neon">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for modern software teams
              </p>
            </div>
            <div className="mx-auto max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
                
                <div className="flex flex-col surface-2 p-8 rounded-2xl group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-white mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-pf-600/20 group-hover:border-pf-600/50 group-hover:shadow-[0_0_15px_rgba(0,51,255,0.4)] transition-all duration-300">
                      <svg className="h-6 w-6 text-pf-400 group-hover:text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Contextual Workspaces
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-200/70">
                    <p className="flex-auto font-medium">Separate organization-level workspaces from project members. Keep teams focused on their specific goals.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-white mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-pf-600/20 group-hover:border-pf-600/50 group-hover:shadow-[0_0_15px_rgba(0,51,255,0.4)] transition-all duration-300">
                      <svg className="h-6 w-6 text-pf-400 group-hover:text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    Interactive Kanban
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-200/70">
                    <p className="flex-auto font-medium">Drag and drop tasks with status and priority tracking. Visualize your sprint progression instantly.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-white mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-pf-600/20 group-hover:border-pf-600/50 group-hover:shadow-[0_0_15px_rgba(0,51,255,0.4)] transition-all duration-300">
                      <svg className="h-6 w-6 text-pf-400 group-hover:text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Activity Audit Trail
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-200/70">
                    <p className="flex-auto font-medium">Automated logging for all project and task modifications. Never lose track of who changed what and when.</p>
                  </dd>
                </div>

                <div className="flex flex-col surface-2 p-8 rounded-2xl group">
                  <dt className="flex flex-col items-start gap-y-5 text-base font-bold leading-7 text-white mb-2">
                    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:bg-pf-600/20 group-hover:border-pf-600/50 group-hover:shadow-[0_0_15px_rgba(0,51,255,0.4)] transition-all duration-300">
                      <svg className="h-6 w-6 text-pf-400 group-hover:text-pf-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    Role-Based Access
                  </dt>
                  <dd className="mt-2 flex flex-auto flex-col text-[15px] leading-relaxed text-pf-200/70">
                    <p className="flex-auto font-medium">Owner, Manager, and Member permissions built for cross-functional teams to collaborate securely.</p>
                  </dd>
                </div>

              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-pf-900/90 backdrop-blur-xl border-t border-white/5 py-12 relative z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
               <svg className="w-4 h-4 text-pf-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <span className="font-bold text-white tracking-wide">ProjectFlow</span>
          </div>
          <p className="text-center text-[13px] font-bold leading-5 text-pf-400/60">
            &copy; {new Date().getFullYear()} ProjectFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] font-bold text-pf-400/60 hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-[13px] font-bold text-pf-400/60 hover:text-white transition-colors uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
