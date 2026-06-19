import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";

export default function UpcomingTasks() {
  const { assignments, quizzes } = useApp();

  const tasks = useMemo(() => {
    const list: any[] = [];
    const seenAssignments = new Set<string>();
    const seenQuizzes = new Set<string>();
    
    // Process pending assignments
    assignments.forEach(a => {
      if (a.status === "Pending" && !seenAssignments.has(a.assignmentId)) {
        seenAssignments.add(a.assignmentId);
        list.push({
          id: `a_${a.assignmentId}`,
          title: a.title,
          course: a.course,
          dueDate: new Date(a.dueDate).toLocaleDateString(),
          timestamp: new Date(a.dueDate).getTime(),
          type: "assignment",
          color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
        });
      }
    });

    // Process upcoming quizzes
    quizzes.forEach(q => {
      if (q.status === "Not Started" && !seenQuizzes.has(q.quizId)) {
        seenQuizzes.add(q.quizId);
        list.push({
          id: `q_${q.quizId}`,
          title: q.title,
          course: q.course,
          dueDate: "Pending", // Or format based on a specific property if added later
          timestamp: Infinity, // Quizzes might not have due dates in our current schema, put them at the end or derive from created at
          type: "quiz",
          color: "text-orange-500 bg-orange-50 dark:bg-orange-500/10",
        });
      }
    });

    // Sort by due date (closest first)
    list.sort((a, b) => a.timestamp - b.timestamp);

    return list.slice(0, 5); // Return top 5 upcoming tasks
  }, [assignments, quizzes]);

  return (
    <div className="bg-white dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl shadow-sm dark:shadow-none h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Upcoming Tasks
        </h2>
        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
          View Calendar
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming tasks. You are all caught up!</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${task.color}`}>
                {task.type === "assignment" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {task.type === "event" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {task.type === "quiz" && (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {task.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {task.course}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    {task.dueDate}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <button className="mt-4 w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        View All Tasks
      </button>
    </div>
  );
}
