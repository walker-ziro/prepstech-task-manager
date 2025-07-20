import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

// Helper function to format the date string for display
const formatDate = (dateString?: string): string => {
  if (!dateString) {
    return 'No due date';
  }
  try {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Failed to format date:', error);
    return 'Invalid Date';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { title, description, status, extras } = task;
  const priority = extras?.priority;
  const dueDate = extras?.dueDate;
  const tags = extras?.tags;

  const getPriorityClass = (level?: string) => {
    const priorityLevel = level?.toLowerCase();
    if (priorityLevel === 'high') return 'priority-high';
    if (priorityLevel === 'medium') return 'priority-medium';
    if (priorityLevel === 'low') return 'priority-low';
    return 'priority-none';
  };
  
  const priorityClass = getPriorityClass(priority);

  return (
    // The priorityClass is added here for the border color
    <div className={`task-card ${priorityClass}`}>
      <div> {/* This wrapper keeps content together */}
        <div className="task-card-header">
          <h3>{title}</h3>
          {status && <span className="status-badge">{status}</span>}
        </div>
        <p>{description}</p>
        
        {/* New details are grouped here */}
        <div className="task-details">
          {priority && (
            <div className={`priority-indicator ${priorityClass}`}>
              <strong>Priority:</strong> {priority}
            </div>
          )}
          {dueDate && (
            <div>
              <strong>Due:</strong> {formatDate(dueDate)}
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="task-tags">
            {tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="task-actions">
        <button className="edit-btn" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;