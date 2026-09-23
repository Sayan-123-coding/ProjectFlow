import { useState } from 'react';
import TaskCard from './TaskCard';

export default function KanbanBoard({ tasks, projectMembers, onUpdate, onDelete, onStatusChange, onClick }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const columns = [
    { id: 'TODO', title: 'TODO' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS' },
    { id: 'COMPLETED', title: 'COMPLETED' }
  ];

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) {
      setDraggedTaskId(null);
      return;
    }

    onStatusChange(taskId, newStatus, task.status);
    setDraggedTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  return (
    <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 space-x-6">
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-[340px] flex flex-col p-2 rounded-2xl glass-panel relative overflow-hidden transition-all duration-300 group ${
              draggedTaskId ? 'border-pf-600/50 bg-black/60 shadow-[0_0_15px_rgba(151,125,255,0.2)]' : 'border-white/5 bg-black/30'
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-pf-600/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-4 px-3 py-2 relative z-10 border-b border-white/10 pb-3">
              <h4 className="text-sm font-extrabold text-white tracking-widest uppercase drop-shadow-sm">{col.title}</h4>
              <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-lg bg-black/50 px-2 text-[11px] font-bold text-pf-400 border border-white/10 shadow-inner">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 min-h-[200px] bg-black/40 rounded-xl p-3 border border-white/5 relative z-10 custom-scrollbar overflow-y-auto max-h-[60vh] shadow-inner">
              {columnTasks.length === 0 ? (
                <div className="h-full min-h-[150px] border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4">
                  <div className="w-10 h-10 rounded-full bg-pf-900/30 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-pf-600 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-[12px] font-bold tracking-widest text-pf-400 uppercase drop-shadow-sm">No tasks</span>
                </div>
              ) : (
                columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${
                      draggedTaskId === task.id ? 'opacity-40 scale-[0.98]' : 'opacity-100 hover:-translate-y-[1px]'
                    }`}
                  >
                    <TaskCard
                      task={task}
                      projectMembers={projectMembers}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                      onClick={onClick}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
