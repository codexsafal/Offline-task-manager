
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus } from './types';
import { TaskInput } from './components/TaskInput';
import { TaskCard } from './components/TaskCard';
import { Button } from './components/Button';

type SortOption = 'createdAt' | 'deadline';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const saved = localStorage.getItem('zenith_tasks_v2');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('zenith_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const addTask = (data: { title: string; description: string; deadline: string }) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      description: data.description,
      deadline: data.deadline,
      status: TaskStatus.TODO,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const sortTasks = (taskList: Task[]) => {
    return [...taskList].sort((a, b) => {
      if (sortBy === 'createdAt') return b.createdAt - a.createdAt;
      if (sortBy === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return 0;
    });
  };

  const tasksByStatus = useMemo(() => {
    return {
      [TaskStatus.TODO]: sortTasks(tasks.filter(t => t.status === TaskStatus.TODO)),
      [TaskStatus.IN_PROGRESS]: sortTasks(tasks.filter(t => t.status === TaskStatus.IN_PROGRESS)),
      [TaskStatus.DONE]: sortTasks(tasks.filter(t => t.status === TaskStatus.DONE)),
    };
  }, [tasks, sortBy]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      done: tasks.filter(t => t.status === TaskStatus.DONE).length,
      // Fixed: corrected status check to use OR comparison instead of string concatenation
      todo: tasks.filter(t => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS).length,
      active: tasks.filter(t => t.status !== TaskStatus.DONE).length
    };
  }, [tasks]);

  const completionRate = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId;
    setDragOverStatus(null);
    setDraggedTaskId(null);

    if (taskId) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    }
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-indigo-100 transition-colors duration-500 dark:bg-slate-950 dark:selection:bg-indigo-900/40">
      {!isOnline && (
        <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] py-1.5 text-center fixed top-0 left-0 right-0 z-[60] shadow-sm animate-in slide-in-from-top duration-300">
          Offline Mode • Local Access Only
        </div>
      )}

      <header className={`sticky top-0 z-50 glass border-b border-slate-200/50 transition-all dark:border-slate-800/50 ${!isOnline ? 'mt-7' : ''}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-11 h-11 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-slate-200 dark:shadow-none group-hover:rotate-6 transition-transform">Z</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">Zenith</h1>
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Productivity OS</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl glass border border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
              ) : (
                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
              )}
            </button>

            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sort</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-indigo-600 dark:text-indigo-400 uppercase p-0 outline-none"
              >
                <option value="createdAt" className="dark:bg-slate-900">Creation</option>
                <option value="deadline" className="dark:bg-slate-900">Deadline</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:block w-32">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Progress</span>
                <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">{Math.round(completionRate)}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-xl rotate-3">
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=User`} alt="Profile" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 mt-12 space-y-12">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tighter mb-2">Workspace Feed</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Focus on your key objectives.</p>
           </div>
           <div className="w-full md:w-96">
             <TaskInput onAdd={addTask} />
           </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start min-h-[600px]">
          {/* TO DO COLUMN */}
          <div 
            className={`flex flex-col h-full rounded-[2.5rem] p-6 transition-all duration-300 ${dragOverStatus === TaskStatus.TODO ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-200 dark:ring-indigo-800 ring-dashed' : 'bg-transparent'}`}
            onDragOver={(e) => handleDragOver(e, TaskStatus.TODO)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, TaskStatus.TODO)}
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                To Do
              </h3>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg">{tasksByStatus[TaskStatus.TODO].length}</span>
            </div>
            
            <div className="space-y-4">
              {tasksByStatus[TaskStatus.TODO].map((task) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>

          {/* IN PROGRESS COLUMN */}
          <div 
            className={`flex flex-col h-full rounded-[2.5rem] p-6 transition-all duration-300 ${dragOverStatus === TaskStatus.IN_PROGRESS ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-200 dark:ring-indigo-800 ring-dashed' : 'bg-transparent'}`}
            onDragOver={(e) => handleDragOver(e, TaskStatus.IN_PROGRESS)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, TaskStatus.IN_PROGRESS)}
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)] animate-pulse" />
                Working
              </h3>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg">{tasksByStatus[TaskStatus.IN_PROGRESS].length}</span>
            </div>
            
            <div className="space-y-4">
              {tasksByStatus[TaskStatus.IN_PROGRESS].map((task) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>

          {/* DONE COLUMN */}
          <div 
            className={`flex flex-col h-full rounded-[2.5rem] p-6 transition-all duration-300 ${dragOverStatus === TaskStatus.DONE ? 'bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-200 dark:ring-indigo-800 ring-dashed' : 'bg-transparent'}`}
            onDragOver={(e) => handleDragOver(e, TaskStatus.DONE)}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, TaskStatus.DONE)}
          >
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Finished
              </h3>
              <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-lg">{tasksByStatus[TaskStatus.DONE].length}</span>
            </div>
            
            <div className="space-y-4">
              {tasksByStatus[TaskStatus.DONE].map((task) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  onDelete={deleteTask}
                  onStatusChange={updateTaskStatus}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Global Stats Footer */}
        <div className="glass rounded-[3rem] p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative overflow-hidden flex items-center justify-between">
           <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h4 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Active Objectives</h4>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.active} items pending</p>
              </div>
           </div>
           <div className="text-right">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zenith Efficiency Index</span>
             <p className="text-4xl font-black text-slate-900 dark:text-white leading-none mt-1">{Math.round(completionRate)}%</p>
           </div>
        </div>
      </main>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass border border-slate-200/50 dark:border-slate-800/50 px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-3 z-40">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" /></svg>
        Drag and drop to reorder
      </div>
    </div>
  );
};

export default App;
