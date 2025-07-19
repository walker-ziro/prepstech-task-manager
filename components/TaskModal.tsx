import React, { useState, useEffect } from 'react';
import type { Task } from '../types';
import { TaskStatus, TaskPriority } from '../types';

interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  extras: Record<string, any>;
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
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setError('');
        setIsSaving(false);
        if (taskToEdit) {
            setTitle(taskToEdit.title);
            setDescription(taskToEdit.description);
            setStatus(taskToEdit.status);
            setPriority(taskToEdit.priority || TaskPriority.Medium);
            setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
            setTags(taskToEdit.tags || []);
            setTagInput('');
        } else {
            setTitle('');
            setDescription('');
            setStatus(TaskStatus.Pending);
            setPriority(TaskPriority.Medium);
            setDueDate('');
            setTags([]);
            setTagInput('');
        }
    }
  }, [isOpen, taskToEdit]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
        setError('Title is required and cannot be empty.');
        return;
    }
    
    setIsSaving(true);
    try {
      await onSave({ 
        title: trimmedTitle, 
        description, 
        status, 
        priority,
        dueDate: dueDate || null,
        tags,
        extras: {} 
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setIsSaving(false);
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
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="text-sm font-medium text-slate-300 block mb-1">Status</label>
                            <select id="status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" disabled={isSaving}>
                                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="text-sm font-medium text-slate-300 block mb-1">Priority</label>
                            <select id="priority" value={priority} onChange={e => setPriority(e.target.value as TaskPriority)} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" disabled={isSaving}>
                                <option value={TaskPriority.Low}>Low</option>
                                <option value={TaskPriority.Medium}>Medium</option>
                                <option value={TaskPriority.High}>High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="dueDate" className="text-sm font-medium text-slate-300 block mb-1">Due Date</label>
                        <input 
                            id="dueDate" 
                            type="date" 
                            value={dueDate} 
                            onChange={e => setDueDate(e.target.value)} 
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" 
                            disabled={isSaving}
                        />
                    </div>

                    <div>
                        <label htmlFor="tags" className="text-sm font-medium text-slate-300 block mb-1">Tags</label>
                        <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input 
                                    id="tags"
                                    type="text" 
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyPress={handleTagInputKeyPress}
                                    placeholder="work, personal, urgent"
                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm sm:text-base" 
                                    disabled={isSaving}
                                />
                                <button 
                                    type="button" 
                                    onClick={handleAddTag}
                                    disabled={isSaving || !tagInput.trim()}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:bg-sky-800"
                                >
                                    Add Tag
                                </button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <span key={index} className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-sky-600/20 text-sky-300 text-xs sm:text-sm rounded-full border border-sky-600/30">
                                            {tag}
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-sky-400 hover:text-sky-200 ml-1 text-sm"
                                                disabled={isSaving}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
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