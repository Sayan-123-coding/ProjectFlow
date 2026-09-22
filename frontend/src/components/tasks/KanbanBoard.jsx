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
            className="flex-shrink-0 w-80 flex flex-col bg-gray-50 rounded-lg p-4 border border-gray-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-700">{col.title}</h4>
              <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                {columnTasks.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4 min-h-[200px]">
              {columnTasks.length === 0 ? (
                <div className="h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-4">
                  <span className="text-sm text-gray-400">Drop tasks here</span>
                </div>
              ) : (
                columnTasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={`cursor-grab active:cursor-grabbing transition-opacity ${draggedTaskId === task.id ? 'opacity-50' : 'opacity-100'}`}
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
