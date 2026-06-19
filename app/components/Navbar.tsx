import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Menu, Search, Bell, X, User, Settings, LogOut } from "lucide-react";
import { UserAvatar } from "./ui/UserAvatar";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const PAGE_TITLES: Record<string, string> = {
  "/":           "Home",
  "/dashboard":  "Dashboard",
  "/students":   "Students",
  "/courses":    "Courses",
  "/enrollment": "Enrollments",
  "/settings":   "Settings",
  "/profile":    "Profile",
};

interface Props {
  onToggleSidebar: () => void;
}

export default function Navbar({ onToggleSidebar }: Props) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] || "EduFlow";
  const { user, logout } = useAuth();

  const [showSearch, setShowSearch] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Close dropdowns when clicking outside
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-9 h-9 rounded-lg bg-surface-muted hover:bg-surface-border flex items-center justify-center transition-colors text-slate-500"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        {!showSearch && (
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">{pageTitle}</h2>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5 flex-1 justify-end">
        
        {/* Mobile Search Toggle */}
        <button 
          className="md:hidden w-9 h-9 flex items-center justify-center text-slate-500 hover:text-foreground transition-colors"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>

        {/* Global Search */}
        <div className={cn(
          "items-center gap-2 px-3 py-1.5 bg-surface-muted border border-surface-border rounded-full text-slate-400 focus-within:ring-2 focus-within:ring-primary/50 transition-all",
          showSearch ? "flex absolute left-14 right-16 z-10 bg-surface" : "hidden md:flex"
        )}>
          <Search size={14} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm text-foreground w-full md:w-48 placeholder:text-slate-400"
            autoFocus={showSearch}
          />
          <div className="hidden md:flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface border border-surface-border shadow-sm ml-2 text-slate-500">
            ⌘K
          </div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            className={cn(
              "relative w-9 h-9 flex items-center justify-center transition-colors rounded-full",
              showNotifs ? "bg-surface-muted text-foreground" : "text-slate-500 hover:text-foreground hover:bg-surface-muted"
            )}
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-danger rounded-full border-2 border-surface" />
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-surface border border-surface-border shadow-xl rounded-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground">Notifications</h3>
                  <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="p-8 text-center text-slate-500">
                  <Bell size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No new notifications</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative pl-2 sm:pl-4 sm:border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
          {user && (
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
              <UserAvatar name={user.name} src={user.image} size="sm" />
            </button>
          )}

          <AnimatePresence>
            {showProfile && user && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 bg-surface border border-surface-border shadow-xl rounded-2xl overflow-hidden py-2"
              >
                <div className="px-4 py-3 border-b border-surface-border mb-2">
                  <p className="font-bold text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="px-2 space-y-1">
                  <Link href="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-surface-muted hover:text-foreground transition-colors">
                    <User size={16} /> My Profile
                  </Link>
                  <Link href="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-surface-muted hover:text-foreground transition-colors">
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={() => { setShowProfile(false); logout(); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
