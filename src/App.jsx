import { useState, useEffect, useCallback } from "react";
import { STORAGE_KEY } from "./utils/constants";
import { todayStr, addDays } from "./utils/dateHelpers";
import { getIntervalDays } from "./utils/spacedRepetition";
import {
  loadProblems,
  saveProblems,
  logReviewToday,
  exportData,
} from "./utils/storage";

import Toast from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ProblemModal from "./components/ProblemModal";
import DashboardView from "./components/DashboardView";
import AllProblemsView from "./components/AllProblemsView";

export default function App() {
  const [problems, setProblems] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load problems from localStorage on mount
  useEffect(() => {
    setProblems(loadProblems());
  }, []);

  // Save problems to localStorage on change
  useEffect(() => {
    if (problems.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveProblems(problems);
    }
  }, [problems]);

  const showToast = useCallback(
    (msg) => setToast({ visible: true, message: msg }),
    []
  );

  const handleSaveProblem = useCallback((problem, confidenceChanged) => {
    setProblems((prev) => {
      const idx = prev.findIndex((p) => p.id === problem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = problem;
        return updated;
      }
      return [...prev, problem];
    });
    if (confidenceChanged) logReviewToday();
    setEditingProblem(null);
  }, []);

  const handleEdit = useCallback((problem) => {
    setEditingProblem(problem);
    setModalOpen(true);
  }, []);

  const handleDeleteRequest = useCallback(
    (problem) => setDeleteTarget(problem),
    []
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      setProblems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  const handleReview = useCallback(
    (problemId, newConfidence) => {
      const today = todayStr();
      const intervalDays = getIntervalDays(newConfidence);
      setProblems((prev) =>
        prev.map((p) =>
          p.id === problemId
            ? {
                ...p,
                confidence: newConfidence,
                lastReviewed: today,
                nextReviewDate: addDays(today, intervalDays),
              }
            : p
        )
      );
      logReviewToday();
      showToast(
        `Reviewed! Next review in ${intervalDays} day${intervalDays !== 1 ? "s" : ""}`
      );
    },
    [showToast]
  );

  const handleDismiss = useCallback((problemId) => {
    setProblems((prev) =>
      prev.map((p) =>
        p.id === problemId
          ? { ...p, nextReviewDate: addDays(todayStr(), 1) }
          : p
      )
    );
  }, []);

  const handleSetAllDue = useCallback(() => {
    const today = todayStr();
    setProblems((prev) => prev.map((p) => ({ ...p, nextReviewDate: today })));
  }, []);

  const handleRestoreDates = useCallback((snapshot) => {
    setProblems((prev) =>
      prev.map((p) => ({
        ...p,
        nextReviewDate: snapshot[p.id] || p.nextReviewDate,
      }))
    );
  }, []);

  const openAddModal = () => {
    setEditingProblem(null);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-pb-bg pb-[70px]">
      <Toast
        message={toast.message}
        isVisible={toast.visible}
        onDone={() => setToast({ visible: false, message: "" })}
      />
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete ${deleteTarget?.title || "problem"}?`}
        message="This cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <Header
        onAddClick={openAddModal}
        onExport={exportData}
        problemCount={problems.length}
      />

      {activeTab === "dashboard" && (
        <DashboardView
          problems={problems}
          onReview={handleReview}
          onDismiss={handleDismiss}
          onSetAllDue={handleSetAllDue}
          onRestoreDates={handleRestoreDates}
        />
      )}
      {activeTab === "problems" && (
        <AllProblemsView
          problems={problems}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
      )}

      <NavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddClick={openAddModal}
      />
      <ProblemModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveProblem}
        initialData={editingProblem}
      />
    </div>
  );
}
