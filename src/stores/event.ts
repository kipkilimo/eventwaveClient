/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { gql } from "@apollo/client/core";

// --------------------
// QUERIES
// --------------------
const GET_EVENTS = gql`
  query GetEvents($filters: EventFilters, $limit: Int, $offset: Int) {
    events(filters: $filters, limit: $limit, offset: $offset) {
      id
      title
      description
      eventSecret
      eventType
      status
      isSecureAccessEvent
      dateTime {
        start
        end
      }
      location {
        name
        address
        virtualLink
        isVirtual
      }
      organizer {
        id
        name
        email
      }
      organization {
        id
        name
      }
      participants {
        id
        name
        email
        phoneNumber
      }
      facilitators {
        id
        name
        email
      }
      admins {
        id
        name
        email
      }
      capacity
      isFreeEvent
      isShortEvent
      eventDuration {
        milliseconds
        hours
        minutes
        days
      }
      interactivity {
        allowChat
        allowPrivateMessages
        allowPolls
        allowQnA
        allowFeedback
        allowScreenSharing
        allowBreakoutRooms
        allowWhiteboard
        liveReactions
        raiseHandFeature
      }
      branding {
        logoUrl
        themeColor
        bannerBg
      }
      tags
      categories
      metadata {
        timezone
        language
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_EVENTS_PAGINATED = gql`
  query GetEventsPaginated(
    $filters: EventFilters
    $first: Int
    $after: String
  ) {
    eventsPaginated(filters: $filters, first: $first, after: $after) {
      edges {
        node {
          id
          title
          description
          eventSecret
          eventType
          status
          dateTime {
            start
            end
          }
          location {
            name
            address
            virtualLink
            isVirtual
          }
          organizer {
            id
            name
            email
          }
          organization {
            id
            name
          }
          participants {
            id
            name
            email
          }
          capacity
          isFreeEvent
          tags
          categories
          createdAt
          updatedAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

const GET_EVENT = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      eventSecret
      eventType
      status
      isSecureAccessEvent
      dateTime {
        start
        end
      }
      location {
        name
        address
        virtualLink
        isVirtual
      }
      organizer {
        id
        name
        email
      }
      organization {
        id
        name
      }
      participants {
        id
        name
        email
        phoneNumber
        status
        joinedAt
      }
      facilitators {
        id
        name
        email
      }
      admins {
        id
        name
        email
      }
      capacity
      interactivity {
        allowChat
        allowPrivateMessages
        allowPolls
        allowQnA
        allowFeedback
        allowScreenSharing
        allowBreakoutRooms
        allowWhiteboard
        liveReactions
        raiseHandFeature
      }
      branding {
        logoUrl
        themeColor
        bannerBg
      }
      isFreeEvent
      isShortEvent
      eventDuration {
        milliseconds
        hours
        minutes
        days
      }
      billing {
        invoiceNumber
        dailyRate
        days
        originalAmount
        discountAmount
        finalAmount
        currency
        status
        paidAt
        paymentMethod
      }
      tags
      categories
      metadata {
        timezone
        language
        createdAt
        updatedAt
        createdBy
        isEnterprise
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_EVENT_BY_KEY = gql`
  query GetEventBySecret($eventSecret: String!) {
    eventBySecret(eventSecret: $eventSecret) {
      id
      title
      description
      eventSecret
      isSecureAccessEvent
      eventType
      status
      dateTime {
        start
        end
      }
      location {
        name
        address
        virtualLink
        isVirtual
      }
      organizer {
        id
        name
        email
      }
      organization {
        id
        name
      }
      participants {
        id
        name
        email
      }
      facilitators {
        id
        name
        email
      }
      admins {
        id
        name
        email
      }
      capacity
      interactivity {
        allowChat
        allowPrivateMessages
        allowPolls
        allowQnA
        allowFeedback
        allowScreenSharing
        allowBreakoutRooms
        allowWhiteboard
        liveReactions
        raiseHandFeature
      }
      branding {
        logoUrl
        themeColor
        bannerBg
      }
      isFreeEvent
      isShortEvent
      eventDuration {
        milliseconds
        hours
        minutes
        days
      }
      billing {
        invoiceNumber
        dailyRate
        days
        originalAmount
        discountAmount
        finalAmount
        currency
        status
        paidAt
        paymentMethod
      }
      tags
      categories
      metadata {
        timezone
        language
        createdAt
        updatedAt
        createdBy
        isEnterprise
      }
      createdAt
      updatedAt
    }
  }
`;

const GET_USER_EVENTS = gql`
  query GetUserEvents($userId: ID!, $status: EventStatus) {
    userEvents(userId: $userId, status: $status) {
      id
      title
      description
      eventSecret
      eventType
      status
      dateTime {
        start
        end
      }
      location {
        name
        address
        virtualLink
        isVirtual
      }
      organizer {
        id
        name
      }
      capacity
      isFreeEvent
      tags
      createdAt
    }
  }
`;

const GET_USER_FACILITATING_EVENTS = gql`
  query GetUserFacilitatingEvents($userId: ID!) {
    userFacilitatingEvents(userId: $userId) {
      id
      title
      eventSecret
      status
      eventType
      dateTime {
        start
        end
      }
      location {
        name
        isVirtual
      }
      organizer {
        id
        name
      }
      capacity
      isFreeEvent
      tags
      createdAt
    }
  }
`;

const GET_ORGANIZATION_EVENTS = gql`
  query GetOrganizationEvents($organizationId: ID!) {
    organizationEvents(organizationId: $organizationId) {
      id
      title
      eventSecret
      status
      eventType
      dateTime {
        start
        end
      }
      location {
        name
        isVirtual
      }
      organizer {
        id
        name
      }
      capacity
      participants {
        id
        name
      }
      isFreeEvent
      tags
      createdAt
    }
  }
`;

// --------------------
// MUTATIONS
// --------------------
const CREATE_FREE_EVENT = gql`
  mutation CreateFreeEvent($input: CreateFreeEventInput!) {
    createFreeEvent(input: $input) {
      id
      eventSecret
      title
      status
      dateTime {
        start
        end
      }
    }
  }
`;

const CREATE_STANDARD_EVENT = gql`
  mutation CreateStandardEvent($input: CreateStandardEventInput!) {
    createStandardEvent(input: $input) {
      id
      eventSecret
      title
      status
      dateTime {
        start
        end
      }
      billing {
        finalAmount
        currency
        status
      }
    }
  }
`;

const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      id
      eventSecret
      title
      status
      description
      eventType
      isSecureAccessEvent
      dateTime {
        start
        end
      }
      location {
        name
        address
        virtualLink
        isVirtual
      }
      interactivity {
        allowChat
        allowPrivateMessages
        allowPolls
        allowQnA
        allowFeedback
        allowScreenSharing
        allowBreakoutRooms
        allowWhiteboard
        liveReactions
        raiseHandFeature
      }
      branding {
        logoUrl
        themeColor
        bannerBg
      }
      capacity
      tags
      categories
      updatedAt
    }
  }
`;

const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;

const JOIN_EVENT = gql`
  mutation JoinEvent($eventId: ID!) {
    joinEvent(eventId: $eventId) {
      id
      eventSecret
      participants {
        id
        name
        email
        phoneNumber
        status
        joinedAt
      }
      capacity
    }
  }
`;

const LEAVE_EVENT = gql`
  mutation LeaveEvent($eventId: ID!) {
    leaveEvent(eventId: $eventId) {
      id
      eventSecret
      participants {
        id
        name
        email
      }
      capacity
    }
  }
`;

const REGISTER_FOR_EVENT = gql`
  mutation RegisterForEvent($eventId: ID!) {
    registerForEvent(eventId: $eventId) {
      id
      eventSecret
      participants {
        id
        name
        email
      }
    }
  }
`;

const UNREGISTER_FROM_EVENT = gql`
  mutation UnregisterFromEvent($eventId: ID!) {
    unregisterFromEvent(eventId: $eventId) {
      id
      eventSecret
      participants {
        id
        name
        email
      }
    }
  }
`;

const PUBLISH_EVENT = gql`
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

const CANCEL_EVENT = gql`
  mutation CancelEvent($id: ID!) {
    cancelEvent(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

const COMPLETE_EVENT = gql`
  mutation CompleteEvent($id: ID!) {
    completeEvent(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

const UPDATE_EVENT_ROLES = gql`
  mutation UpdateEventRoles($input: UpdateEventRolesInput!) {
    updateEventRoles(input: $input) {
      id
      participants {
        id
        name
        email
        phoneNumber
        status
        joinedAt
      }
      facilitators {
        id
        name
        email
      }
      admins {
        id
        name
        email
      }
    }
  }
`;

// Session Management Mutations
const START_SESSION = gql`
  mutation StartSession($eventId: ID!) {
    startSession(eventId: $eventId) {
      id
      status
      sessionStartedAt
    }
  }
`;

const PAUSE_SESSION = gql`
  mutation PauseSession($eventId: ID!) {
    pauseSession(eventId: $eventId) {
      id
      status
      sessionPausedAt
    }
  }
`;

const END_SESSION = gql`
  mutation EndSession($eventId: ID!) {
    endSession(eventId: $eventId) {
      id
      status
      sessionEndedAt
    }
  }
`;

// Q&A Mutations
const ASK_QUESTION = gql`
  mutation AskQuestion($eventId: ID!, $question: String!, $userId: ID!) {
    askQuestion(eventId: $eventId, question: $question, userId: $userId) {
      id
      question
      userName
      timestamp
      answer
      answeredAt
      answeredBy
    }
  }
`;

const ANSWER_QUESTION = gql`
  mutation AnswerQuestion(
    $questionId: ID!
    $answer: String!
    $facilitatorId: ID!
  ) {
    answerQuestion(
      questionId: $questionId
      answer: $answer
      facilitatorId: $facilitatorId
    ) {
      id
      answer
      answeredAt
      answeredBy
    }
  }
`;

// Poll Mutations
const CREATE_POLL = gql`
  mutation CreatePoll($eventId: ID!, $question: String!, $options: [String!]!) {
    createPoll(eventId: $eventId, question: $question, options: $options) {
      id
      question
      options
      status
      createdAt
    }
  }
`;

const SUBMIT_POLL_RESPONSE = gql`
  mutation SubmitPollResponse($pollId: ID!, $response: String!, $userId: ID!) {
    submitPollResponse(pollId: $pollId, response: $response, userId: $userId) {
      id
      responses
    }
  }
`;

const CLOSE_POLL = gql`
  mutation ClosePoll($pollId: ID!) {
    closePoll(pollId: $pollId) {
      id
      status
      results {
        option
        count
        percentage
      }
    }
  }
`;

// Announcement Mutations
const SEND_ANNOUNCEMENT = gql`
  mutation SendAnnouncement($eventId: ID!, $message: String!, $senderId: ID!) {
    sendAnnouncement(
      eventId: $eventId
      message: $message
      senderId: $senderId
    ) {
      id
      message
      timestamp
      sender {
        id
        name
      }
    }
  }
`;

// Chat Mutations
const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage($eventId: ID!, $content: String!, $userId: ID!) {
    sendChatMessage(eventId: $eventId, content: $content, userId: $userId) {
      id
      content
      userName
      timestamp
    }
  }
`;

// Export Mutations
const EXPORT_EVENT_DATA = gql`
  mutation ExportEventData($eventId: ID!) {
    exportEventData(eventId: $eventId) {
      url
      format
      expiresAt
    }
  }
`;

// --------------------
// TYPES (matching SDL and MongoDB schema)
// --------------------
export interface DateTimeRange {
  start: string;
  end: string;
}

export interface Location {
  name: string;
  address: string;
  virtualLink?: string;
  isVirtual: boolean;
}

export interface InteractivitySettings {
  allowChat: boolean;
  allowPrivateMessages: boolean;
  allowPolls: boolean;
  allowQnA: boolean;
  allowFeedback: boolean;
  allowScreenSharing: boolean;
  allowBreakoutRooms: boolean;
  allowWhiteboard: boolean;
  liveReactions: boolean;
  raiseHandFeature: boolean;
}

export interface BrandingSettings {
  logoUrl?: string;
  themeColor?: string;
  bannerBg?: string;
}

export interface EventDuration {
  milliseconds: number;
  hours: number;
  minutes: number;
  days: number;
}

export interface BillingInfo {
  invoiceNumber?: string;
  dailyRate?: number;
  days?: number;
  originalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  currency: string;
  status: string;
  paidAt?: string;
  paymentMethod?: string;
}

export interface EventMetadata {
  timezone: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isEnterprise?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  joinedAt?: string;
}

export interface Participant extends User {
  status?: "active" | "away" | "offline" | "muted";
  joinedAt?: string;
}

export interface Facilitator extends User {
  role?: string;
}

export interface Admin extends User {}

export interface Event {
  id: string;
  eventSecret: string;
  title: string;
  description?: string;
  eventType: string;
  status: string;
  isSecureAccessEvent?: boolean;
  dateTime: DateTimeRange;
  location: Location;
  organizer: User;
  organization?: {
    id: string;
    name: string;
  };
  participants: Participant[];
  facilitators?: Facilitator[];
  admins?: Admin[];
  capacity?: number;
  interactivity?: InteractivitySettings;
  branding?: BrandingSettings;
  isFreeEvent: boolean;
  isShortEvent?: boolean;
  eventDuration?: EventDuration;
  billing?: BillingInfo;
  tags?: string[];
  categories?: string[];
  metadata?: EventMetadata;
  createdAt: string;
  updatedAt: string;
  sessionStartedAt?: string;
  sessionPausedAt?: string;
  sessionEndedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  userName: string;
  timestamp: string;
  answer?: string;
  answeredAt?: string;
  answeredBy?: string;
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  responses: number;
  status: "active" | "closed";
  createdAt: string;
  results?: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;
}

export interface ChatMessage {
  id: string;
  content: string;
  userName: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  message: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
  };
}

export interface EventFilters {
  status?: string;
  eventType?: string;
  organizationId?: string;
  organizerId?: string;
  isFreeEvent?: boolean;
  isShortEvent?: boolean;
  fromDate?: string;
  toDate?: string;
  search?: string;
  isEnterprise?: boolean;
}

export interface PaginatedResult<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
}

export interface ExportResult {
  url: string;
  format: string;
  expiresAt: string;
}

// --------------------
// STORE
// --------------------
export const useEventStore = defineStore("events", {
  state: () => ({
    events: [] as Event[],
    paginatedEvents: null as PaginatedResult<Event> | null,
    currentEvent: null as Event | null,
    loading: false,
    error: null as string | null,
    paginationLoading: false,

    // Real-time data (will be updated via WebSocket handlers)
    chatMessages: [] as ChatMessage[],
    pendingQuestions: [] as Question[],
    activePolls: [] as Poll[],
    announcements: [] as Announcement[],
  }),

  getters: {
    eventCount: (state) => state.events.length,
    isLoading: (state) => state.loading,
    upcomingEvents: (state) =>
      state.events.filter(
        (e) => e.status === "PUBLISHED" || e.status === "ACTIVE",
      ),
    freeEvents: (state) => state.events.filter((e) => e.isFreeEvent),
    standardEvents: (state) => state.events.filter((e) => !e.isFreeEvent),

    // Participant getters
    currentParticipants: (state) => state.currentEvent?.participants || [],
    activeParticipants: (state) =>
      state.currentEvent?.participants?.filter((p) => p.status === "active") ||
      [],

    // Facilitator getters
    isSessionActive: (state) => state.currentEvent?.status === "ACTIVE",
    canStartSession: (state) =>
      state.currentEvent?.status === "PUBLISHED" ||
      state.currentEvent?.status === "PENDING",

    // Admin getters
    eventRevenue: (state) => state.currentEvent?.billing?.finalAmount || 0,
    eventCapacity: (state) => state.currentEvent?.capacity || "Unlimited",
    availableSpots: (state) => {
      const capacity = state.currentEvent?.capacity;
      const participants = state.currentEvent?.participants?.length || 0;
      if (!capacity) return "Unlimited";
      return Math.max(0, capacity - participants);
    },
  },

  actions: {
    // --------------------
    // Query Actions
    // --------------------
    async fetchEvents(filters?: EventFilters, limit?: number, offset?: number) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_EVENTS,
          variables: { filters, limit, offset },
          fetchPolicy: "network-only",
        });
        this.events = data.events || [];
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch events:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchEventsPaginated(
      filters?: EventFilters,
      first: number = 10,
      after?: string,
    ) {
      this.paginationLoading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_EVENTS_PAGINATED,
          variables: { filters, first, after },
          fetchPolicy: "network-only",
        });
        this.paginatedEvents = data.eventsPaginated;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch paginated events:", e);
      } finally {
        this.paginationLoading = false;
      }
    },

    async fetchEvent(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_EVENT,
          variables: { id },
          fetchPolicy: "network-only",
        });
        this.currentEvent = data.event;

        // Reset real-time data when fetching new event
        this.chatMessages = [];
        this.pendingQuestions = [];
        this.activePolls = [];
        this.announcements = [];
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch event:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchEventBySecret(eventSecret: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_EVENT_BY_KEY,
          variables: { eventSecret },
        });
        this.currentEvent = data.eventBySecret;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch event by key:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserEvents(userId: string, status?: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_USER_EVENTS,
          variables: { userId, status },
        });
        this.events = data.userEvents || [];
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch user events:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserFacilitatingEvents(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_USER_FACILITATING_EVENTS,
          variables: { userId },
        });
        this.events = data.userFacilitatingEvents || [];
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch facilitating events:", e);
      } finally {
        this.loading = false;
      }
    },

    async fetchOrganizationEvents(organizationId: string) {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: GET_ORGANIZATION_EVENTS,
          variables: { organizationId },
        });
        this.events = data.organizationEvents || [];
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to fetch organization events:", e);
      } finally {
        this.loading = false;
      }
    },

    // --------------------
    // Mutation Actions
    // --------------------
    async createFreeEvent(input: any) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_FREE_EVENT,
          variables: { input },
        });

        const newEvent = data.createFreeEvent;
        this.events = [newEvent, ...this.events];

        return newEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to create free event:", e);
        throw e;
      }
    },

    async createStandardEvent(input: any) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_STANDARD_EVENT,
          variables: { input },
        });

        const newEvent = data.createStandardEvent;
        this.events = [newEvent, ...this.events];

        return newEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to create standard event:", e);
        throw e;
      }
    },

    async updateEvent(id: string, input: any) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: UPDATE_EVENT,
          variables: { id, input },
        });

        const updated = data.updateEvent;
        this._updateEventInStore(updated);

        return updated;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to update event:", e);
        throw e;
      }
    },

    async deleteEvent(id: string) {
      this.error = null;

      try {
        await apolloClient.mutate({
          mutation: DELETE_EVENT,
          variables: { id },
        });

        this.events = this.events.filter((e) => e.id !== id);

        if (this.paginatedEvents) {
          this.paginatedEvents.edges = this.paginatedEvents.edges.filter(
            (edge) => edge.node.id !== id,
          );
          this.paginatedEvents.totalCount--;
        }

        if (this.currentEvent?.id === id) {
          this.currentEvent = null;
        }
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to delete event:", e);
        throw e;
      }
    },

    async joinEvent(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: JOIN_EVENT,
          variables: { eventId },
        });

        this._updateEventInStore(data.joinEvent);
        return data.joinEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to join event:", e);
        throw e;
      }
    },

    async leaveEvent(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: LEAVE_EVENT,
          variables: { eventId },
        });

        this._updateEventInStore(data.leaveEvent);
        return data.leaveEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to leave event:", e);
        throw e;
      }
    },

    async registerForEvent(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: REGISTER_FOR_EVENT,
          variables: { eventId },
        });

        this._updateEventInStore(data.registerForEvent);
        return data.registerForEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to register for event:", e);
        throw e;
      }
    },

    async unregisterFromEvent(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: UNREGISTER_FROM_EVENT,
          variables: { eventId },
        });

        this._updateEventInStore(data.unregisterFromEvent);
        return data.unregisterFromEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to unregister from event:", e);
        throw e;
      }
    },

    async publishEvent(id: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: PUBLISH_EVENT,
          variables: { id },
        });

        this._updateEventInStore(data.publishEvent);
        return data.publishEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to publish event:", e);
        throw e;
      }
    },

    async cancelEvent(id: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: CANCEL_EVENT,
          variables: { id },
        });

        this._updateEventInStore(data.cancelEvent);
        return data.cancelEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to cancel event:", e);
        throw e;
      }
    },

    async completeEvent(id: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: COMPLETE_EVENT,
          variables: { id },
        });

        this._updateEventInStore(data.completeEvent);
        return data.completeEvent;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to complete event:", e);
        throw e;
      }
    },

    async updateEventRoles(
      eventId: string,
      role: string,
      add: string[],
      remove: string[],
    ) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: UPDATE_EVENT_ROLES,
          variables: { input: { eventId, role, add, remove } },
        });

        this._updateEventInStore(data.updateEventRoles);
        return data.updateEventRoles;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to update event roles:", e);
        throw e;
      }
    },

    // --------------------
    // Session Management Actions
    // --------------------
    async startSession(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: START_SESSION,
          variables: { eventId },
        });

        this._updateEventInStore(data.startSession);
        return data.startSession;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to start session:", e);
        throw e;
      }
    },

    async pauseSession(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: PAUSE_SESSION,
          variables: { eventId },
        });

        this._updateEventInStore(data.pauseSession);
        return data.pauseSession;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to pause session:", e);
        throw e;
      }
    },

    async endSession(eventId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: END_SESSION,
          variables: { eventId },
        });

        this._updateEventInStore(data.endSession);
        return data.endSession;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to end session:", e);
        throw e;
      }
    },

    // --------------------
    // Q&A Actions
    // --------------------
    async askQuestion(eventId: string, question: string, userId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: ASK_QUESTION,
          variables: { eventId, question, userId },
        });

        this.pendingQuestions.unshift(data.askQuestion);
        return data.askQuestion;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to ask question:", e);
        throw e;
      }
    },

    async answerQuestion(
      questionId: string,
      answer: string,
      facilitatorId: string,
    ) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: ANSWER_QUESTION,
          variables: { questionId, answer, facilitatorId },
        });

        // Update question in pending list
        const index = this.pendingQuestions.findIndex(
          (q) => q.id === questionId,
        );
        if (index !== -1) {
          this.pendingQuestions[index].answer = answer;
          this.pendingQuestions[index].answeredAt = new Date().toISOString();
          this.pendingQuestions[index].answeredBy = facilitatorId;
        }

        return data.answerQuestion;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to answer question:", e);
        throw e;
      }
    },

    // --------------------
    // Poll Actions
    // --------------------
    async createPoll(eventId: string, question: string, options: string[]) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: CREATE_POLL,
          variables: { eventId, question, options },
        });

        this.activePolls.push(data.createPoll);
        return data.createPoll;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to create poll:", e);
        throw e;
      }
    },

    async submitPollResponse(pollId: string, response: string, userId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: SUBMIT_POLL_RESPONSE,
          variables: { pollId, response, userId },
        });

        return data.submitPollResponse;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to submit poll response:", e);
        throw e;
      }
    },

    async closePoll(pollId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: CLOSE_POLL,
          variables: { pollId },
        });

        const index = this.activePolls.findIndex((p) => p.id === pollId);
        if (index !== -1) {
          this.activePolls[index].status = "closed";
          this.activePolls[index].results = data.closePoll.results;
        }

        return data.closePoll;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to close poll:", e);
        throw e;
      }
    },

    // --------------------
    // Announcement Actions
    // --------------------
    async sendAnnouncement(eventId: string, message: string, senderId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: SEND_ANNOUNCEMENT,
          variables: { eventId, message, senderId },
        });

        this.announcements.unshift(data.sendAnnouncement);
        return data.sendAnnouncement;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to send announcement:", e);
        throw e;
      }
    },

    // --------------------
    // Chat Actions
    // --------------------
    async sendChatMessage(eventId: string, content: string, userId: string) {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: SEND_CHAT_MESSAGE,
          variables: { eventId, content, userId },
        });

        this.chatMessages.push(data.sendChatMessage);
        return data.sendChatMessage;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to send chat message:", e);
        throw e;
      }
    },

    // --------------------
    // Export Actions
    // --------------------
    async exportEventData(eventId: string): Promise<ExportResult> {
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: EXPORT_EVENT_DATA,
          variables: { eventId },
        });

        return data.exportEventData;
      } catch (e: any) {
        this.error = e.message;
        console.error("Failed to export event data:", e);
        throw e;
      }
    },

    // --------------------
    // Helper Actions
    // --------------------
    addChatMessage(message: ChatMessage) {
      this.chatMessages.push(message);
    },

    addQuestion(question: Question) {
      this.pendingQuestions.unshift(question);
    },

    updatePoll(poll: Poll) {
      const index = this.activePolls.findIndex((p) => p.id === poll.id);
      if (index !== -1) {
        this.activePolls[index] = poll;
      } else {
        this.activePolls.push(poll);
      }
    },

    updateParticipant(participantData: any) {
      if (!this.currentEvent) return;

      if (participantData.action === "add") {
        this.currentEvent.participants.push(participantData.participant);
      } else if (participantData.action === "remove") {
        this.currentEvent.participants = this.currentEvent.participants.filter(
          (p) => p.id !== participantData.participant.id,
        );
      } else if (participantData.action === "update") {
        const index = this.currentEvent.participants.findIndex(
          (p) => p.id === participantData.participant.id,
        );
        if (index !== -1) {
          this.currentEvent.participants[index] = participantData.participant;
        }
      }
    },

    updateSessionStatus(status: string) {
      if (this.currentEvent) {
        this.currentEvent.status = status;
      }
    },

    _updateEventInStore(updatedEvent: Event) {
      // Update in events array
      this.events = this.events.map((e) =>
        e.id === updatedEvent.id ? updatedEvent : e,
      );

      // Update current event if it's the same
      if (this.currentEvent?.id === updatedEvent.id) {
        this.currentEvent = updatedEvent;
      }

      // Update in paginated events if present
      if (this.paginatedEvents) {
        this.paginatedEvents.edges = this.paginatedEvents.edges.map((edge) =>
          edge.node.id === updatedEvent.id
            ? { ...edge, node: updatedEvent }
            : edge,
        );
      }
    },

    clearError() {
      this.error = null;
    },

    resetStore() {
      this.events = [];
      this.paginatedEvents = null;
      this.currentEvent = null;
      this.loading = false;
      this.error = null;
      this.paginationLoading = false;
      this.chatMessages = [];
      this.pendingQuestions = [];
      this.activePolls = [];
      this.announcements = [];
    },
  },
});
