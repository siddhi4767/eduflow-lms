"use client";

// =============================================================================
// students/page.tsx  — EduFlow LMS  |  Students Module
//
// CHANGES:
//   • Removed local Student interface, DEFAULT_STUDENTS, generateId()
//   • Now reads students from AppContext via useApp() hook
//   • CRUD operations call context actions (addStudent, updateStudent, etc.)
//   • Toast notifications on every add/edit/delete
//   • Course field uses a <select> populated from context courses
// =============================================================================

import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import StudentCard from "../components/StudentCard";
import FormInput from "../components/FormInput";
import ConfirmModal from "../components/ConfirmModal";
import { studentSchema } from "../lib/schemas";

export default function StudentsPage() {
  const { students, courses, addStudent, updateStudent, deleteStudent } = useApp();
  const { addToast } = useToast();

  // Local form state
  const [name, setName]     = useState("");
  const [email, setEmail]   = useState("");
  const [course, setCourse] = useState("");

  // Edit & Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Sort
  type SortField = "name" | "course";
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; email?: string; course?: string }>({});

  function validate(): boolean {
    const result = studentSchema.safeParse({ name: name.trim(), email: email.trim(), course: course.trim() });
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
      await addStudent({ name: name.trim(), email: email.trim(), course: course.trim() });
      addToast("Student added successfully", "success");
      resetForm();
    } catch (e: unknown) {
      if (e instanceof Error) addToast(e.message, "error");
    }
  }

  // ── Start editing ──────────────────────────────────────────────────────
  function startEdit(student: { id: string; name: string; email: string; course: string }) {
    setEditingId(student.id);
    setName(student.name);
    setEmail(student.email);
    setCourse(student.course);
    setErrors({});
  }

  // ── Save edit ──────────────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!validate() || editingId === null) return;
    try {
      await updateStudent(editingId, { name: name.trim(), email: email.trim(), course: course.trim() });
      addToast("Student updated successfully", "success");
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
      await deleteStudent(deleteId);
      addToast("Student deleted", "info");
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
    setEmail("");
    setCourse("");
    setEditingId(null);
    setErrors({});
  }

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase())
  );

  const sortedFiltered = [...filtered].sort((a, b) => {
    const valA = a[sortField].toLowerCase();
    const valB = b[sortField].toLowerCase();
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const isEditing = editingId !== null;

  return (
    <div className="p-4 sm:p-8 flex-1 max-w-6xl mx-auto w-full">
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmText="Delete"
      />

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Students</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          {students.length} student{students.length !== 1 ? "s" : ""} enrolled
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl mb-8 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4">
          {isEditing ? "✏️  Edit Student" : "➕  Add New Student"}
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-4">
          <FormInput
            type="text"
            placeholder="Full Name"
            value={name}
            error={errors.name}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (isEditing) handleSaveEdit(); else handleAdd(); }
            }}
          />
          <FormInput
            type="email"
            placeholder="Email Address"
            value={email}
            error={errors.email}
            onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (isEditing) handleSaveEdit(); else handleAdd(); }
            }}
          />
          <div className="flex flex-col w-full flex-1">
            <select
              value={course}
              onChange={(e) => { setCourse(e.target.value); setErrors(prev => ({ ...prev, course: undefined })); }}
              className={`w-full bg-slate-50 dark:bg-slate-900 border ${
                errors.course ? "border-red-500/50 focus:border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
              } text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors`}
            >
              <option value="" disabled>Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
            {errors.course && <span className="text-red-500 dark:text-red-400 text-xs mt-1.5 ml-1">{errors.course}</span>}
          </div>

          <button
            onClick={isEditing ? handleSaveEdit : handleAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-sm transition-colors whitespace-nowrap mt-1 sm:mt-0"
          >
            {isEditing ? "Save Changes" : "+ Add Student"}
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
            placeholder="🔍  Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-sm"
          />
          <span className="text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap hidden sm:inline-block">
            {filtered.length} / {students.length}
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
            <option value="course">Course</option>
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

      {/* Student List */}
      {sortedFiltered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No students found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {search
              ? `Your search for "${search}" did not match any students.`
              : "Get started by adding your first student above!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sortedFiltered.map((student) => (
            <StudentCard
              key={student.id}
              name={student.name}
              email={student.email}
              course={student.course}
              onEdit={() => startEdit(student)}
              onDelete={() => promptDelete(student.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}