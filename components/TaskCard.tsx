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
    // Creating a date object from the string
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent date changes
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
  // Safely access nested 'extras' properties
  const priority = extras?.priority;
  const dueDate = extras?.dueDate;
  const tags = extras?.tags;

  // Function to get a CSS class based on priority level
  const getPriorityClass = (level?: string) => {
    const priorityLevel = level?.toLowerCase();
    if (priorityLevel === 'high') return 'priority-high';
    if (priorityLevel === 'medium') return 'priority-medium';
    if (priorityLevel === 'low') return 'priority-low';
    return 'priority-none';
  };
  
  const priorityClass = getPriorityClass(priority);

  return (
    <div className={`task-card ${priorityClass}`}>
      <div className="task-card-header">
        <h3>{title}</h3>
        {priority && (
          <span className={`priority-badge ${priorityClass}`}>
            {priority}
          </span>
        )}
      </div>
      <p className="task-description">{description}</p>
      
      <div className="task-meta">
        <div className="task-meta-item">
          <strong>Status:</strong> {status}
        </div>
        <div className="task-meta-item">
          <strong>Due:</strong> {formatDate(dueDate)}
        </div>
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