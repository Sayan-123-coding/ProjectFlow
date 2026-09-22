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
    <div className="glass-panel p-4 rounded-xl border border-white/5 mb-6 space-y-4 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="block text-xs font-medium text-gray-400 mb-1">Search</label>
          <input
            type="text"
            id="search"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder="Search tasks..."
            className="input-dark w-full text-sm py-1.5"
          />
        </div>
        
        {/* Status Filter */}
        <div className="w-full sm:w-40">
          <label htmlFor="status" className="block text-xs font-medium text-gray-400 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="input-dark w-full text-sm py-1.5 px-3"
          >
            <option value="">All</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="w-full sm:w-40">
          <label htmlFor="priority" className="block text-xs font-medium text-gray-400 mb-1">Priority</label>
          <select
            id="priority"
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="input-dark w-full text-sm py-1.5 px-3"
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Assignee Filter */}
        <div className="w-full sm:w-64">
          <label htmlFor="assignee_id" className="block text-xs font-medium text-gray-400 mb-1">Assignee</label>
          <select
            id="assignee_id"
            name="assignee_id"
            value={filters.assignee_id}
            onChange={handleChange}
            className="input-dark w-full text-sm py-1.5 px-3"
          >
            <option value="">All</option>
            {projectMembers.map(m => (
              <option key={m.userId} value={m.userId}>{m.fullName}</option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="w-full sm:w-48">
          <label htmlFor="sortBy" className="block text-xs font-medium text-gray-400 mb-1">Sort by</label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="input-dark w-full text-sm py-1.5 px-3"
          >
            <option value="created_at">Created Date</option>
            <option value="updated_at">Updated Date</option>
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="w-full sm:w-32">
          <label htmlFor="sortOrder" className="block text-xs font-medium text-gray-400 mb-1">Direction</label>
          <select
            id="sortOrder"
            name="sortOrder"
            value={filters.sortOrder}
            onChange={handleChange}
            className="input-dark w-full text-sm py-1.5 px-3"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        
        {/* Clear Button */}
        <div className="w-full sm:w-auto">
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary w-full py-1.5 px-4 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
