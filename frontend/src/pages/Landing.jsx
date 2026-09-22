import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">ProjectFlow</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-4">
            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-700 hover:text-indigo-600 transition-colors">
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative isolate pt-14 pb-20 sm:pt-24 lg:pb-32 overflow-hidden">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <div className="mx-auto max-w-2xl">
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20 transition-all font-medium bg-white">
                  <span className="text-indigo-600 font-semibold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    v1.0 MVP Live
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl mb-6">
                Manage projects, track tasks, and <span className="text-indigo-600">ship faster.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 mb-10 max-w-xl mx-auto">
                ProjectFlow is the minimal, high-performance project management workspace designed for modern engineering teams to collaborate without the clutter.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/register"
                  className="rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500 hover:shadow-indigo-300 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get Started Free
                </Link>
                <Link to="/login" className="text-base font-semibold leading-6 text-gray-900 group">
                  Sign In <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* App Preview Mockup */}
          <div className="mt-16 sm:mt-24 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gray-50/50 p-2 sm:p-4 ring-1 ring-inset ring-gray-900/10 shadow-2xl backdrop-blur-sm lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                {/* Mockup Header */}
                <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto bg-white rounded-md px-3 py-1 text-xs text-gray-400 shadow-sm border border-gray-100 w-64 text-center font-mono">
                    app.projectflow.com
                  </div>
                </div>
                {/* Mockup Board */}
                <div className="p-6 bg-gray-50 flex gap-6 overflow-hidden h-[400px]">
                  {['TODO', 'IN PROGRESS', 'DONE'].map((col, i) => (
                    <div key={col} className="w-1/3 flex flex-col gap-3">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{col} <span className="bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 ml-1 font-medium">{3 - i}</span></h3>
                      {[...Array(3 - i)].map((_, j) => (
                        <div key={j} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${i === 0 ? 'bg-red-50 text-red-700' : i === 1 ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                              {i === 0 ? 'HIGH' : i === 1 ? 'MEDIUM' : 'LOW'}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
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
        <div className="py-24 sm:py-32 bg-gray-50 border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built for modern software teams
              </p>
            </div>
            <div className="mx-auto max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                
                <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    Contextual Workspaces
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-sm text-gray-500">Separate organization-level workspaces from project members. Keep teams focused on their specific goals.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    Interactive Kanban
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-sm text-gray-500">Drag and drop tasks with status and priority tracking. Visualize your sprint progression instantly.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Activity Audit Trail
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-sm text-gray-500">Automated logging for all project and task modifications. Never lose track of who changed what and when.</p>
                  </dd>
                </div>

                <div className="flex flex-col bg-white p-6 rounded-2xl shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-shadow">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    Role-Based Access
                  </dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto text-sm text-gray-500">Owner, Manager, and Member permissions built for cross-functional teams to collaborate securely.</p>
                  </dd>
                </div>

              </dl>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
               <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight text-sm">ProjectFlow</span>
          </div>
          <p className="text-center text-sm leading-5 text-gray-500">
            &copy; {new Date().getFullYear()} ProjectFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
