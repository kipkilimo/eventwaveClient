/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { gql } from "@apollo/client/core";
import { router } from "@/router";
import { ref } from "vue";
// ---------------------------
// TYPES
// ---------------------------
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "SUPER" | "FACILITATOR" | "ADMIN" | "PARTICIPANT";
  organizations?: Organization[];
  events?: Event[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  website?: string;
  subscriptionTier?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  eventSecret: string;
  status: "DRAFT" | "PUBLISHED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  dateTime: {
    start: string;
    end: string;
  };
  branding: {
    logoUrl?: string;
    themeColor?: string;
    bannerBg?: string;
  };
  location: {
    name: string;
    address: string;
    virtualLink?: string;
    isVirtual: boolean;
  };
  organization?: Organization;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  role?: "SUPER" | "FACILITATOR" | "ADMIN" | "PARTICIPANT";
  organizationId?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  role?: "SUPER" | "FACILITATOR" | "ADMIN" | "PARTICIPANT";
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ParticipantLoginCredentials {
  eventSecret: string;
  phone: string;
}

export interface VerifyEventKeyResponse {
  success: boolean;
  message: string;
  event?: Event;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface ParticipantLoginPayload {
  token: string;
  user: User;
  event: Event;
}

// ---------------------------
// GRAPHQL QUERIES & MUTATIONS
// ---------------------------

// Queries
const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      phone
      role
      organizations {
        id
        name
        address
        email
        phone
        website
        subscriptionTier
        createdAt
        updatedAt
      }
      events {
        id
        title
        eventSecret
        status
        dateTime {
          start
          end
        }
        branding {
          logoUrl
          themeColor
          bannerBg
        }
        location {
          name
          address
          virtualLink
          isVirtual
        }
      }
      createdAt
      updatedAt
    }
  }
`;

const USERS_QUERY = gql`
  query Users {
    users {
      id
      name
      email
      phone
      role
      organizations {
        id
        name
      }
      events {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`;

const USER_QUERY = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phone
      role
      organizations {
        id
        name
      }
      events {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`;

// Mutations
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        phone
        role
        organizations {
          id
          name
        }
      }
    }
  }
