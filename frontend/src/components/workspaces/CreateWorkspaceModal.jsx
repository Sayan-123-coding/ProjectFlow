import { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function CreateWorkspaceModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { createWorkspace } = useWorkspace();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const result = await createWorkspace({
      name: name.trim(),
      description: description.trim()
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-pf-900/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md glass-panel rounded-2xl p-7 transform transition-all z-10 overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pf-600 to-pf-400"></div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-extrabold text-white tracking-widest uppercase drop-shadow-sm">Create Workspace</h3>
            <p className="text-[12px] font-bold text-pf-400 mt-2 tracking-wide">Set up a new workspace for your team and projects.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-pf-400 hover:text-white transition-all rounded-full p-1.5 hover:bg-white/10 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-950/40 p-4 text-sm font-bold text-red-400 border border-red-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(239,68,68,0.1)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner">
            <label htmlFor="workspaceName" className="block text-[11px] font-bold text-pf-400 uppercase tracking-widest mb-2 drop-shadow-sm">
              Workspace Name *
            </label>
            <input
              type="text"
              id="workspaceName"
              required
              placeholder="e.g. Acme Engineering"
              className="input-dark w-full py-2.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="bg-black/20 p-5 rounded-xl border border-white/5 shadow-inner">
            <label htmlFor="workspaceDescription" className="block text-[11px] font-bold text-pf-400 uppercase tracking-widest mb-2 drop-shadow-sm">
              Description
            </label>
            <textarea
              id="workspaceDescription"
              rows={4}
              placeholder="e.g. Core workspace for product sprints"
              className="input-dark w-full resize-none py-2.5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/10 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex items-center justify-center w-full sm:w-auto min-w-[160px]"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin text-pf-900" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
