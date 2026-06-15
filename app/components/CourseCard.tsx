type Props = {
  name: string;
  duration: string;
  fee: string;
  category?: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function CourseCard({ name, duration, fee, category, onEdit, onDelete }: Props) {
  // Generate a random gradient based on the course name
  const charCode = name.charCodeAt(0) || 65;
  const gradients = [
    "from-blue-500 to-indigo-600",
    "from-emerald-400 to-teal-600",
    "from-orange-400 to-rose-500",
    "from-purple-500 to-pink-600",
    "from-cyan-400 to-blue-600",
  ];
  const bgGradient = gradients[charCode % gradients.length];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col h-full">
      {/* Thumbnail Header */}
      <div className={`h-24 sm:h-32 w-full bg-gradient-to-br ${bgGradient} relative flex items-center justify-center`}>
        <span className="text-4xl sm:text-5xl text-white/80 font-bold mix-blend-overlay">
          {name.charAt(0).toUpperCase()}
        </span>
        {category && (
          <span className="absolute top-3 left-3 bg-black/20 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-md font-medium">
            {category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1" title={name}>{name}</h2>
        
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>₹{fee}</span>
          </div>
        </div>

        {/* Spacer to push actions to bottom */}
        <div className="flex-1"></div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={onEdit}
            className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
