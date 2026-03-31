import { Test } from "../../models/Test";
import { requireAuth } from "../../utils/auth";
import { Types } from "mongoose";

/**
 * Context type for Apollo resolvers
 */
interface Context {
  user: any;
}

/**
 * Input types for GraphQL mutations
 */
interface CreateTestInput {
  eventId: string;
  title: string;
  questions: {
    questionText: string;
    type: string;
    options?: string[];
    correctAnswer?: any;
  }[];
}

interface SubmitTestResponseInput {
  TestId: string;
  responses: any;
}

/**
 * Utility function to score a Test
 */
const calculateScore = (Test: any, responses: any): number => {
  let score = 0;

  Test.questions.forEach((q: any, idx: number) => {
    const userResp = responses[idx];

    if (q.type === "TRUE_FALSE" || q.type === "MCQ_SINGLE") {
      if (
        String(userResp).trim().toLowerCase() ===
        String(q.correctAnswer).trim().toLowerCase()
      ) {
        score++;
      }
    } else if (q.type === "MCQ_MULTIPLE" && Array.isArray(q.correctAnswer)) {
      const correctSet = new Set(q.correctAnswer.map((x: any) => String(x)));
      const respSet = new Set(userResp.map((x: any) => String(x)));
      if (
        correctSet.size === respSet.size &&
        [...correctSet].every((x) => respSet.has(x))
      ) {
        score++;
      }
    }
    // TODO: Handle MATCHING and FILL_BLANK types later
  });

  return score;
};

const Query = {
  /**
   * Get all Tests for a specific event
   */
  eventTests: async (_: any, { eventId }: { eventId: string }) => {
    return await Test.find({ event: eventId })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
  },

  /**
   * Get a specific Test by ID (with responses if creator)
   */
  TestById: async (
    _: any,
    { TestId }: { TestId: string },
    { user }: Context,
  ) => {
    requireAuth(user);
    const Test = await Test.findById(TestId)
      .populate("createdBy", "name email")
      .populate("responses.respondent", "name email");

    if (!Test) throw new Error("Test not found");

    // Allow full response data only to Test creator
    if (Test.createdBy.toString() !== user.id.toString()) {
      Test.responses = [];
    }

    return Test;
  },
};

const Mutation = {
  /**
   * Create a new Test
   */
  createTest: async (
    _: any,
    { input }: { input: CreateTestInput },
    { user }: Context,
  ) => {
    requireAuth(user);

    const Test = await Test.create({
      event: new Types.ObjectId(input.eventId),
      title: input.title,
      questions: input.questions,
      createdBy: user.id,
    });

    return Test;
  },

  /**
   * Submit a Test response and calculate score
   */
  submitTestResponse: async (
    _: any,
    { TestId, responses }: SubmitTestResponseInput,
    { user }: Context,
  ) => {
    requireAuth(user);

    const Test = await Test.findById(TestId);
    if (!Test) throw new Error("Test not found");

    const score = calculateScore(Test, responses);

    Test.responses = Test.responses || [];
    Test.responses.push({
      respondent: user.id,
      responses,
      submittedAt: new Date(),
    });

    await Test.save();

    return { ...Test.toObject(), score };
  },
};

export default { Query, Mutation };
