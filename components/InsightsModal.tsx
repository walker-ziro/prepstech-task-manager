import React, { useState, useEffect } from 'react';
import { generateInsights } from '../services/apiService';
import type { Task } from '../types';
import ReactMarkdown from 'react-markdown';

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-8">
      <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-sky-500"></div>
  </div>
);

const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose, tasks }) => {
  const [insights, setInsights] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'done').length;
      const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Priority breakdown
      const highPriorityTasks = tasks.filter(task => task.extras?.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(task => task.extras?.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(task => task.extras?.priority === 'low').length;

      // Upcoming deadlines (next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks
        .filter(task => task.extras?.dueDate && new Date(task.extras.dueDate) >= now && new Date(task.extras.dueDate) <= nextWeek)
        .sort((a, b) => new Date(a.extras?.dueDate!).getTime() - new Date(b.extras?.dueDate!).getTime())
        .slice(0, 5);

      // Overdue tasks
      const overdueTasks = tasks
        .filter(task => task.extras?.dueDate && new Date(task.extras.dueDate) < now && task.status !== 'done')
        .length;

      const immediateInsights = {
        statistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          completionRate,
          highPriorityTasks,
          mediumPriorityTasks,
          lowPriorityTasks,
          upcomingDeadlines,
          overdueTasks
        }
      };

      setInsights(immediateInsights);
      setError('');
      
      // The `if (tasks.length === 0)` block has been removed to allow the AI to generate all messages.

      // Load AI recommendations in the background for all cases.
      const fetchAIRecommendations = async () => {
        setIsLoadingAI(true);
        try {
          const result = await generateInsights(tasks);
          
          if (typeof result === 'string') {
            setAiRecommendations(result);
          } else {
            const insightData = (result as any).insight || result;
            setAiRecommendations(insightData.recommendations || 'No recommendations available.');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch AI recommendations.');
          setAiRecommendations('Unable to load AI recommendations at this time.');
        } finally {
          setIsLoadingAI(false);
        }
      };

      fetchAIRecommendations();
    }
  }, [isOpen, tasks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl relative border border-slate-700 max-h-[95vh] sm:max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            <span className="hidden sm:inline">Productivity Insights</span>
            <span className="sm:hidden">Insights</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto">
          {!insights && <Spinner />}
          {error && !insights && <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>}
          {insights && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Task Statistics
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Cards for stats... */}
                  <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-slate-100">{insights.statistics.totalTasks}</div>
                        <div className="text-sm text-slate-400">Total Tasks</div>
                      </div>
                      <div className="p-2 bg-slate-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{insights.statistics.completedTasks}</div>
                        <div className="text-sm text-green-300/70">Completed</div>
                      </div>
                      <div className="p-2 bg-green-700/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">{insights.statistics.inProgressTasks}</div>
                        <div className="text-sm text-yellow-300/70">In Progress</div>
                      </div>
                      <div className="p-2 bg-yellow-700/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Recommendations
                    {isLoadingAI && (
                      <div className="ml-2 w-4 h-4 border-2 border-dashed rounded-full animate-spin border-indigo-400"></div>
                    )}
                  </h3>
                  
                  {isLoadingAI ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-indigo-400 mx-auto mb-3"></div>
                        <p className="text-slate-400 text-sm">Generating AI insights...</p>
                      </div>
                    </div>
                  ) : aiRecommendations ? (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-p:text-slate-300 whitespace-pre-wrap">
                      <ReactMarkdown>{aiRecommendations}</ReactMarkdown>
                    </div>
                  ) : error ? (
                    <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-slate-700/50 px-6 py-4 flex justify-end rounded-b-lg mt-auto">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default InsightsModal;
