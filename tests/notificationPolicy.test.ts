import {
  shouldSendEveningEmail,
  shouldSendImmediateEmail,
  shouldSendMorningPush,
  type ReminderPolicyState,
} from "../src/utils/notificationPolicy";

const base: ReminderPolicyState = {
  remindersEnabled: true,
  emailEnabled: true,
  dueCount: 3,
  morningPushStatus: null,
  morningPushClicked: false,
  reviewsAfterMorningPush: 0,
  morningPushDueCount: 3,
  existingImmediateEmail: false,
  existingEveningEmail: false,
};

describe("notification reminder policy", () => {
  it("selects morning push only for enabled users with due reviews and no existing delivery", () => {
    expect(shouldSendMorningPush(base)).toBe(true);
    expect(shouldSendMorningPush({ ...base, remindersEnabled: false })).toBe(false);
    expect(shouldSendMorningPush({ ...base, dueCount: 0 })).toBe(false);
    expect(shouldSendMorningPush({ ...base, morningPushStatus: "sent" })).toBe(false);
  });

  it("sends immediate email only when push could not be sent", () => {
    expect(shouldSendImmediateEmail({ ...base, morningPushStatus: "failed_transient" })).toBe(true);
    expect(shouldSendImmediateEmail({ ...base, morningPushStatus: "failed_permanent" })).toBe(true);
    expect(shouldSendImmediateEmail({ ...base, morningPushStatus: "sent" })).toBe(false);
    expect(shouldSendImmediateEmail({ ...base, morningPushStatus: "failed_transient", existingImmediateEmail: true })).toBe(false);
  });

  it("sends evening email only for unclicked push with remaining reviews", () => {
    expect(shouldSendEveningEmail({ ...base, morningPushStatus: "sent" })).toBe(true);
    expect(shouldSendEveningEmail({ ...base, morningPushStatus: "sent", morningPushClicked: true })).toBe(false);
    expect(shouldSendEveningEmail({ ...base, morningPushStatus: "sent", reviewsAfterMorningPush: 3 })).toBe(false);
    expect(shouldSendEveningEmail({ ...base, morningPushStatus: "sent", existingEveningEmail: true })).toBe(false);
  });
});