`;
// Add this with your other GraphQL queries (around line 78)
const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      phone
      role
      organizations {
        id
        name
        address
        email
        phone
        website
        subscriptionTier
        createdAt
        updatedAt
      }
      events {
        id
        title
        eventSecret
        status
        dateTime {
          start
          end
        }
        branding {
          logoUrl
          themeColor
          bannerBg
        }
        location {
          name
          address
          virtualLink
          isVirtual
        }
      }
      createdAt
      updatedAt
    }
  }
`;
const REGISTER_MUTATION = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      token
      user {
        id
        name
        email
        phone
        role
        organizations {
          id
          name
        }
      }
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      phone
      role
      organizations {
        id
        name
      }
      events {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`;

const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

const PARTICIPANT_LOGIN_MUTATION = gql`
  mutation ParticipantLogin($eventSecret: String!, $phone: String!) {
    participantLogin(eventSecret: $eventSecret, phone: $phone) {
      token
      user {
        id
        name
        email
        phone
        role
        organizations {
          id
          name
        }
      }
      event {
        id
        title
        eventSecret
        status
        dateTime {
          start
          end
        }
        branding {
          logoUrl
          themeColor
          bannerBg
        }
        location {
          name
          address
          virtualLink
          isVirtual
        }
      }
    }
  }
`;

const VERIFY_EVENT_KEY_MUTATION = gql`
  mutation VerifyEventKey($eventKey: String!) {
    verifyEventKey(eventKey: $eventKey) {
      success
      message
      event {
        id
        title
        eventSecret
      }
    }
  }
`;

// ---------------------------
// NOTIFICATION HELPER
// ---------------------------
export interface Notification {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

const notificationListeners = ref<((notification: any) => void)[]>([]);

export const addNotificationListener = (
  listener: (notification: any) => void,
) => {
  notificationListeners.value.push(listener);
};

export const removeNotificationListener = (
  listener: (notification: any) => void,
) => {
  notificationListeners.value = notificationListeners.value.filter(
    (l) => l !== listener,
  );
};

const notificationHandlers: ((notification: Notification) => void)[] = [];

export const onNotification = (
  handler: (notification: Notification) => void,
) => {
  notificationHandlers.push(handler);
  return () => {
    const index = notificationHandlers.indexOf(handler);
    if (index > -1) notificationHandlers.splice(index, 1);
  };
};

// ---------------------------
// USER STORE
// ---------------------------
export const showNotification = (notification: any) => {
  notificationListeners.value.forEach((listener) => {
    listener(notification);
  });
};
export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    users: [] as User[],
    event: null as Event | null,
    events: [] as Event[],
    error: null as string | null,
    loading: false,
    returnUrl: null as string | null,
    initialized: false,
    isRefreshingDashboard: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isSuperAdmin: (state) => state.user?.role === "SUPER",
    isFacilitator: (state) => state.user?.role === "FACILITATOR",
    isAdmin: (state) => state.user?.role === "ADMIN",
    isParticipant: (state) => state.user?.role === "PARTICIPANT",
    userOrganizations: (state) => state.user?.organizations || [],
    userEvents: (state) => state.user?.events || [],
  },

  actions: {
    // ---------------------------
    // INITIALIZATION
    // ---------------------------
    async initialize() {
      if (this.initialized) return;

      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      const savedEvent = localStorage.getItem("event");

      if (savedToken) this.token = savedToken;
      if (savedUser) this.user = JSON.parse(savedUser);
      if (savedEvent) this.event = JSON.parse(savedEvent);

      this.initialized = true;
    },

    // ---------------------------
    // AUTH HELPERS
    // ---------------------------
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    },

    setUser(user: User | null) {
      this.user = user;
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
    },

    setEvent(event: Event | null) {
      this.event = event;
      if (event) {
        localStorage.setItem("event", JSON.stringify(event));
      } else {
        localStorage.removeItem("event");
      }
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      this.event = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("event");
      console.log("🧹 Auth data cleared");
    },

    // ---------------------------
    // USER MANAGEMENT
    // ---------------------------
    async fetchMe(): Promise<User> {
      if (!this.token) {
        console.log("🔍 No token available");
        this.user = null;
        throw new Error("No authentication token");
      }

      this.loading = true;
      this.error = null;

      try {
        const { data, errors } = await apolloClient.query({
          query: ME_QUERY,
          fetchPolicy: "network-only",
        });

        if (errors) {
          console.error("❌ GraphQL errors:", errors);
          throw new Error(errors[0]?.message || "GraphQL error");
        }

        if (!data?.me) {
          throw new Error("Invalid session - user not found");
        }

        this.user = data.me;
        localStorage.setItem("user", JSON.stringify(this.user));
        console.log("✅ User fetched successfully:", this.user);
        return this.user;
      } catch (err: any) {
        console.error("❌ fetchMe failed:", err.message);
        this.error = err.message || "Failed to fetch user";

        // Clear invalid token
        if (
          err.message.includes("Unauthorized") ||
          err.message.includes("Invalid")
        ) {
          this.clearAuth();
        }

        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers(): Promise<User[]> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: USERS_QUERY,
          fetchPolicy: "network-only",
        });

        this.users = data.users;
        return this.users;
      } catch (err: any) {
        this.error = err.message || "Failed to fetch users";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchUser(id: string): Promise<User> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.query({
          query: USER_QUERY,
          variables: { id },
          fetchPolicy: "network-only",
        });

        return data.user;
      } catch (err: any) {
        this.error = err.message || "Failed to fetch user";
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async updateUser(id: string, input: UpdateUserInput): Promise<User> {
      this.loading = true;
      this.error = null;

      try {
        // Validate inputs
        if (!id) {
          throw new Error("User ID is required");
        }

        if (!input) {
          throw new Error("Update input is required");
        }

        // Ensure id is a string, not an object
        const userId = typeof id === "string" ? id : id.id;

        // Make sure input is a clean object without any __typename or other GraphQL artifacts
        const cleanInput = {
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: input.role,
          // Add other fields as needed, but exclude __typename
        };

        console.log("Updating user with:", { id: userId, input: cleanInput });

        const { data } = await apolloClient.mutate({
          mutation: UPDATE_USER_MUTATION,
          variables: {
            id: userId,
            input: cleanInput,
          },
        });

        if (!data?.updateUser) {
          throw new Error("No user data returned from mutation");
        }

        const updatedUser = data.updateUser;

        // Update current user if it's the same user
        if (this.user && this.user.id === userId) {
          this.user = updatedUser;
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        showNotification({
          type: "success",
          title: "User Updated",
          message: `User ${updatedUser.name} has been updated successfully.`,
          duration: 3000,
        });

        return updatedUser;
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Failed to update user";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Update Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    async deleteUser(id: string): Promise<boolean> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: DELETE_USER_MUTATION,
          variables: { id },
        });

        const success = data.deleteUser;

        if (success) {
          // Remove from users list if present
          this.users = this.users.filter((user) => user.id !== id);

          // If deleting current user, logout
          if (this.user && this.user.id === id) {
            this.logout();
          }

          showNotification({
            type: "success",
            title: "User Deleted",
            message: "User has been deleted successfully.",
            duration: 3000,
          });
        }

        return success;
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Failed to delete user";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Delete Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------------
    // AUTHENTICATION
    // ---------------------------
    async login(credentials: LoginCredentials): Promise<AuthPayload> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: LOGIN_MUTATION,
          variables: credentials,
        });

        const { token, user } = data.login;

        this.setToken(token);
        this.setUser(user);

        showNotification({
          type: "success",
          title: "Login Successful",
          message: `Welcome back ${user.name}!`,
          duration: 3000,
        });

        // Fetch complete user data with organizations and events
        await this.fetchMe();

        // Redirect after login
        setTimeout(() => {
          router.replace(this.returnUrl || "/dashboard");
        }, 1500);

        return { token, user };
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message || err?.message || "Login failed";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Login Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    async register(input: RegisterInput): Promise<AuthPayload> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: REGISTER_MUTATION,
          variables: { input },
        });

        const { token, user } = data.register;

        this.setToken(token);
        this.setUser(user);

        showNotification({
          type: "success",
          title: "Registration Successful! 🎉",
          message: `Welcome to the community, ${user.name}!`,
          duration: 3000,
        });

        // Fetch complete user data
        await this.fetchMe();

        // Redirect after registration
        setTimeout(() => {
          router.replace("/dashboard");
        }, 2500);

        return { token, user };
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Registration failed";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Registration Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    async participantLogin(
      credentials: ParticipantLoginCredentials,
    ): Promise<ParticipantLoginPayload> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: PARTICIPANT_LOGIN_MUTATION,
          variables: credentials,
        });

        const { token, user, event } = data.participantLogin;

        this.setToken(token);
        this.setUser(user);
        this.setEvent(event);

        showNotification({
          type: "success",
          title: "Login Successful",
          message: `Welcome ${user.name}!`,
          duration: 3000,
        });

        return { token, user, event };
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Participant login failed";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Login Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    async verifyEventKey(eventKey: string): Promise<VerifyEventKeyResponse> {
      this.loading = true;
      this.error = null;

      try {
        const { data } = await apolloClient.mutate({
          mutation: VERIFY_EVENT_KEY_MUTATION,
          variables: { eventKey },
        });

        const response = data.verifyEventKey;

        if (response.success && response.event) {
          showNotification({
            type: "success",
            title: "Event Verified",
            message: response.message,
            duration: 3000,
          });
        } else {
          showNotification({
            type: "warning",
            title: "Verification Failed",
            message: response.message,
            duration: 5000,
          });
        }

        return response;
      } catch (err: any) {
        const errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          err?.message ||
          "Event verification failed";
        this.error = errorMessage;

        showNotification({
          type: "error",
          title: "Verification Failed",
          message: errorMessage,
          duration: 5000,
        });

        throw err;
      } finally {
        this.loading = false;
      }
    },

    // ---------------------------
    // LOGOUT
    // ---------------------------
    logout() {
      showNotification({
        type: "info",
        title: "Logged Out",
        message: "You have been successfully logged out.",
        duration: 3000,
      });

      this.clearAuth();
      this.users = [];
      this.events = [];
      this.error = null;
      this.returnUrl = null;

      setTimeout(() => {
        router.replace("/login");
      }, 1000);
    },

    // ---------------------------
    // UTILITY ACTIONS
    // ---------------------------
    // In user store
    async refreshUser(userId: string): Promise<User> {
      // Use a query, not a mutation
      const { data } = await apolloClient.query({
        query: GET_USER_QUERY, // You'll need to define this query
        variables: { id: userId },
      });

      return data.user;
    },

    async refreshDashboard(): Promise<void> {
      if (this.isRefreshingDashboard) return;

      this.isRefreshingDashboard = true;

      try {
        if (this.isAuthenticated) {
          await this.fetchMe();

          // Additional dashboard data fetching can be added here
          // For example, fetching events, organizations, etc.
        }
      } catch (error) {
        console.error("Dashboard refresh failed:", error);
      } finally {
        this.isRefreshingDashboard = false;
      }
    },
  },
});

// Export notification helper for use in components
export const useNotification = () => {
  return {
    showNotification,
  };
};
