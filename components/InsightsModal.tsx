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
      const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
      const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
      const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

      // Upcoming deadlines (next 7 days)
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = tasks
        .filter(task => task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= nextWeek)
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
        .slice(0, 5);

      // Overdue tasks
      const overdueTasks = tasks
        .filter(task => task.dueDate && new Date(task.dueDate) < now && task.status !== 'done')
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
      
      if (tasks.length === 0) {
        setAiRecommendations(`## 🚀 Get Started with Your Task Management

You don't have any tasks yet! Here are some tips to get you started:

### 📝 Creating Your First Tasks
- Start with 2-3 simple, achievable tasks
- Make each task specific and actionable
- Use clear, descriptive titles

### 💡 Productivity Tips
- **Start Small**: Begin with tasks that take 15-30 minutes
- **Set Clear Goals**: Each task should have a specific outcome
- **Prioritize**: Focus on the most important task first

Once you add some tasks, I'll be able to provide personalized insights about your productivity patterns and specific recommendations for your workflow!`);
        return;
      }

      // Load AI recommendations separately in the background
      const fetchAIRecommendations = async () => {
        setIsLoadingAI(true);
        try {
          const result = await generateInsights(tasks);
          
          // Handle both old format (string) and new format (object)
          if (typeof result === 'string') {
            setAiRecommendations(result);
          } else {
            // Handle the new format with insight wrapper
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
                  {/* Total Tasks */}
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
                  
                  {/* Completed Tasks */}
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
                  
                  {/* In Progress Tasks */}
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
                  
                  {/* Pending Tasks */}
                  <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{insights.statistics.pendingTasks}</div>
                        <div className="text-sm text-blue-300/70">Pending</div>
                      </div>
                      <div className="p-2 bg-blue-700/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Completion Rate */}
                  <div className="bg-sky-900/20 rounded-lg p-4 border border-sky-700/50 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-sky-400">{insights.statistics.completionRate}%</div>
                        <div className="text-sm text-sky-300/70">Completion Rate</div>
                      </div>
                      <div className="p-2 bg-sky-700/30 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overdue Tasks */}
                  {insights.statistics.overdueTasks > 0 && (
                    <div className="bg-red-900/20 rounded-lg p-4 border border-red-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-red-400">{insights.statistics.overdueTasks}</div>
                          <div className="text-sm text-red-300/70">Overdue</div>
                        </div>
                        <div className="p-2 bg-red-700/30 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Priority Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5l3-1m-3 1l3 1" />
                    </svg>
                    Priority Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <span className="text-white font-medium">High</span>
                      </div>
                      <span className="text-slate-300">{insights.statistics.highPriorityTasks} tasks</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                        <span className="text-white font-medium">Medium</span>
                      </div>
                      <span className="text-slate-300">{insights.statistics.mediumPriorityTasks} tasks</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                        <span className="text-white font-medium">Low</span>
                      </div>
                      <span className="text-slate-300">{insights.statistics.lowPriorityTasks} tasks</span>
                    </div>
                  </div>
                </div>

                {/* Upcoming Deadlines */}
                {insights.statistics.upcomingDeadlines && insights.statistics.upcomingDeadlines.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upcoming Deadlines
                    </h3>
                    
                    <div className="space-y-2">
                      {insights.statistics.upcomingDeadlines.map((task: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-400' : task.priority === 'medium' ? 'bg-orange-400' : 'bg-gray-400'}`}></div>
                            <span className="text-white font-medium">{task.title}</span>
                          </div>
                          <span className="text-slate-300 text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recommendations - Shows with loading state */}
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
                  <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-p:text-slate-300 prose-p:mb-4 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-white prose-ul:text-slate-300 prose-ul:mb-4 prose-li:marker:text-sky-400 prose-li:mb-2 prose-h2:text-xl prose-h2:text-sky-300 prose-h2:border-b prose-h2:border-slate-600 prose-h2:pb-2 prose-h2:mb-4 prose-h2:mt-6 prose-h3:text-lg prose-h3:text-indigo-300 prose-h3:mt-6 prose-h3:mb-3">
                    <ReactMarkdown>{aiRecommendations}</ReactMarkdown>
                  </div>
                ) : error ? (
                  <p className="text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</p>
                ) : null}
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