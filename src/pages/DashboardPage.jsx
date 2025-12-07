import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Trophy, Clock, Flame, BookOpen, Target, 
  TrendingUp, Calendar, ChevronRight, Gem, Award,
  CheckCircle2, Circle, Play, ArrowLeft
} from 'lucide-react';
import { getUserStats, getProgress } from '../utils/userApi';
import { useUser } from '../context/UserContext';

export const DashboardPage = ({ courses, onSelectCourse, onBack }) => {
  const { currentUser } = useUser();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsData, progressData] = await Promise.all([
          getUserStats(),
          getProgress()
        ]);
        setStats(statsData);
        setProgress(progressData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] flex items-center justify-center">
        <div className="animate-pulse text-purple-400 text-xl">Loading dashboard...</div>
      </div>
    );
  }

  const completedModulesCount = progress?.completedModules?.length || 0;
  const totalModules = courses.reduce((acc, course) => acc + (course.modules?.length || 0), 0);
  const progressPercent = totalModules > 0 ? Math.round((completedModulesCount / totalModules) * 100) : 0;

  // Format time spent
  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Get courses in progress
  const coursesInProgress = courses.filter(course => {
    const courseModules = course.modules?.map(m => m.id) || [];
    const completed = progress?.completedModules || [];
    const hasStarted = courseModules.some(id => completed.includes(id));
    const isComplete = courseModules.every(id => completed.includes(id));
    return hasStarted && !isComplete;
  });

  // Get completed courses
  const completedCourses = courses.filter(course => {
    const courseModules = course.modules?.map(m => m.id) || [];
    if (courseModules.length === 0) return false;
    const completed = progress?.completedModules || [];
    return courseModules.every(id => completed.includes(id));
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0d1117] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Courses
            </button>
            <h1 className="text-3xl font-black text-white">
              Welcome back, <span className="text-purple-400">{currentUser?.displayName || currentUser?.username}</span>!
            </h1>
            <p className="text-gray-400 mt-1">Track your learning progress and achievements</p>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-900/50 to-pink-900/50 px-4 py-2 rounded-xl border border-purple-500/30">
            <Gem className="w-5 h-5 text-purple-400" />
            <span className="text-white font-bold">{completedModulesCount} Gems Collected</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Modules Completed */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-950/30 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-gray-400 text-sm">Modules Completed</span>
            </div>
            <div className="text-3xl font-black text-white">{completedModulesCount}</div>
            <div className="text-sm text-gray-500 mt-1">of {totalModules} total</div>
          </div>

          {/* Current Streak */}
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-950/30 border border-orange-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-gray-400 text-sm">Current Streak</span>
            </div>
            <div className="text-3xl font-black text-white">{stats?.current_streak_days || 0}</div>
            <div className="text-sm text-gray-500 mt-1">days in a row</div>
          </div>

          {/* Time Spent */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-950/30 border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">Time Spent</span>
            </div>
            <div className="text-3xl font-black text-white">{formatTime(stats?.total_time_spent_seconds)}</div>
            <div className="text-sm text-gray-500 mt-1">learning</div>
          </div>

          {/* Longest Streak */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">Best Streak</span>
            </div>
            <div className="text-3xl font-black text-white">{stats?.longest_streak_days || 0}</div>
            <div className="text-sm text-gray-500 mt-1">days record</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Overall Progress
            </h2>
            <span className="text-2xl font-black text-purple-400">{progressPercent}%</span>
          </div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">
            {completedModulesCount} of {totalModules} modules completed
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Continue Learning */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-blue-400" />
              Continue Learning
            </h2>
            {coursesInProgress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No courses in progress</p>
                <button 
                  onClick={onBack}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors"
                >
                  Start a Course
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {coursesInProgress.map(course => {
                  const courseModules = course.modules?.map(m => m.id) || [];
                  const completed = progress?.completedModules || [];
                  const courseCompleted = courseModules.filter(id => completed.includes(id)).length;
                  const coursePercent = Math.round((courseCompleted / courseModules.length) * 100);
                  
                  return (
                    <button
                      key={course.id}
                      onClick={() => onSelectCourse(course)}
                      className="w-full flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-gray-700 rounded-lg">
                        {course.icon || <BookOpen className="w-5 h-5 text-gray-400" />}
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${coursePercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{coursePercent}%</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Courses */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              Completed Courses
            </h2>
            {completedCourses.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No courses completed yet</p>
                <p className="text-gray-600 text-sm mt-1">Keep learning to earn your first completion!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedCourses.map(course => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-900/20 to-emerald-950/20 border border-emerald-500/20 rounded-lg"
                  >
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-emerald-400 text-sm">{course.modules?.length || 0} modules completed</p>
                    </div>
                    <Trophy className="w-5 h-5 text-yellow-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentActivity && stats.recentActivity.length > 0 && (
          <div className="mt-6 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-purple-400" />
              Activity This Week
            </h2>
            <div className="flex items-end justify-between gap-2 h-32">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const dayActivity = stats.recentActivity.find(a => {
                  const date = new Date(a.date);
                  return date.getDay() === (idx + 1) % 7;
                });
                const count = dayActivity?.count || 0;
                const maxCount = Math.max(...stats.recentActivity.map(a => a.count), 1);
                const height = count > 0 ? Math.max((count / maxCount) * 100, 10) : 5;
                
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        count > 0 ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 'bg-gray-700'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
