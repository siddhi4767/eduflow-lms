"use client";

// =============================================================================
// courses/page.tsx  — EduFlow LMS  |  Courses Module
//
// CHANGES:
//   • Removed local Course interface, DEFAULT_COURSES, generateId()
//   • Now reads courses from AppContext via useApp() hook
//   • Added category field (was missing from original)
//   • Toast notifications on every add/edit/delete
// =============================================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import CourseCard from "../components/CourseCard";
import FormInput from "../components/FormInput";
import ConfirmModal from "../components/ConfirmModal";
import { courseSchema } from "../lib/schemas";

const CATEGORIES = ["Frontend", "Backend", "Fullstack", "Language", "DevOps", "Other"];

export default function CoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useApp();
  const { addToast } = useToast();

  // Local form state
  const [name, setName]         = useState("");
  const [duration, setDuration] = useState("");
  const [fee, setFee]           = useState("");
  const [category, setCategory] = useState("Frontend");

  // Edit & Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Sort
  type SortField = "name" | "fee" | "category";
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; duration?: string; fee?: string }>({});

  function validate(): boolean {
    const result = courseSchema.safeParse({ name: name.trim(), duration: duration.trim(), fee: fee.trim(), category });
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
      await addCourse({
        name: name.trim(),
        duration: duration.trim(),
        fee: fee.trim(),
        category,
      });
      addToast("Course added successfully", "success");
      resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    }
  }

  // ── Start editing ──────────────────────────────────────────────────────
  function startEdit(course: { id: string; name: string; duration: string; fee: string; category: string }) {
    setEditingId(course.id);
    setName(course.name);
    setDuration(course.duration);
    setFee(course.fee);
    setCategory(course.category);
    setErrors({});
  }

  // ── Save edit ──────────────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!validate() || editingId === null) return;
    try {
      await updateCourse(editingId, {
        name: name.trim(),
        duration: duration.trim(),
        fee: fee.trim(),
        category,
      });
      addToast("Course updated successfully", "success");
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
      await deleteCourse(deleteId);
      addToast("Course deleted", "info");
      if (editingId === deleteId) resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    } finally {
      setDeleteId(null);
    }
  }

  // ── Reset form ─────────────────────────────────────────────────────────
  function resetForm() {
    setName("");
    setDuration("");
    setFee("");
    setCategory("Frontend");
    setEditingId(null);
    setErrors({});
  }

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.duration.toLowerCase().includes(search.toLowerCase()) ||
    c.fee.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    let valA = a[sortField].toLowerCase();
    let valB = b[sortField].toLowerCase();
    if (sortField === "fee") {
      valA = a.fee.replace(/[^0-9.]/g, "");
      valB = b.fee.replace(/[^0-9.]/g, "");
      return sortOrder === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    }
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const isEditing = editingId !== null;

  return (
    <div className="p-4 sm:p-8 flex-1 max-w-6xl mx-auto w-full">
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {courses.length} course{courses.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
          {isEditing ? "✏️  Edit Course" : "➕  Add New Course"}
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          <FormInput
            type="text"
            placeholder="Course Name"
            value={name}
            error={errors.name}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            onKeyDown={(e) => { if (e.key === "Enter") { if (isEditing) handleSaveEdit(); else handleAdd(); } }}
          />
          <FormInput
            type="text"
            placeholder="Duration (e.g. 8 Weeks)"
            value={duration}
            error={errors.duration}
            onChange={(e) => { setDuration(e.target.value); setErrors(prev => ({ ...prev, duration: undefined })); }}
            onKeyDown={(e) => { if (e.key === "Enter") { if (isEditing) handleSaveEdit(); else handleAdd(); } }}
          />
          <FormInput
            type="text"
            placeholder="Fee (₹)"
            value={fee}
            error={errors.fee}
            onChange={(e) => { setFee(e.target.value); setErrors(prev => ({ ...prev, fee: undefined })); }}
            onKeyDown={(e) => { if (e.key === "Enter") { if (isEditing) handleSaveEdit(); else handleAdd(); } }}
          />
          <div className="flex flex-col w-full flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white
                         rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                         focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            onClick={isEditing ? handleSaveEdit : handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm transition-colors whitespace-nowrap mt-1 sm:mt-0"
          >
            {isEditing ? "Save Changes" : "+ Add Course"}
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
            placeholder="🔍  Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
          />
          <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap hidden sm:inline-block">
            {filtered.length} / {courses.length}
          </span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:border-indigo-500 shadow-sm"
          >
            <option value="name">Name</option>
            <option value="category">Category</option>
            <option value="fee">Fee</option>
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

      {/* Course List */}
      {sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No courses found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search
              ? `Your search for "${search}" did not match any courses.`
              : "Get started by adding your first course above!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedFiltered.map((course) => (
            <CourseCard
              key={course.id}
              name={course.name}
              duration={course.duration}
              fee={course.fee}
              category={course.category}
              onEdit={() => startEdit(course)}
              onDelete={() => promptDelete(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}