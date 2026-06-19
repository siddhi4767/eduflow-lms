"use client";

import { useApp } from "../../context/AppContext";
import { useParams, useRouter } from "next/navigation";
import { DashboardCard } from "../../components/ui/DashboardCard";
import { UserAvatar } from "../../components/ui/UserAvatar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, BookOpen, Clock, Award, Activity, Calendar, CheckCircle2, PlayCircle, FileText } from "lucide-react";
import ActivityTimeline from "../../components/ActivityTimeline";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { StatCard } from "../../components/ui/StatCard";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { students, courses, enrollments, activities, assignments, quizzes } = useApp();
  
  const student = students.find((s) => s.id === params?.id);
  
  if (!student) {
    return (
      <div className="p-10 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student not found</h2>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const safeStudentName = student.name || "Unknown Student";
  const studentEnrollments = enrollments.filter((e) => e.studentName === safeStudentName);
  const studentActivities = activities.filter((a) => a.message.includes(safeStudentName));
  
  // Derived Statistics
  const coursesEnrolled = studentEnrollments.length;
  const coursesCompleted = studentEnrollments.filter(e => e.status === "Completed").length;
  const activeCourses = studentEnrollments.filter(e => e.status === "Active").length;
  
  // Calculate progress
  const studentAssignments = assignments.filter(a => a.studentId === student.id);
  const studentQuizzes = quizzes.filter(q => q.studentId === student.id);
  
  const totalTasks = studentAssignments.length + studentQuizzes.length;
  const completedTasks = 
    studentAssignments.filter(a => a.status === "Graded" || a.status === "Submitted").length +
    studentQuizzes.filter(q => q.status === "Completed").length;

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Real Learning Timeline Data from DB Activities
  const learningTimeline = studentActivities.map(a => ({
    id: a.id,
    type: a.type,
    message: a.message,
    timestamp: a.timestamp,
    icon: a.icon
  }));

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Students
      </button>

      {/* 1. Profile Header */}
      <DashboardCard className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-violet-600" />
        <div className="relative pt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="relative p-2 bg-white dark:bg-slate-950 rounded-full shadow-xl">
            <UserAvatar name={student.name} size="xl" />
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{student.name || "Unknown Student"}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 text-sm">
                <Mail size={14} /> {student.email || "No email provided"}
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <Calendar size={14} /> Joined {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="pb-2">
            <StatusBadge status="Active" className="text-sm px-4 py-1.5" />
          </div>
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard title="Enrolled" value={coursesEnrolled} icon={<BookOpen size={20} />} />
            <StatCard title="Completed" value={coursesCompleted} icon={<CheckCircle2 size={20} />} />
            <StatCard title="Active" value={activeCourses} icon={<PlayCircle size={20} />} />
            <StatCard title="Progress" value={progress} prefix="" suffix="%" icon={<Award size={20} />} />
          </div>

          {/* 2. Course Progress */}
          <DashboardCard>
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-indigo-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Course Progress</h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-8">
              <ProgressRing progress={progress} size={140} strokeWidth={12} />
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{student.course}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Instructor: {courses.find(c => c.name === student.course)?.id || "TBD"}
                </p>
                <div className="flex justify-center sm:justify-start items-center gap-4">
                  <button className="px-5 py-2.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold rounded-xl text-sm transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
                    View Grades
                  </button>
                  <button className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
                    Message Student
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* 3. Enrollment History */}
          <DashboardCard>
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="text-emerald-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Enrollment History</h2>
            </div>
            {studentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {studentEnrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{e.courseName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enrolled on: {e.enrolledDate}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No enrollments found.</p>
            )}
          </DashboardCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* 5. Performance Metrics */}
          <DashboardCard>
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Metrics</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</span>
                <span className="font-bold text-slate-900 dark:text-white">{totalTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Tasks Completed</span>
                <span className="font-bold text-slate-900 dark:text-white">{completedTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <span className="text-sm text-slate-600 dark:text-slate-400">Task Completion Rate</span>
                <span className="font-bold text-slate-900 dark:text-white">{progress}%</span>
              </div>
            </div>
          </DashboardCard>

          {/* 4. Activity Timeline */}
          <DashboardCard>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-rose-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Learning Timeline</h2>
            </div>
            {learningTimeline.length > 0 ? (
              <ActivityTimeline activities={learningTimeline} maxItems={5} />
            ) : (
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            )}
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
