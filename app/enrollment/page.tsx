"use client";

// =============================================================================
// enrollment/page.tsx  — EduFlow LMS  |  Enrollment Module
//
// CHANGES:
//   • Removed local interfaces, DEFAULT_ENROLLMENTS, STUDENT_OPTIONS, COURSE_OPTIONS
//   • Dropdowns now populated dynamically from context (students & courses)
//   • CRUD via useApp(), toasts via useToast()
//   • StatBadge component retained (co-located helper)
// =============================================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import EnrollmentCard from "../components/EnrollmentCard";
import ConfirmModal from "../components/ConfirmModal";
import type { Status } from "../data/types";
import { enrollmentSchema } from "../lib/schemas";

const STATUS_OPTIONS: Status[] = ["Active", "Pending", "Completed"];

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function EnrollmentPage() {
  const {
    students,
    courses,
    enrollments,
    addEnrollment,
    updateEnrollment,
    deleteEnrollment,
  } = useApp();
  const { addToast } = useToast();

  // Local form state
  const [studentName, setStudentName] = useState<string>("");
  const [courseName,  setCourseName]  = useState<string>("");
  const [status,      setStatus]      = useState<Status>("Active");

  // Edit & Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState<string>("");

  // Sort
  type SortField = "studentName" | "courseName" | "status" | "enrolledDate";
  const [sortField, setSortField] = useState<SortField>("enrolledDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Derived
  const isEditing  = editingId !== null;
  // Validation errors
  const [errors, setErrors] = useState<{ studentName?: string; courseName?: string }>({});

  const filtered = enrollments.filter(
    (e) =>
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.courseName.toLowerCase().includes(search.toLowerCase())  ||
      e.status.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    let valA = a[sortField].toLowerCase();
    let valB = b[sortField].toLowerCase();
    
    if (sortField === "enrolledDate") {
      // sort by date string
      const dateA = new Date(a.enrolledDate).getTime();
      const dateB = new Date(b.enrolledDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const activeCount    = enrollments.filter((e) => e.status === "Active").length;
  const pendingCount   = enrollments.filter((e) => e.status === "Pending").length;
  const completedCount = enrollments.filter((e) => e.status === "Completed").length;

  function validate(): boolean {
    const result = enrollmentSchema.safeParse({ studentName, courseName, enrolledDate: todayISO(), status });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }

  // ── Add ────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!validate()) return;
    try {
      await addEnrollment({
        studentName,
        courseName,
        enrolledDate: todayISO(),
        status,
      });
      addToast("Enrollment added successfully", "success");
      resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    }
  }

  // ── Start editing ──────────────────────────────────────────────────────
  function startEdit(enrollment: { id: string; studentName: string; courseName: string; status: Status }): void {
    setEditingId(enrollment.id);
    setStudentName(enrollment.studentName);
    setCourseName(enrollment.courseName);
    setStatus(enrollment.status);
    setErrors({});
  }

  // ── Save edit ──────────────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!validate() || editingId === null) return;
    try {
      const existing = enrollments.find((e) => e.id === editingId);
      await updateEnrollment(editingId, {
        studentName,
        courseName,
        enrolledDate: existing?.enrolledDate || todayISO(),
        status,
      });
      addToast("Enrollment updated successfully", "success");
      resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────
  function promptDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteEnrollment(deleteId);
      addToast("Enrollment deleted", "info");
      if (editingId === deleteId) resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    } finally {
      setDeleteId(null);
    }
  }

  // ── Reset form ─────────────────────────────────────────────────────────
  function resetForm(): void {
    setStudentName("");
    setCourseName("");
    setStatus("Active");
    setEditingId(null);
    setErrors({});
  }

  return (
    <div className="p-4 sm:p-8 flex-1 max-w-6xl mx-auto w-full">
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Enrollment"
        message="Are you sure you want to delete this enrollment? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Enrollment</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Manage student course registrations
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex gap-3 sm:gap-4 flex-wrap mb-8">
        <StatBadge label="Total"     value={enrollments.length} color="indigo" />
        <StatBadge label="Active"    value={activeCount}        color="green"  />
        <StatBadge label="Pending"   value={pendingCount}       color="yellow" />
        <StatBadge label="Completed" value={completedCount}     color="blue"   />
      </div>

      {/* Add / Edit Form */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
          {isEditing ? "✏️  Edit Enrollment" : "➕  New Enrollment"}
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Student dropdown — dynamically from context */}
          <div className="flex flex-col flex-1 w-full">
            <select
              value={studentName}
              onChange={(e) => { setStudentName(e.target.value); setErrors(prev => ({ ...prev, studentName: undefined })); }}
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                errors.studentName ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
              } text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
            >
              <option value="" disabled>Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.studentName && <span className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">{errors.studentName}</span>}
          </div>

          {/* Course dropdown — dynamically from context */}
          <div className="flex flex-col flex-1 w-full">
            <select
              value={courseName}
              onChange={(e) => { setCourseName(e.target.value); setErrors(prev => ({ ...prev, courseName: undefined })); }}
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                errors.courseName ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
              } text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
            >
              <option value="" disabled>Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.courseName && <span className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">{errors.courseName}</span>}
          </div>

          {/* Status dropdown */}
          <div className="flex flex-col flex-1 w-full">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={isEditing ? handleSaveEdit : handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm transition-colors whitespace-nowrap mt-1 sm:mt-0"
          >
            {isEditing ? "Save Changes" : "+ Enroll"}
          </button>

          {isEditing && (
            <button
              onClick={resetForm}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap mt-1 sm:mt-0"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍  Search enrollments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
          />
          <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap hidden sm:inline-block">
            {filtered.length} / {enrollments.length}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="enrolledDate">Date</option>
            <option value="studentName">Student</option>
            <option value="courseName">Course</option>
            <option value="status">Status</option>
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            title="Toggle Sort Order"
          >
            {sortOrder === "asc" ? "⬇️" : "⬆️"}
          </button>
        </div>
      </div>

      {/* Enrollment List */}
      {sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No enrollments found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search
              ? `Your search for "${search}" did not match any enrollments.`
              : "Get started by enrolling a student above!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedFiltered.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              studentName={enrollment.studentName}
              courseName={enrollment.courseName}
              enrolledDate={enrollment.enrolledDate}
              status={enrollment.status}
              onEdit={() => startEdit(enrollment)}
              onDelete={() => promptDelete(enrollment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── StatBadge (co-located helper component) ──────────────────────────────────

type BadgeColor = "indigo" | "green" | "yellow" | "blue";

const BADGE_STYLES: Record<BadgeColor, string> = {
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  green:  "bg-green-500/10  border-green-500/20  text-green-400",
  yellow: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  blue:   "bg-blue-500/10   border-blue-500/20   text-blue-400",
};

function StatBadge({ label, value, color }: { label: string; value: number; color: BadgeColor }) {
  return (
    <div className={`px-4 sm:px-5 py-3 rounded-xl border ${BADGE_STYLES[color]} text-center min-w-[80px] sm:min-w-[100px]`}>
      <p className="text-xl sm:text-2xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
    </div>
  );
}