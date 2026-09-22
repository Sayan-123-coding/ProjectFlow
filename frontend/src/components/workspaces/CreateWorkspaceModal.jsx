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
        className="fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md surface-2 rounded-2xl p-7 border border-pf-800/30 shadow-xl transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-2xl font-bold text-pf-100 tracking-wide">Create Workspace</h3>
            <p className="text-[13px] font-medium text-pf-400 mt-2">Set up a new workspace for your team and projects.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-pf-400 hover:text-pf-200 transition-colors rounded-full p-1.5 hover:bg-pf-800/30"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-[rgba(239,68,68,0.1)] p-4 text-sm font-semibold text-[rgba(248,113,113,0.9)] border border-[rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="workspaceName" className="block text-[13px] font-bold text-pf-200 uppercase tracking-widest mb-2">
              Workspace Name *
            </label>
            <input
              type="text"
              id="workspaceName"
              required
              placeholder="e.g. Acme Engineering"
              className="input-dark w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="workspaceDescription" className="block text-[13px] font-bold text-pf-200 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              id="workspaceDescription"
              rows={4}
              placeholder="e.g. Core workspace for product sprints"
              className="input-dark w-full resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-pf-800/50 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary flex items-center justify-center min-w-[150px]"
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
