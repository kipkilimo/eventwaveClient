/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { useFeedbackSocket } from "@/composables/useFeedbackSocket";

import {
  GET_FEEDBACK_BY_ID,
  GET_FEEDBACK_ANALYTICS,
  SUBMIT_FEEDBACK,
  CREATE_FEEDBACK,
  UPDATE_FEEDBACK,
  CLOSE_FEEDBACK,
  REOPEN_FEEDBACK,
  ADD_FEEDBACK_PARTICIPANTS,
  REMOVE_FEEDBACK_PARTICIPANTS,
  GENERATE_FEEDBACK_ACCESS_KEYS,
  SEND_FEEDBACK_REMINDER,
  GET_EVENT_FEEDBACKS,
} from "@/graphql/feedback";

import type {
  Feedback,
  FeedbackResponse,
  FeedbackAnalytics,
  FeedbackSubmissionInput,
  FeedbackTargetType,
  FeedbackStatus,
  FeedbackQuestionInput,
} from "@/types/feedback.types";

// ===========================
// FEEDBACK STORE
// ===========================
export const useFeedbackStore = defineStore("feedback", {
  // ---------------------------
  // STATE
  // ---------------------------
  state: () => ({
    loading: false,
    submitting: false,
    error: null as string | null,

    feedbacks: [] as Feedback[],
    currentFeedback: null as Feedback | null,
    latestResponse: null as FeedbackResponse | null,
    analytics: null as FeedbackAnalytics | null,

    socketConnected: false,
  }),

  // ---------------------------
  // GETTERS
  // ---------------------------
  getters: {
    isActive: (state) =>
      state.currentFeedback?.status === FeedbackStatus.ACTIVE,

    totalQuestions: (state) =>
      state.currentFeedback?.questions?.length ?? 0,
  },

  // ---------------------------
  // ACTIONS
  // ---------------------------
  actions: {
    // ---------------------------
    // ERROR / LOADING HELPERS
    // ---------------------------
    handleError(err: unknown, fallback = "Operation failed") {
      const message = err instanceof Error ? err.message : fallback;
      this.error = message;
      throw err;
    },

    async withLoading(fn: () => Promise<any>) {
      this.loading = true;
      try {
        return await fn();
      } catch (err) {
        this.handleError(err);
      } finally {
        this.loading = false;
      }
    },

    async withSubmitting(fn: () => Promise<any>) {
      this.submitting = true;
      try {
        return await fn();
      } catch (err) {
        this.handleError(err);
      } finally {
        this.submitting = false;
      }
    },

    // ---------------------------
    // SOCKET INIT
    // ---------------------------
    initSocket(feedbackId: string) {
      const {
        latestResponse,
        analytics,
        connected,
      } = useFeedbackSocket(feedbackId);

      this.socketConnected = connected.value;

      if (latestResponse.value) {
        this.latestResponse = latestResponse.value;
      }

      if (analytics.value) {
        this.analytics = analytics.value;
      }
    },

    // ---------------------------
    // FETCH FEEDBACK
    // ---------------------------
    async fetchFeedback(id: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.query({
          query: GET_FEEDBACK_BY_ID,
          variables: { id },
          fetchPolicy: "network-only",
        });

        this.currentFeedback = data.getFeedbackById;
        return this.currentFeedback;
      });
    },

    async fetchFeedbackAnalytics(feedbackId: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.query({
          query: GET_FEEDBACK_ANALYTICS,
          variables: { feedbackId },
          fetchPolicy: "network-only",
        });

        this.analytics = data.getFeedbackAnalytics;
        return this.analytics;
      });
    },

    async fetchAllFeedbacks(eventId?: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.query({
          query: GET_EVENT_FEEDBACKS,
          variables: eventId ? { eventId } : {},
          fetchPolicy: "network-only",
        });

        this.feedbacks = data.getAllEventFeedbacks;
        return this.feedbacks;
      });
    },

    // ---------------------------
    // SUBMIT RESPONSE
    // ---------------------------
    async submitFeedback(input: FeedbackSubmissionInput) {
      return this.withSubmitting(async () => {
        const { data } = await apolloClient.mutate({
          mutation: SUBMIT_FEEDBACK,
          variables: { input },
        });

        this.latestResponse = data.submitFeedback;

        if (this.currentFeedback?.responses) {
          this.currentFeedback.responses.push(this.latestResponse);
        }

        return this.latestResponse;
      });
    },

    // ---------------------------
    // CREATE / UPDATE FEEDBACK
    // ---------------------------
    async createNewFeedback(
      title: string,
      targetId: string,
      targetType: FeedbackTargetType,
      questions: FeedbackQuestionInput[],
      isAnonymous = true,
      allowMultipleSubmissions = false,
      closesAt?: string,
      metadata?: string,
      responseWindowDuration = "OPEN"
    ) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_FEEDBACK,
          variables: {
            title,
            targetId,
            targetType,
            questions,
            isAnonymous,
            allowMultipleSubmissions,
            closesAt,
            metadata,
            responseWindowDuration,
          },
        });

        this.feedbacks.unshift(data.createFeedback);
        return data.createFeedback;
      });
    },

    async updateExistingFeedback(feedbackId: string, input: any) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: UPDATE_FEEDBACK,
          variables: { id: feedbackId, input },
        });

        this.currentFeedback = data.updateFeedback;
        return this.currentFeedback;
      });
    },

    // ---------------------------
    // STATUS ACTIONS
    // ---------------------------
    async closeCurrentFeedback(feedbackId: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: CLOSE_FEEDBACK,
          variables: { id: feedbackId },
        });

        this.currentFeedback = data.closeFeedback;
        return this.currentFeedback;
      });
    },

    async reopenCurrentFeedback(feedbackId: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: REOPEN_FEEDBACK,
          variables: { id: feedbackId },
        });

        this.currentFeedback = data.reopenFeedback;
        return this.currentFeedback;
      });
    },

    // ---------------------------
    // PARTICIPANTS
    // ---------------------------
    async addParticipants(feedbackId: string, participantIds: string[]) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: ADD_FEEDBACK_PARTICIPANTS,
          variables: { feedbackId, participantIds },
        });

        this.currentFeedback = data.addFeedbackParticipants;
        return this.currentFeedback;
      });
    },

    async removeParticipants(feedbackId: string, participantIds: string[]) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: REMOVE_FEEDBACK_PARTICIPANTS,
          variables: { feedbackId, participantIds },
        });

        this.currentFeedback = data.removeFeedbackParticipants;
        return this.currentFeedback;
      });
    },

    // ---------------------------
    // ACCESS KEYS & REMINDERS
    // ---------------------------
    async generateAccessKeys(feedbackId: string, count = 1) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: GENERATE_FEEDBACK_ACCESS_KEYS,
          variables: { feedbackId, count },
        });

        return data.generateFeedbackAccessKeys;
      });
    },

    async sendReminder(feedbackId: string) {
      return this.withLoading(async () => {
        const { data } = await apolloClient.mutate({
          mutation: SEND_FEEDBACK_REMINDER,
          variables: { feedbackId },
        });

        return data.sendFeedbackReminder;
      });
    },

    // ---------------------------
    // RESET
    // ---------------------------
    reset() {
      this.loading = false;
      this.submitting = false;
      this.error = null;

      this.feedbacks = [];
      this.currentFeedback = null;
      this.latestResponse = null;
      this.analytics = null;
      this.socketConnected = false;
    },
  },
});
