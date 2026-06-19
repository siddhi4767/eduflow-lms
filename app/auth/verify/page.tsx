"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GraduationCap, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { motion } from "framer-motion";

function VerifyEmailContent() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const onSubmit = useCallback(() => {
    if (success || error) return; // Prevent multiple submissions

    if (!token) {
      setError("Missing verification token.");
      setIsLoading(false);
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.success) {
          setSuccess(data.success);
          // Redirect to login after a few seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        }
      })
      .catch(() => {
        setError("Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, success, error, router]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="max-w-md w-full relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-[#0f172a]/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Verifying your email</h1>
          
          <div className="flex flex-col items-center justify-center min-h-[120px]">
            {isLoading && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-slate-400">Please wait while we verify your token...</p>
              </div>
            )}
            
            {success && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <p className="text-emerald-400 font-medium">{success}</p>
                <p className="text-sm text-slate-400">Redirecting to login...</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }}
                className="flex flex-col items-center space-y-4"
              >
                <XCircle className="w-12 h-12 text-rose-400" />
                <p className="text-rose-400 font-medium">{error}</p>
              </motion.div>
            )}
          </div>

          <div className="mt-8">
            <Link 
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              Back to login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center p-4"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
