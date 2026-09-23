export default function TaskFilters({ filters, onChange, projectMembers }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleClear = () => {
    onChange({
      search: '',
      status: '',
      priority: '',
      assignee_id: '',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  };
  return (
    <div className="glass-panel p-5 rounded-2xl mb-6 space-y-5 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-pf-600/50 via-white/10 to-transparent"></div>
      <div className="flex flex-col sm:flex-row gap-5 relative z-10">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search tasks..."
            className="input-dark w-full text-sm py-2"
          />
        </div>
        
        {/* Status Filter */}
        <div className="w-full sm:w-40">
          <label htmlFor="status" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="input-dark w-full text-sm py-2 px-3"
          >
            <option value="" className="bg-black text-white">All</option>
            <option value="TODO" className="bg-black text-white">To Do</option>
            <option value="IN_PROGRESS" className="bg-black text-white">In Progress</option>
            <option value="COMPLETED" className="bg-black text-white">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="w-full sm:w-40">
          <label htmlFor="priority" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Priority</label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="input-dark w-full text-sm py-2 px-3"
          >
            <option value="" className="bg-black text-white">All</option>
            <option value="LOW" className="bg-black text-white">Low</option>
            <option value="MEDIUM" className="bg-black text-white">Medium</option>
            <option value="HIGH" className="bg-black text-white">High</option>
            <option value="URGENT" className="bg-black text-white">Urgent</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-end relative z-10">
        {/* Assignee Filter */}
        <div className="w-full sm:w-64">
          <label htmlFor="assignee_id" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Assignee</label>
          <select
            id="assignee_id"
            name="assignee_id"
            value={filters.assignee_id}
            onChange={handleChange}
            className="input-dark w-full text-sm py-2 px-3"
          >
            <option value="" className="bg-black text-white">All</option>
            {projectMembers.map(m => (
              <option key={m.userId} value={m.userId} className="bg-black text-white">{m.fullName}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="w-full sm:w-48">
          <label htmlFor="sortBy" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Sort by</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="input-dark w-full text-sm py-2 px-3"
          >
            <option value="created_at" className="bg-black text-white">Created Date</option>
            <option value="updated_at" className="bg-black text-white">Updated Date</option>
            <option value="due_date" className="bg-black text-white">Due Date</option>
            <option value="priority" className="bg-black text-white">Priority</option>
            <option value="title" className="bg-black text-white">Title</option>
            <option value="status" className="bg-black text-white">Status</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="w-full sm:w-32">
          <label htmlFor="sortOrder" className="block text-xs font-bold text-pf-400 mb-1.5 uppercase tracking-widest drop-shadow-sm">Direction</label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleChange}
            className="input-dark w-full text-sm py-2 px-3"
          >
            <option value="desc" className="bg-black text-white">Descending</option>
            <option value="asc" className="bg-black text-white">Ascending</option>
          </select>
        </div>
        
        {/* Clear Button */}
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary w-full py-2 px-6 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
