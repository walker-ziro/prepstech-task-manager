import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  extras: {
    priority: TaskPriority;
    dueDate: string | null;
    tags: string[];
    [key: string]: any;
  };
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormData) => Promise<void>;
  taskToEdit: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [extrasJson, setExtrasJson] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Default extras template with placeholders
  const defaultExtras = {
    priority: TaskPriority.Medium,
    dueDate: null,
    tags: ["work"],
    category: "general",
    estimatedHours: 2,
    assignee: "unassigned"
  };

  useEffect(() => {
    if (isOpen) {
        setError('');
        setIsSaving(false);
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setStatus(taskToEdit.status);
            // Pretty print the existing extras JSON
            setExtrasJson(JSON.stringify(taskToEdit.extras || defaultExtras, null, 2));
        } else {
            setTitle('');
            setDescription('');
            setStatus(TaskStatus.Pending);
            // Pretty print the default extras template
            setExtrasJson(JSON.stringify(defaultExtras, null, 2));
        }
    }
  }, [isOpen, taskToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        setError('Title is required and cannot be empty.');
        return;
    }

    // Validate and parse JSON
    let parsedExtras;
    try {
      parsedExtras = JSON.parse(extrasJson);
      
      // Validate that required fields are present and correctly typed
      if (typeof parsedExtras !== 'object' || parsedExtras === null) {
        throw new Error('Extras must be a valid JSON object');
      }
      
      // Ensure required fields have proper defaults
      if (!parsedExtras.priority) {
        parsedExtras.priority = TaskPriority.Medium;
      }
      if (!Array.isArray(parsedExtras.tags)) {
        parsedExtras.tags = [];
      }
      
    } catch (jsonError: any) {
      setError(`Invalid JSON format in extras: ${jsonError.message}`);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ 
        title: trimmedTitle, 
        description, 
        status,
        extras: parsedExtras
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to format JSON
  const formatJson = () => {
    try {
      const parsed = JSON.parse(extrasJson);
      setExtrasJson(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // If JSON is invalid, don't format
    }
  };

  // Helper function to add common fields
  const addCommonField = (fieldName: string, defaultValue: any) => {
    try {
      const parsed = JSON.parse(extrasJson);
      if (!parsed.hasOwnProperty(fieldName)) {
        parsed[fieldName] = defaultValue;
        setExtrasJson(JSON.stringify(parsed, null, 2));
      }
    } catch (e) {
      setError('Please fix JSON format before adding fields');
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl relative border border-slate-700 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} disabled={isSaving} className="absolute top-2 right-2 sm:top-3 sm:right-3 text-slate-400 hover:text-white transition-colors p-1 rounded-full disabled:opacity-50 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <form onSubmit={handleSubmit}>
            <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 pr-8">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="text-sm font-medium text-slate-300 block mb-1">Title</label>
                        <input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" required disabled={isSaving} />
                    </div>
                    <div>
                        <label htmlFor="description" className="text-sm font-medium text-slate-300 block mb-1">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base resize-none" disabled={isSaving}></textarea>
                    </div>
                    
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="extras" className="text-sm font-medium text-slate-300">Task Extras (JSON)</label>
                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={formatJson}
                                    className="text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 text-slate-300 rounded transition-colors"
                                    disabled={isSaving}
                                >
                                    Format JSON
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => addCommonField('category', 'development')}
                                    className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                                    disabled={isSaving}
                                >
                                    + Category
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => addCommonField('estimatedHours', 4)}
                                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                                    disabled={isSaving}
                                >
                                    + Hours
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => addCommonField('assignee', 'team-member')}
                                    className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded transition-colors"
                                    disabled={isSaving}
                                >
                                    + Assignee
                                </button>
                            </div>
                        </div>
                        <textarea 
                            id="extras"
                            value={extrasJson} 
                            onChange={e => setExtrasJson(e.target.value)}
                            rows={12}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-green-400 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono resize-vertical"
                            placeholder="Enter task extras as JSON..."
                            disabled={isSaving}
                        />
                        <div className="mt-2 text-xs text-slate-400">
                            <p className="mb-1">💡 <strong>JSON Structure:</strong></p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                                <li><code>priority</code>: "low" | "medium" | "high" | "urgent"</li>
                                <li><code>dueDate</code>: ISO date string or null</li>
                                <li><code>tags</code>: Array of strings (e.g., ["work", "urgent"])</li>
                                <li><code>category</code>: String (e.g., "development", "design")</li>
                                <li><code>estimatedHours</code>: Number of hours</li>
                                <li><code>assignee</code>: Person responsible for the task</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="text-sm font-medium text-slate-300 block mb-1">Status</label>
                        <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" disabled={isSaving}>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-400 text-center sm:text-left">{error}</p>}
                </div>
            </div>
            <div className="bg-slate-700/50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 rounded-b-lg">
                <button type="button" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 rounded-md hover:bg-slate-500 transition-colors disabled:opacity-50 order-2 sm:order-1">Cancel</button>
                <button type="submit" disabled={isSaving} className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:bg-sky-800 flex items-center justify-center min-w-24 order-1 sm:order-2">
                  {isSaving ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin"></div> : 'Save Task'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;