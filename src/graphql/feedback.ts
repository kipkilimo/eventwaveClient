import { gql } from "@apollo/client/core";

/* ===========================
   QUERIES
=========================== */
// Add this to your existing queries
export const GET_EVENT_FEEDBACKS = gql`
  query GetEventFeedbacks($eventId: ID!) {
    getAllEventFeedbacks(eventId: $eventId) {
      id
      title
      description
      status
      targetType
      targetId
      totalParticipants
      averageRating
      questions {
        id
        text
        type 
      }
      responses {
        id
        participantId
        submittedAt
      }
      isAnonymous
      createdAt
      closesAt
      metadata
      allowMultipleSubmissions
      responseWindowDuration
    }
  }
`;

export const GET_FEEDBACK_BY_ID = gql`
  query GET_FEEDBACK_BY_ID($id: ID!) {
    getFeedbackById(id: $id) {
      id
      title
      description
      targetId
      targetType
      status
      isAnonymous
      allowMultipleSubmissions
      questions {
        id
        text
        type
        isRequired
        metadata
        matrixItems
        matrixScale
        createdAt
        updatedAt
      }
      responses {
        id
        questionId
        questionText
        questionType
        matrixValues
        participantId
        submittedAt
        sentiment
      }
      participants {
        id
        name
        email
        submittedAt
        sentiment
      }
      totalParticipants
      createdBy
      createdAt
      updatedAt
      closesAt
      reminderSent
      metadata
      isAcceptingResponses
      lastAcceptedResponsesDate
      responseWindowDuration
      analytics {
        totalSubmissions
        completionRate
        averageRating
        averageSentimentScore
        questionAnalytics {
          questionId
          questionText
          questionType
          responseCount
          averageRating
          commonResponses {
            value
            count
            percentage
          }
          sentimentDistribution {
            veryNegative
            negative
            neutral
            positive
            veryPositive
            total
          }
        }
        sentimentDistribution {
          veryNegative
          negative
          neutral
          positive
          veryPositive
          total
        }
        submissionTrend {
          date
          count
        }
      }
      averageRating
      averageSentimentScore
    }
  }
`;

export const GET_FEEDBACK_ANALYTICS = gql`
  query GET_FEEDBACK_ANALYTICS($feedbackId: ID!) {
    getFeedbackAnalytics(feedbackId: $feedbackId) {
      totalSubmissions
      completionRate
      averageRating
      averageSentimentScore
      questionAnalytics {
        questionId
        questionText
        questionType
        responseCount
        averageRating
        commonResponses {
          value
          count
          percentage
        }
        sentimentDistribution {
          veryNegative
          negative
          neutral
          positive
          veryPositive
          total
        }
      }
      sentimentDistribution {
        veryNegative
        negative
        neutral
        positive
        veryPositive
        total
      }
      submissionTrend {
        date
        count
      }
    }
  }
`;

/* ===========================
   MUTATIONS
=========================== */

export const SUBMIT_FEEDBACK = gql`
  mutation SUBMIT_FEEDBACK($input: FeedbackSubmissionInput!) {
    submitFeedback(input: $input) {
      id
      questionId
      questionText
      questionType
      matrixValues
      participantId
      submittedAt
      sentiment
    }
  }
`;

export const CREATE_FEEDBACK = gql`
  mutation CREATE_FEEDBACK(
    $title: String!
    $description: String
    $targetId: ID!
    $targetType: FeedbackTargetType!
    $questions: [FeedbackQuestionInput!]!
    $isAnonymous: Boolean
    $allowMultipleSubmissions: Boolean
    $closesAt: String
    $metadata: String
    $responseWindowDuration: ResponseWindowDuration
  ) {
    createFeedback(
      title: $title
      description: $description
      targetId: $targetId
      targetType: $targetType
      questions: $questions
      isAnonymous: $isAnonymous
      allowMultipleSubmissions: $allowMultipleSubmissions
      closesAt: $closesAt
      metadata: $metadata
      responseWindowDuration: $responseWindowDuration
    ) {
      id
      title
      description
      targetId
      targetType
      status
      questions {
        id
        text
        type
        isRequired
        metadata
        matrixItems
        matrixScale
        createdAt
        updatedAt
      }
      isAnonymous
      allowMultipleSubmissions
      closesAt
      responseWindowDuration
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FEEDBACK = gql`
  mutation UPDATE_FEEDBACK($id: ID!, $input: UpdateFeedbackInput!) {
    updateFeedback(id: $id, input: $input) {
      id
      title
      description
      status
      questions {
        id
        text
        type
        isRequired
        metadata
        matrixItems
        matrixScale
        createdAt
        updatedAt
      }
      updatedAt
      isAnonymous
      responseWindowDuration
    }
  }
`;

export const CLOSE_FEEDBACK = gql`
  mutation CLOSE_FEEDBACK($id: ID!) {
    closeFeedback(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const REOPEN_FEEDBACK = gql`
  mutation REOPEN_FEEDBACK($id: ID!) {
    reopenFeedback(id: $id) {
      id
      status
      updatedAt
    }
  }
`;

export const ADD_FEEDBACK_PARTICIPANTS = gql`
  mutation ADD_FEEDBACK_PARTICIPANTS($feedbackId: ID!, $participantIds: [ID!]!) {
    addFeedbackParticipants(feedbackId: $feedbackId, participantIds: $participantIds) {
      id
      participants {
        id
        name
        email
        submittedAt
        sentiment
      }
      totalParticipants
    }
  }
`;

export const REMOVE_FEEDBACK_PARTICIPANTS = gql`
  mutation REMOVE_FEEDBACK_PARTICIPANTS($feedbackId: ID!, $participantIds: [ID!]!) {
    removeFeedbackParticipants(feedbackId: $feedbackId, participantIds: $participantIds) {
      id
      participants {
        id
        name
        email
        submittedAt
        sentiment
      }
      totalParticipants
    }
  }
`;

export const GENERATE_FEEDBACK_ACCESS_KEYS = gql`
  mutation GENERATE_FEEDBACK_ACCESS_KEYS($feedbackId: ID!, $count: Int) {
    generateFeedbackAccessKeys(feedbackId: $feedbackId, count: $count)
  }
`;

export const SEND_FEEDBACK_REMINDER = gql`
  mutation SEND_FEEDBACK_REMINDER($feedbackId: ID!) {
    sendFeedbackReminder(feedbackId: $feedbackId)
  }
`;
