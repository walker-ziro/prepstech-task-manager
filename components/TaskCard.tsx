import React from 'react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

const statusStyles: { [key in TaskStatus]: { bg: string, text: string, dot: string } } = {
  [TaskStatus.Pending]: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  [TaskStatus.InProgress]: { bg: 'bg-blue-900/50', text: 'text-blue-300', dot: 'bg-blue-400' },
  [TaskStatus.Done]: { bg: 'bg-green-900/50', text: 'text-green-300', dot: 'bg-green-400' },
};

const priorityStyles: { [key in TaskPriority]: { bg: string, text: string, dot: string } } = {
  [TaskPriority.Low]: { bg: 'bg-gray-900/50', text: 'text-gray-300', dot: 'bg-gray-400' },
  [TaskPriority.Medium]: { bg: 'bg-orange-900/50', text: 'text-orange-300', dot: 'bg-orange-400' },
  [TaskPriority.High]: { bg: 'bg-red-900/50', text: 'text-red-300', dot: 'bg-red-400' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const statusStyle = statusStyles[task.status];
  const priorityStyle = priorityStyles[task.priority || TaskPriority.Medium];
  
  const formattedStatus = task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedPriority = task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium';
  
  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const now = new Date();
    const isOverdue = date < now;
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue
    };
  };
  
  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-5 flex flex-col h-full hover:shadow-sky-500/10 transition-shadow duration-300 border border-slate-700">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white break-words">{task.title}</h3>
          <div className="flex flex-row sm:flex-col gap-1 sm:gap-1 flex-wrap sm:flex-nowrap">
            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} whitespace-nowrap`}>
              <svg className={`-ml-0.5 mr-1 sm:mr-1.5 h-2 w-2 ${statusStyle.dot}`} fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {formattedStatus}
            </span>
            <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text} whitespace-nowrap`}>
              <svg className={`-ml-0.5 mr-1 sm:mr-1.5 h-2 w-2 ${priorityStyle.dot}`} fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              {formattedPriority}
            </span>
          </div>
        </div>
        
        <p className="text-slate-400 text-sm mb-3 break-words">{task.description}</p>
        
        {/* Due Date */}
        {dueDateInfo && (
          <div className={`text-xs mb-3 flex items-center gap-1 ${dueDateInfo.isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Due: {dueDateInfo.formatted}
            {dueDateInfo.isOverdue && <span className="font-semibold">(Overdue)</span>}
          </div>
        )}
        
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-sky-600/20 text-sky-300 border border-sky-600/30">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {Object.keys(task.extras || {}).length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Extras</h4>
            <div className="bg-slate-900/50 p-3 rounded-md">
              <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all">
                {JSON.stringify(task.extras, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end items-center space-x-1 sm:space-x-2 pt-4 border-t border-slate-700/50">
        <button 
          onClick={onEdit} 
          className="text-slate-400 hover:text-white transition-colors p-2 sm:p-2 rounded-md hover:bg-slate-700/50 touch-manipulation"
          aria-label="Edit task"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
        </button>
        <button 
          onClick={onDelete} 
          className="text-slate-400 hover:text-red-400 transition-colors p-2 sm:p-2 rounded-md hover:bg-slate-700/50 touch-manipulation"
          aria-label="Delete task"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
