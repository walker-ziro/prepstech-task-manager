import React from 'react';
import type { Task } from '../types';
import { TaskStatus } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

// Styles for the task status badge
const statusStyles: { [key in TaskStatus]: { bg: string, text: string, dot: string } } = {
  [TaskStatus.Pending]: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', dot: 'bg-yellow-400' },
  [TaskStatus.InProgress]: { bg: 'bg-blue-900/50', text: 'text-blue-300', dot: 'bg-blue-400' },
  [TaskStatus.Done]: { bg: 'bg-green-900/50', text: 'text-green-300', dot: 'bg-green-400' },
};

// Styles for the task priority
const priorityStyles: { [key: string]: { text: string } } = {
  high: { text: 'text-red-400' },
  medium: { text: 'text-yellow-400' },
  low: { text: 'text-green-400' },
};

// Helper function to format the date string for display
const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    } catch (error) {
        return 'Invalid Date';
    }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const statusStyle = statusStyles[task.status];
  const formattedStatus = task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Extract extras safely
  const priority = task.extras?.priority?.toLowerCase();
  const dueDate = task.extras?.dueDate;
  const tags = task.extras?.tags;
  const priorityStyle = priority ? priorityStyles[priority] : undefined;

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 sm:p-5 flex flex-col h-full hover:shadow-sky-500/10 transition-shadow duration-300 border border-slate-700">
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
          <h3 className="text-base sm:text-lg font-bold text-white break-words">{task.title}</h3>
          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} whitespace-nowrap`}>
            <svg className={`-ml-0.5 mr-1 sm:mr-1.5 h-2 w-2 ${statusStyle.dot}`} fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            {formattedStatus}
          </span>
        </div>
        
        <p className="text-slate-400 text-sm mb-4 break-words">{task.description}</p>
      </div>

      {/* --- Footer section with border top --- */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
        {/* --- NEW: Left side for details --- */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          {priority && priorityStyle && (
            <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1.5 ${priorityStyle.text}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 01-1-1V6z" clipRule="evenodd" />
                </svg>
                <span className={`${priorityStyle.text} font-medium capitalize`}>{priority} Priority</span>
            </div>
          )}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
                {tags.slice(0, 2).map(tag => ( // Limiting to 2 tags for space
                <span key={tag} className="inline-block bg-slate-700 text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">
                    {tag}
                </span>
                ))}
            </div>
          )}
        </div>

        {/* --- Right side for action buttons --- */}
        <div className="flex items-center space-x-1 sm:space-x-2">
            <button 
            onClick={onEdit} 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-700/50 touch-manipulation"
            aria-label="Edit task"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
            </button>
            <button 
            onClick={onDelete} 
            className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-md hover:bg-slate-700/50 touch-manipulation"
            aria-label="Delete task"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;