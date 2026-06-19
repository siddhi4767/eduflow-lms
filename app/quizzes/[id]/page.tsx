"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { cn } from "../../lib/utils";

// Quiz data is now fetched dynamically from the database

export default function QuizTakingInterface({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quizzes/${params.id}`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        setQuiz(data);
        setTimeLeft(data.duration * 60);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [params.id]);

  // Timer Logic
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [quiz.questions[currentIndex].id]: optionId }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    // Send to backend
    try {
      await fetch("/api/quizzes/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          score: scorePercentage
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-10 flex justify-center text-slate-500">Loading quiz...</div>;
  if (error || !quiz) return <div className="p-10 text-rose-500 text-center">{error || "Quiz not found"}</div>;
  if (!quiz.questions || quiz.questions.length === 0) return <div className="p-10 text-center text-slate-500">This quiz has no questions yet.</div>;

  // Calculate Score
  const correctCount = quiz.questions.filter((q: any) => answers[q.id] === q.correctOptionId).length;
  const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);

  // Progress Bar Width
  const progressPercent = ((Object.keys(answers).length) / quiz.questions.length) * 100;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex flex-col">
      
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/quizzes")}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white line-clamp-1">{quiz.title}</h1>
            <p className="text-xs text-slate-500">{quiz.course?.name || "Course"}</p>
          </div>
        </div>

        {!isSubmitted && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold border shadow-sm",
            timeLeft < 60 
              ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 animate-pulse" 
              : "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
          )}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        )}
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 lg:py-12">
        <AnimatePresence mode="wait">
          
          {!isSubmitted ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold text-slate-500">
                  <span>Question {currentIndex + 1} of {quiz.questions.length}</span>
                  <span>{Math.round(progressPercent)}% Answered</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-indigo-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-relaxed">
                  {quiz.questions[currentIndex].text}
                </h2>
                
                <div className="space-y-4">
                  {quiz.questions[currentIndex].options.map((option: any) => {
                    const isSelected = answers[quiz.questions[currentIndex].id] === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleSelectOption(option.id)}
                        className={cn(
                          "w-full text-left px-6 py-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                          isSelected 
                            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 dark:border-indigo-500" 
                            : "border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <span className={cn(
                          "font-medium",
                          isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {option.text}
                        </span>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                          isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 dark:border-slate-600 group-hover:border-indigo-300"
                        )}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                {currentIndex === quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < quiz.questions.length}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/25"
                  >
                    Submit Quiz
                    <CheckCircle2 size={18} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition-colors"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            
            /* ── RESULTS SCREEN ── */
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-indigo-500/10 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
                    <Trophy size={48} className="text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Quiz Completed!</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">You successfully finished the assessment.</p>
                  
                  <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Final Score</p>
                      <p className={cn(
                        "text-5xl font-black",
                        scorePercentage >= 80 ? "text-emerald-500" : scorePercentage >= 50 ? "text-amber-500" : "text-rose-500"
                      )}>
                        {scorePercentage}%
                      </p>
                    </div>
                    <div className="w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    <div className="flex gap-8 text-left">
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Correct</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{correctCount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Mistakes</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.questions.length - correctCount}</p>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => router.push("/quizzes")}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold rounded-xl transition-colors shadow-lg"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>

              {/* Answer Review Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">Answer Review</h3>
                
                {quiz.questions.map((q: any, idx: number) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctOptionId;
                  
                  return (
                    <div key={q.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex-shrink-0">
                          {isCorrect ? (
                            <CheckCircle2 size={24} className="text-emerald-500" />
                          ) : (
                            <XCircle size={24} className="text-rose-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white mb-3">
                            {idx + 1}. {q.text}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt: any) => {
                              const isUsersChoice = opt.id === userAnswer;
                              const isActuallyCorrect = opt.id === q.correctOptionId;
                              
                              let style = "text-slate-500 dark:text-slate-400";
                              if (isActuallyCorrect) style = "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg";
                              else if (isUsersChoice && !isCorrect) style = "text-rose-600 dark:text-rose-400 font-medium line-through bg-rose-50 dark:bg-rose-500/10 p-2 rounded-lg";
                              
                              return (
                                <div key={opt.id} className={cn("text-sm flex items-center gap-2", style)}>
                                  <span className="w-5 inline-block text-slate-400 font-mono text-xs">{opt.id.toUpperCase()}.</span>
                                  {opt.text}
                                  {isActuallyCorrect && isUsersChoice && <span className="text-xs ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full font-bold">Your Answer</span>}
                                  {!isActuallyCorrect && isUsersChoice && <span className="text-xs ml-2 px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-full font-bold">Your Answer</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
