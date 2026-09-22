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
            className={`flex-shrink-0 w-[340px] flex flex-col surface-0 rounded-2xl transition-colors duration-200 p-2 ${
              draggedTaskId ? 'border-pf-600/50 bg-pf-900/60' : ''
            }`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-3 px-3 py-2">
              <h4 className="text-sm font-bold text-pf-200 tracking-wide">{col.title}</h4>
              <span className="inline-flex items-center justify-center min-w-[24px] h-6 rounded-md bg-pf-800/40 px-2 text-[11px] font-bold text-pf-200 border border-pf-600/20">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-3 min-h-[200px] bg-pf-900/30 rounded-xl p-2 border border-pf-800/20">
              {columnTasks.length === 0 ? (
                <div className="h-full min-h-[150px] border-2 border-dashed border-pf-800/50 rounded-xl flex flex-col items-center justify-center p-4">
                  <svg className="w-8 h-8 text-pf-600 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-[13px] font-medium text-pf-400">No tasks</span>
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
