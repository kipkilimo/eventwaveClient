import { defineStore } from "pinia";

export interface DialogState {
  name: string | null;
  visible: boolean;
  payload?: unknown;
}

export const DIALOG_NAMES = {
  CREATE_FREE_EVENT: "eventFreeCreateDialog",
  CREATE_EVENT: "eventCreateDialog",
  CREATE_ORGANIZATION: "organizationCreateDialog",
  EDIT_EVENT: "eventEditDialog",
  EVENT_DETAILS: "eventDetailsDialog",
  CONFIRM_DELETE: "confirmDeleteDialog",
  VOUCHER: "voucherDialog",
  PAYMENT: "paymentDialog",
  PLANS: "plansDialog",

  // Add these missing dialog names for EventManagement
  EVENT_FORM: "eventForm",
  EVENT_VIEW: "eventView",
  EVENT_DELETE: "eventDelete",
} as const;

export type DialogName = (typeof DIALOG_NAMES)[keyof typeof DIALOG_NAMES];

export const useDialogStore = defineStore("dialog", {
  state: (): DialogState => ({
    name: null,
    visible: false,
    payload: null,
  }),

  getters: {
    isOpen: (state) => state.visible,
    currentDialog: (state) => state.name,
    dialogPayload: (state) => state.payload,

    isDialogOpen: (state) => (dialogName: DialogName) =>
      state.visible && state.name === dialogName,

    getTypedPayload:
      (state) =>
      <T = unknown>() =>
        state.payload as T | null,
  },

  actions: {
    open(name: DialogName | string, payload?: unknown) {
      this.name = name;
      this.payload = payload ?? null;
      this.visible = true;
    },

    close(dialogName?: DialogName | string) {
      if (dialogName && this.name !== dialogName) return;
      this.visible = false;
      this.name = null;
      this.payload = null;
    },

    closeCurrent() {
      this.visible = false;
      this.name = null;
      this.payload = null;
    },

    toggle(name?: DialogName | string, payload?: unknown) {
      if (this.visible && this.name === name) {
        this.close(name);
      } else {
        if (!name) return;
        this.open(name, payload);
      }
    },

    // =========================
    // EVENT
    // =========================

    openCreateFreeEvent(organizerId: string, defaultValues?: Partial<any>) {
      this.open(DIALOG_NAMES.CREATE_FREE_EVENT, {
        organizerId,
        defaultStatus: "DRAFT",
        source: "events-management",
        ...defaultValues,
      });
    },

    closeCreateFreeEvent() {
      this.close(DIALOG_NAMES.CREATE_FREE_EVENT);
    },

    openCreateEvent(organizerId: string, defaultValues?: Partial<any>) {
      this.open(DIALOG_NAMES.CREATE_EVENT, {
        organizerId,
        defaultStatus: "DRAFT",
        source: "events-management",
        ...defaultValues,
      });
    },

    closeCreateEvent() {
      this.close(DIALOG_NAMES.CREATE_EVENT);
    },

    // =========================
    // ORGANIZATION
    // =========================

    openCreateOrganization(createdBy: string, defaultValues?: Partial<any>) {
      this.open(DIALOG_NAMES.CREATE_ORGANIZATION, {
        createdBy,
        source: "events-management",
        ...defaultValues,
      });
    },

    closeCreateOrganization() {
      this.close(DIALOG_NAMES.CREATE_ORGANIZATION);
    },

    // =========================
    // OTHER
    // =========================

    openEditEvent(eventId: string, eventData: any) {
      this.open(DIALOG_NAMES.EDIT_EVENT, {
        eventId,
        eventData,
      });
    },

    closeEditEvent() {
      this.close(DIALOG_NAMES.EDIT_EVENT);
    },

    openConfirmDelete(itemType: string, itemId: string, itemName: string) {
      this.open(DIALOG_NAMES.CONFIRM_DELETE, {
        itemType,
        itemId,
        itemName,
      });
    },

    closeConfirmDelete() {
      this.close(DIALOG_NAMES.CONFIRM_DELETE);
    },

    closeEventDetails() {
      this.close(DIALOG_NAMES.EVENT_DETAILS);
    },

    closeVoucher() {
      this.close(DIALOG_NAMES.VOUCHER);
    },

    closePayment() {
      this.close(DIALOG_NAMES.PAYMENT);
    },
  },
});
