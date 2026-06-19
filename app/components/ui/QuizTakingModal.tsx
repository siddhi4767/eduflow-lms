"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface QuizTakingModalProps {
  quizId: string;
  title: string;
  courseName: string;
  durationMinutes: number;
  totalQuestions: number;
  questionsData?: any[];
  onClose: () => void;
  onSubmit: (score: number) => Promise<void>;
}

// Generate some mock questions deterministically based on the quiz ID so it's consistent
function generateMockQuestions(total: number, courseName: string) {
  const questions = [];
  for (let i = 1; i <= total; i++) {
    questions.push({
      id: `q_${i}`,
      text: `Which of the following is a key concept in ${courseName}? (Question ${i})`,
      options: [
        "Encapsulation and Abstraction",
        "Randomized Data Generation",
        "Hardware Acceleration",
        "Network Protocol Routing"
      ],
      correctAnswer: 0 // Mock correct answer is always option 0
    });
  }
  return questions;
}

export function QuizTakingModal({ quizId, title, courseName, durationMinutes, totalQuestions, questionsData, onClose, onSubmit }: QuizTakingModalProps) {
  const { addToast } = useToast();
  
  // Use provided questions or fallback to mock
  const [questions] = useState(() => {
    if (questionsData && questionsData.length > 0) {
      return questionsData;
    }
    return generateMockQuestions(totalQuestions, courseName);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    if (questions.length === 0) return 0;
    let correctCount = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });
    return Math.round((correctCount / questions.length) * 100); 
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    addToast("Submitting quiz...", "info");
    const score = calculateScore();
    try {
      await onSubmit(score);
    } catch (e) {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface border border-surface-border w-full max-w-3xl rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
            <div>
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
              <p className="text-sm font-medium text-slate-500">{courseName}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-warning/10 text-warning px-4 py-2 rounded-xl font-bold border border-warning/20 shadow-sm">
                <Clock size={18} />
                <span className="tabular-nums tracking-tight">{formatTime(timeLeft)}</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
                title="Exit Quiz"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-surface-muted">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10">
            <div className="mb-8">
              <span className="text-sm font-bold text-primary tracking-widest uppercase mb-2 block">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <h3 className="text-2xl font-bold text-foreground leading-snug">
                {currentQ.text}
              </h3>
            </div>

            <div className="space-y-3">
              {currentQ.options.map((option: string, idx: number) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isSubmitting}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                      isSelected 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-surface-border hover:border-primary/40 hover:bg-surface-muted'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 group-hover:border-primary/50'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`font-medium text-lg ${isSelected ? 'text-foreground' : 'text-slate-600'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-surface-border flex items-center justify-between bg-surface-muted/50">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isSubmitting}
              className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 text-slate-500 hover:text-foreground hover:bg-surface-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            
            <div className="flex items-center gap-3">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-success hover:bg-success/90 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  <CheckCircle size={18} />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 bg-primary hover:bg-primary-hover text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
