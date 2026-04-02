import { useMemo } from "react";
import { exportData, loadReviewLog, loadReviewEvents } from "./utils/storage";

import useAuth from "./hooks/useAuth";
import useUI from "./hooks/useUI";
import useProblems from "./hooks/useProblems";

import Toast from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import ProblemModal from "./components/ProblemModal";
import DashboardView from "./components/DashboardView";
import ProgressView from "./components/ProgressView";
import AllProblemsView from "./components/AllProblemsView";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const { user, signInWithGoogle, signInWithGitHub, signInWithApple, signOut } = useAuth();
  const ui = useUI();

  const {
    problems,
    preferences,
    syncStatus,
    handleSaveProblem,
    handleDeleteConfirm,
    handleReview,
    handleUpdateNotes,
    handleDismiss,
    handleImport,
    handleUpdatePreferences,
    handleBulkAdd,
    handleToggleExclude,
    handleSetAllDue,
    handleClearAllData,
  } = useProblems({ user, showToast: ui.showToast });

  const existingProblemNumbers = useMemo(
    () => new Set(problems.map((p) => p.leetcodeNumber).filter((n): n is number => Boolean(n))),
    [problems],
  );

  // Re-read from localStorage when problems change (a review likely happened)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviewLog = useMemo(() => loadReviewLog(), [problems]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reviewEvents = useMemo(() => loadReviewEvents(), [problems]);

  return (
    <div className="min-h-screen bg-pb-bg pb-[70px]">
      <Toast
        message={ui.toast.message}
        isVisible={ui.toast.visible}
        onDone={ui.hideToast}
      />
      <ConfirmDialog
        isOpen={!!ui.deleteTarget}
        title={`Delete ${ui.deleteTarget?.title || "problem"}?`}
        message="This cannot be undone."
        onConfirm={() => {
          handleDeleteConfirm(ui.deleteTarget);
          ui.setDeleteTarget(null);
        }}
        onCancel={() => ui.setDeleteTarget(null)}
      />
      <ConfirmDialog
        isOpen={ui.clearDataConfirm}
        title="Clear all data?"
        message="This will permanently delete all problems, review history, and streak data. You will be signed out. If you use PatternBank on another device, clear your data there too."
        confirmLabel="Clear Everything"
        onConfirm={async () => {
          await handleClearAllData();
          if (user) signOut();
          ui.setClearDataConfirm(false);
        }}
        onCancel={() => ui.setClearDataConfirm(false)}
      />
      <SettingsModal
        isOpen={ui.settingsOpen}
        onClose={() => ui.setSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onExport={exportData}
        onImport={handleImport}
        onBulkAdd={handleBulkAdd}
        problemCount={problems.length}
        existingProblemNumbers={existingProblemNumbers}
        user={user}
        onSignInGoogle={signInWithGoogle}
        onSignInGitHub={signInWithGitHub}
        onSignInApple={signInWithApple}
        onSignOut={signOut}
        onSetAllDue={() => { handleSetAllDue(); ui.setSettingsOpen(false); }}
        onRequestClearData={ui.requestClearData}
      />
      <Header
        onSettingsClick={() => ui.setSettingsOpen(true)}
        syncStatus={syncStatus}
      />

      {ui.activeTab === "dashboard" && (
        <DashboardView
          problems={problems}
          dailyGoal={preferences.dailyReviewGoal}
          hidePatterns={preferences.hidePatternsDuringReview}
          enabledExtraPatterns={preferences.enabledExtraPatterns}
          onReview={handleReview}
          onDismiss={handleDismiss}
          onUpdateNotes={handleUpdateNotes}
          onViewAllDue={ui.handleViewAllDue}
          onPatternClick={ui.handlePatternClick}
          onAddClick={ui.openAddModal}
          onBulkAdd={handleBulkAdd}
          existingProblemNumbers={existingProblemNumbers}
        />
      )}
      {ui.activeTab === "progress" && (
        <ProgressView
          problems={problems}
          reviewLog={reviewLog}
          reviewEvents={reviewEvents}
          enabledExtraPatterns={preferences.enabledExtraPatterns}
        />
      )}
      {ui.activeTab === "problems" && (
        <AllProblemsView
          problems={problems}
          onEdit={ui.handleEdit}
          onDelete={ui.handleDeleteRequest}
          onToggleExclude={handleToggleExclude}
          initialSort={ui.problemsInitialSort}
          initialPatternFilter={ui.problemsInitialPatternFilter}
          enabledExtraPatterns={preferences.enabledExtraPatterns}
          onAddClick={ui.openAddModal}
        />
      )}

      <NavBar
        activeTab={ui.activeTab}
        onTabChange={ui.handleTabChange}
        onAddClick={ui.openAddModal}
      />
      <ProblemModal
        isOpen={ui.modalOpen}
        onClose={ui.closeModal}
        onSave={(problem, confidenceChanged) => {
          handleSaveProblem(problem, confidenceChanged);
          ui.closeModal();
        }}
        initialData={ui.editingProblem}
        existingProblemNumbers={existingProblemNumbers}
        enabledExtraPatterns={preferences.enabledExtraPatterns}
      />
    </div>
  );
}
