"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { QuizService } from "../lib/api";
import { DashboardCard } from "../components/ui/DashboardCard";
import { motion } from "framer-motion";
import {
  HelpCircle, 
  Clock, 
  PlayCircle,
  CheckCircle2,
  Trophy,
  Filter,
  Search,
  Plus,
  Trash2
} from "lucide-react";
import { cn } from "../lib/utils";
import { QuizTakingModal } from "../components/ui/QuizTakingModal";

type QuizStatus = "Not Started" | "In Progress" | "Completed";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  id: string;
  title: string;
  course: string;
  duration: number; // minutes
  questionsCount: number;
  questions?: QuizQuestion[];
  status: QuizStatus;
  score?: number;
}

export default function QuizzesDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { quizzes, reloadQuizzes, courses } = useApp();
  const isStudent = user?.role?.toUpperCase() === "STUDENT";
  const isTutor = user?.role?.toUpperCase() === "TUTOR";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  // Create Quiz State (Instructor)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCourseId, setNewCourseId] = useState("");
  const [newDuration, setNewDuration] = useState(15);
  
  // Questions Builder State
  const [builderQuestions, setBuilderQuestions] = useState<QuizQuestion[]>([
    { id: "q1", text: "", options: ["", "", "", ""], correctAnswer: 0 }
  ]);

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const handleAddQuestion = () => {
    setBuilderQuestions([
      ...builderQuestions, 
      { id: `q${Date.now()}`, text: "", options: ["", "", "", ""], correctAnswer: 0 }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setBuilderQuestions(builderQuestions.filter((_, i) => i !== idx));
  };

  const handleUpdateQuestion = (idx: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...builderQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    setBuilderQuestions(updated);
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...builderQuestions];
    updated[qIdx].options[optIdx] = value;
    setBuilderQuestions(updated);
  };

  const handleCreateQuiz = async () => {
    if (!newTitle || !newCourseId) return addToast("Please fill title and course", "error");
    
    // Validate questions
    for (const q of builderQuestions) {
      if (!q.text.trim()) return addToast("All questions must have text", "error");
      if (q.options.some(opt => !opt.trim())) return addToast("All options must be filled", "error");
    }

    if (builderQuestions.length === 0) return addToast("Add at least one question", "error");

    try {
      await QuizService.addQuiz({
        title: newTitle,
        courseId: newCourseId,
        duration: newDuration,
        questionsCount: builderQuestions.length,
        questions: builderQuestions
      });
      addToast("Quiz created successfully!", "success");
      setShowCreateForm(false);
      setNewTitle("");
      setNewCourseId("");
      setBuilderQuestions([{ id: "q1", text: "", options: ["", "", "", ""], correctAnswer: 0 }]);
      await reloadQuizzes();
    } catch (e: any) {
      addToast(e.message, "error");
    }
  };

  const handleAttemptQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
  };

  const handleQuizSubmit = async (score: number) => {
    if (!activeQuiz) return;
    try {
      await QuizService.attemptQuiz({ quizId: activeQuiz.id, status: "Completed", score });
      addToast(`Quiz submitted! You scored ${score}%`, "success");
      setActiveQuiz(null);
      await reloadQuizzes();
    } catch (e: any) {
      addToast(e.message, "error");
    }
  };

  const filteredQuizzes = quizzes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const completedQuizzes = quizzes.filter(q => q.score !== null && q.score !== undefined);
  const averageScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((acc, q) => acc + (q.score || 0), 0) / completedQuizzes.length)
    : 0;

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Quizzes & Assessments</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Test your knowledge and track your progress across courses.
          </p>
        </div>
        {isTutor && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
          >
            {showCreateForm ? "Cancel" : "Create Quiz"}
          </button>
        )}
      </div>

      {showCreateForm && isTutor && (
        <DashboardCard className="p-6 sm:p-8 bg-surface border border-surface-border shadow-card">
          <h2 className="text-sm font-bold text-primary uppercase tracking-widest mb-5">New Quiz Definition</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Quiz Title" 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="px-4 py-3 bg-surface-muted border border-surface-border text-foreground rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
            />
            <select 
              value={newCourseId}
              onChange={e => setNewCourseId(e.target.value)}
              className="px-4 py-3 bg-surface-muted border border-surface-border text-foreground rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
            >
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input 
              type="number" 
              placeholder="Duration (mins)"
              value={newDuration}
              onChange={e => setNewDuration(parseInt(e.target.value))}
              className="px-4 py-3 bg-surface-muted border border-surface-border text-foreground rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-bold text-foreground">Questions Builder</h3>
              <button onClick={handleAddQuestion} className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary-hover transition-colors">
                <Plus size={16} /> Add Question
              </button>
            </div>

            {builderQuestions.map((q, qIdx) => (
              <div key={q.id} className="p-5 bg-surface-muted/50 rounded-xl border border-surface-border space-y-4 relative">
                {builderQuestions.length > 1 && (
                  <button 
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-danger transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                
                <div className="pr-10">
                  <input 
                    type="text"
                    placeholder={`Question ${qIdx + 1} Text`}
                    value={q.text}
                    onChange={(e) => handleUpdateQuestion(qIdx, "text", e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-surface-border text-foreground rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-3">
                      <input 
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctAnswer === optIdx}
                        onChange={() => handleUpdateQuestion(qIdx, "correctAnswer", optIdx)}
                        className="w-4 h-4 text-primary bg-surface border-surface-border focus:ring-primary/50"
                        title={`Mark Option ${optIdx + 1} as Correct`}
                      />
                      <input 
                        type="text"
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                        className={cn(
                          "flex-1 px-4 py-2 bg-surface border rounded-lg text-sm outline-none transition-all",
                          q.correctAnswer === optIdx ? "border-primary/50 ring-2 ring-primary/20 text-foreground" : "border-surface-border text-foreground focus:border-primary"
                        )}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleCreateQuiz} className="mt-6 px-8 py-3 bg-success hover:bg-success/90 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2">
            <CheckCircle2 size={18} />
            Save Quiz
          </button>
        </DashboardCard>
      )}

      {/* Stats Row */}
      {isStudent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <DashboardCard className="p-6 flex items-center gap-4 bg-primary text-white border-0 shadow-lg">
            <div className="p-3 bg-white/20 rounded-xl">
              <HelpCircle size={24} />
            </div>
            <div>
              <p className="text-white/80 text-sm font-bold">Total Available</p>
              <p className="text-3xl font-extrabold">{quizzes.filter(q => q.status === "Not Started").length}</p>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-6 flex items-center gap-4 bg-surface border border-surface-border shadow-card">
            <div className="p-3 bg-success/10 text-success rounded-xl border border-success/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold">Completed</p>
              <p className="text-3xl font-extrabold text-foreground">{quizzes.filter(q => q.status === "Completed").length}</p>
            </div>
          </DashboardCard>

          <DashboardCard className="p-6 flex items-center gap-4 bg-surface border border-surface-border shadow-card">
            <div className="p-3 bg-warning/10 text-warning rounded-xl border border-warning/20">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-bold">Average Score</p>
              <p className="text-3xl font-extrabold text-foreground">{averageScore}%</p>
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search quizzes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium text-foreground shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 hidden sm:block" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 px-4 py-3 bg-surface border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-medium text-foreground shadow-sm cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={quiz.id}
            >
              <DashboardCard className="h-full flex flex-col hover:border-primary/50 hover:shadow-lg transition-all group bg-surface border-surface-border shadow-card">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                    <HelpCircle size={20} />
                  </div>
                  {quiz.status === "Completed" ? (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-success/10 text-success border border-success/20 shadow-sm">
                      Score: {quiz.score}%
                    </span>
                  ) : quiz.status === "In Progress" ? (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-warning/10 text-warning border border-warning/20 shadow-sm">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-surface-muted text-slate-500 border border-surface-border shadow-sm">
                      Not Started
                    </span>
                  )}
                </div>

                <div className="flex-1 mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500">{quiz.course}</p>
                </div>

                <div className="flex items-center gap-5 mb-6">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <Clock size={16} className="text-slate-400" />
                    <span>{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                    <HelpCircle size={16} className="text-slate-400" />
                    <span>{quiz.questionsCount} questions</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (quiz.status === "Completed") return addToast("Already completed!", "info");
                    if (!isStudent) return addToast("Only students can take quizzes.", "info");
                    handleAttemptQuiz(quiz);
                  }}
                  disabled={quiz.status === "Completed" || !isStudent}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm",
                    (quiz.status === "Completed" || !isStudent)
                      ? "bg-surface-muted text-slate-400 cursor-not-allowed border border-surface-border"
                      : "bg-primary hover:bg-primary-hover text-white active:scale-95"
                  )}
                >
                  {quiz.status === "Completed" ? "Completed" : quiz.status === "In Progress" ? "Continue Quiz" : "Start Quiz"}
                  <PlayCircle size={18} />
                </button>
              </DashboardCard>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-surface rounded-2xl border border-surface-border shadow-card">
            <HelpCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-bold text-foreground mb-2">No quizzes found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search filters.</p>
          </div>
        )}
      </div>

      {activeQuiz && (
        <QuizTakingModal
          quizId={activeQuiz.id}
          title={activeQuiz.title}
          courseName={activeQuiz.course}
          durationMinutes={activeQuiz.duration}
          totalQuestions={activeQuiz.questionsCount}
          questionsData={activeQuiz.questions}
          onClose={() => setActiveQuiz(null)}
          onSubmit={handleQuizSubmit}
        />
      )}
    </div>
  );
}
