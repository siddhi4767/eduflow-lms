type Props = {
  name: string;
  email: string;
  course: string;
  onEdit: () => void;
  onDelete: () => void;
};

export default function StudentCard({ name, email, course, onEdit, onDelete }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 rounded-xl mb-4 flex items-center justify-between gap-4 hover:shadow-md transition-all group">
      {/* Avatar + Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-lg font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            {email} &nbsp;·&nbsp; <span className="text-indigo-600 dark:text-indigo-400 font-medium">{course}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}