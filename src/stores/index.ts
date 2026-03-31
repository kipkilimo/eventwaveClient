import organizationResolvers from "./organization";
import eventResolvers from "./event";
import userResolvers from "./user";
import pollResolvers from "./poll";
import TestResolvers from "./Test";

export default {
  Query: {
    ...userResolvers.Query,
    ...organizationResolvers.Query,
    ...eventResolvers.Query,
    ...pollResolvers.Query,
    ...TestResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...organizationResolvers.Mutation,
    ...eventResolvers.Mutation,
    ...pollResolvers.Mutation,
    ...TestResolvers.Mutation,
  },
};
