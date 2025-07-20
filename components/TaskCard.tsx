import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

// Helper function to format the date string
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'No due date';
  try {
    const date = new Date(dateString);
    // Add time zone offset to prevent off-by-one day errors
    const offset = date.getTimezoneOffset();
    const correctedDate = new Date(date.getTime() + offset * 60 * 1000);
    return correctedDate.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const { title, description, status, extras } = task;
  const { priority, dueDate, tags } = extras || {};

  // Define priority class for styling
  const getPriorityClass = (priorityLevel?: string) => {
    switch (priorityLevel?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-none';
    }
  };

  return (
    <div className={`task-card ${getPriorityClass(priority)}`}>
      <div className="task-card-header">
        <h3>{title}</h3>
        {priority && (
          <span className={`priority-badge ${getPriorityClass(priority)}`}>
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
          <strong>Due Date:</strong> {formatDate(dueDate)}
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