/* eslint-disable @typescript-eslint/no-explicit-any */
import { gql } from "@apollo/client/core";

// -------------------------------------------------------
// ENUMS & TYPES
// -------------------------------------------------------
export enum LiveFeedPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum LiveFeedType {
  TEXT = "TEXT",
  ANNOUNCEMENT = "ANNOUNCEMENT",
  UPDATE = "UPDATE",
}

 

export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  dateTime: {
    start: string;
    end: string;
  };
  status: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface LiveFeed {
  id: string;
  event: string;
  author: string;
  content: string;
  type: LiveFeedType;
  priority: LiveFeedPriority;
  reactions: Reaction[];
  isPinned: boolean;
  isBreaking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveFeedPopulated extends Omit<LiveFeed, "author" | "event"> {
  author: User;
  event: Event;
}

export interface LiveFeedInput {
  author: string;
  event: string;
  content: string;
  type?: LiveFeedType;
  priority?: LiveFeedPriority;
  isBreaking?: boolean;
}

export interface ReactionInput {
  postId: string;
  emoji: string;
}

export interface PaginatedLiveFeeds {
  items: LiveFeedPopulated[];
  total: number;
  page: number;
  limit: number;
}

// -------------------------------------------------------
// GRAPHQL QUERIES & MUTATIONS
// -------------------------------------------------------

export const LIVEFEEDS_BY_EVENT = gql`
  query LiveFeedPosts($event: ID!, $page: Int, $limit: Int) {
    liveFeedPosts(event: $event, page: $page, limit: $limit) {
      items {
        id
        author {
          id
          name
          email
          role
        }
        content
        type
        priority
        reactions {
          emoji
          count
          users
        }
        isPinned
        isBreaking
        createdAt
        updatedAt
      }
      total
      page
      limit
    }
  }
`;

export const LIVEFEED_QUERY = gql`
  query LiveFeedPost($id: ID!) {
    liveFeedPost(id: $id) {
      id
      event {
        id
        title
        description
        dateTime {
          start
          end
        }
        status
      }
      author {
        id
        name
        email
        role
      }
      content
      type
      priority
      reactions {
        emoji
        count
        users
      }
      isPinned
      isBreaking
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_LIVEFEED = gql`
  mutation CreateLiveFeed($input: LiveFeedInput!) {
    createLiveFeed(input: $input) {
      id
      event {
        id
        title
      }
      author {
        id
        name
      }
      content
      type
      priority
      reactions {
        emoji
        count
        users
      }
      isPinned
      isBreaking
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_LIVEFEED = gql`
  mutation UpdateLiveFeed($id: ID!, $input: LiveFeedInput!) {
    updateLiveFeed(id: $id, input: $input) {
      id
      event {
        id
        title
      }
      author {
        id
        name
      }
      content
      type
      priority
      reactions {
        emoji
        count
        users
      }
      isPinned
      isBreaking
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_LIVEFEED = gql`
  mutation DeleteLiveFeed($id: ID!) {
    deleteLiveFeed(id: $id)
  }
`;

export const ADD_REACTION = gql`
  mutation AddReaction($input: ReactionInput!) {
    addReaction(input: $input) {
      id
      reactions {
        emoji
        count
        users
      }
    }
  }
`;

export const TOGGLE_PIN_POST = gql`
  mutation TogglePinPost($id: ID!) {
    togglePinPost(id: $id) {
      id
      isPinned
    }
  }
`;
