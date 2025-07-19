import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as apiService from '../services/apiService';
import type { Task, User } from '../types';
import { TaskStatus, TaskPriority } from '../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import InsightsModal from './InsightsModal';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [showOverdue, setShowOverdue] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [isInsightsModalOpen, setInsightsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const fetchedTasks = await apiService.fetchTasks();
        setTasks(fetchedTasks);
      } catch (err: any) {
        setError(err.message || 'Failed to load tasks.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = () => {
    setTaskToEdit(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiService.deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
    }
  };

  const handleSaveTask = async (taskData: { 
    title: string; 
    description: string; 
    status: TaskStatus; 
    priority: TaskPriority;
    dueDate: string | null;
    tags: string[];
    extras: Record<string, any> 
  }) => {
    try {
      if (taskToEdit) {
        const updatedTask = await apiService.updateTask(taskToEdit.id, taskData);
        setTasks(tasks.map(t => t.id === taskToEdit.id ? updatedTask : t));
      } else {
        const newTask = await apiService.createTask(
          taskData.title, 
          taskData.description, 
          taskData.status, 
          taskData.priority,
          taskData.dueDate,
          taskData.tags,
          taskData.extras
        );
        setTasks([...tasks, newTask]);
      }
      setTaskModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Status filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }
    
    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }
    
    // Tag filter
    if (tagFilter) {
      filtered = filtered.filter(task => 
        task.tags && task.tags.some(tag => 
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }
    
    // Overdue filter
    if (showOverdue) {
      const now = new Date();
      filtered = filtered.filter(task => 
        task.dueDate && new Date(task.dueDate) < now && task.status !== 'done'
      );
    }
    
    return filtered;
  }, [tasks, filter, priorityFilter, tagFilter, showOverdue]);

  const FilterButton = useCallback(({ value, label }: {value: TaskStatus | 'all', label: string}) => (
      <button
          onClick={() => setFilter(value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === value 
              ? 'bg-sky-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
      >
          {label}
      </button>
  ), [filter]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
        </div>
      );
    }
    
    if (error) {
       return (
            <div className="text-center py-16 px-4 bg-slate-800 rounded-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 <h3 className="mt-2 text-lg font-medium text-white">Something went wrong</h3>
                 <p className="mt-1 text-sm text-red-400">{error}</p>
            </div>
       )
    }

    if (filteredTasks.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEditTask(task)}
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-16 px-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           <h3 className="mt-2 text-lg font-medium text-white">No tasks found</h3>
           <p className="mt-1 text-sm text-slate-400">
              {filter === 'all' ? 'Get started by adding a new task.' : `You have no ${filter} tasks.`}
           </p>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-slate-900">
        <header className="bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-white truncate pr-4">
                Welcome, {user.email}
              </h1>
              <div className="flex items-center space-x-2 sm:space-x-4">
                 <button 
                  onClick={() => setInsightsModalOpen(true)}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 whitespace-nowrap"
                >
                  Get Insights
                </button>
                <button 
                  onClick={onLogout}
                  className="px-3 sm:px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                <FilterButton value="all" label="All" />
                <FilterButton value={TaskStatus.Pending} label="Pending" />
                <FilterButton value={TaskStatus.InProgress} label="In Progress" />
                <FilterButton value={TaskStatus.Done} label="Done" />
             </div>
            <button
              onClick={handleAddTask}
              className="w-full sm:w-auto px-4 py-2 font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-900 flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              Add New Task
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4">
              {/* Priority Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-slate-300 min-w-0">Priority:</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                  className="w-full sm:w-auto px-3 py-1 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                >
                  <option value="all">All Priorities</option>
                  <option value={TaskPriority.High}>High</option>
                  <option value={TaskPriority.Medium}>Medium</option>
                  <option value={TaskPriority.Low}>Low</option>
                </select>
              </div>

              {/* Tag Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <label className="text-sm font-medium text-slate-300 min-w-0">Tag:</label>
                <input
                  type="text"
                  placeholder="Filter by tag..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full sm:w-auto px-3 py-1 bg-slate-700 text-white rounded-md border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-400 text-sm"
                />
              </div>

              {/* Overdue Filter */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOverdue}
                    onChange={(e) => setShowOverdue(e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-slate-700 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="whitespace-nowrap">Show only overdue</span>
                </label>
              </div>

              {/* Clear All Filters */}
              {(priorityFilter !== 'all' || tagFilter || showOverdue) && (
                <button
                  onClick={() => {
                    setPriorityFilter('all');
                    setTagFilter('');
                    setShowOverdue(false);
                  }}
                  className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors underline w-full sm:w-auto text-center sm:text-left"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Filter Summary */}
            <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400 text-center sm:text-left">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </div>
          </div>
          
          {renderContent()}

        </main>
      </div>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <InsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setInsightsModalOpen(false)}
        tasks={tasks}
      />
    </>
  );
};

export default DashboardPage;