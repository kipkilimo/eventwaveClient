import { gql } from "@apollo/client/core";
export enum ConnectionStatus {
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
  CONNECTED = "connected",
  ERROR = "error",
}

/* =======================
   QUERIES
======================= */

export const EVENT_QNA = gql`
  query EventQnA($eventId: ID!) {
    eventQnA(eventId: $eventId) {
      id
      event
      question
      answer

      isAnonymous
      isAnswered
      isPinned
      tags

      askedBy {
        id
        name 
      }

      answeredBy {
        id
        name 
      }

      upvotes {
        id
        name 
      }

      upvoteCount

      satisfactionScores {
        score
        updatedAt
        user {
          id
          name 
        }
      }

      createdAt
      updatedAt
    }
  }
`;

/* =======================
   MUTATIONS
======================= */

export const CREATE_QNA = gql`
  mutation CreateQnA($input: CreateQnAInput!) {
    createQnA(input: $input) {
      id
      event
      question
      answer

      isAnonymous
      isAnswered
      isPinned
      tags

      askedBy {
        id
        name 
      }

      upvotes {
        id
        name 
      }

      upvoteCount

      createdAt
      updatedAt
    }
  }
`;

export const ANSWER_QNA = gql`
  mutation AnswerQnA($input: AnswerQnAInput!) {
    answerQnA(input: $input) {
      id
      answer
      isAnswered

      answeredBy {
        id
        name 
      }

      updatedAt
    }
  }
`;

export const TOGGLE_UPVOTE = gql`
  mutation ToggleUpvote($input: ToggleUpvoteInput!) {
    toggleUpvote(input: $input) {
      id

      upvotes {
        id
        name 
      }

      upvoteCount
      updatedAt
    }
  }
`;

export const ADD_SATISFACTION = gql`
  mutation AddSatisfaction($input: AddSatisfactionInput!) {
    addSatisfaction(input: $input) {
      id

      satisfactionScores {
        score
        updatedAt
        user {
          id
          name 
        }
      }

      updatedAt
    }
  }
`;

export const PIN_QNA = gql`
  mutation PinQnA($qnaId: ID!, $pinned: Boolean!) {
    pinQnA(qnaId: $qnaId, pinned: $pinned) {
      id
      isPinned
      updatedAt
    }
  }
`;
