export type ReminderStage = "morning_push" | "immediate_email" | "evening_email";
export type DeliveryStatus = "pending" | "sent" | "failed_transient" | "failed_permanent" | "skipped";

export interface ReminderPolicyState {
  remindersEnabled: boolean;
  emailEnabled: boolean;
  dueCount: number;
  morningPushStatus?: DeliveryStatus | null;
  morningPushClicked: boolean;
  reviewsAfterMorningPush: number;
  morningPushDueCount: number;
  existingImmediateEmail: boolean;
  existingEveningEmail: boolean;
}

export function shouldSendMorningPush(state: ReminderPolicyState) {
  return state.remindersEnabled && state.dueCount > 0 && !state.morningPushStatus;
}

export function shouldSendImmediateEmail(state: ReminderPolicyState) {
  if (!state.remindersEnabled || !state.emailEnabled || state.dueCount <= 0) return false;
  if (state.existingImmediateEmail) return false;
  return state.morningPushStatus === "failed_transient" || state.morningPushStatus === "failed_permanent";
}

export function shouldSendEveningEmail(state: ReminderPolicyState) {
  if (!state.remindersEnabled || !state.emailEnabled || state.dueCount <= 0) return false;
  if (state.existingEveningEmail) return false;
  if (state.morningPushStatus !== "sent" || state.morningPushClicked) return false;
  return state.reviewsAfterMorningPush < state.morningPushDueCount;
}
