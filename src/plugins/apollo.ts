import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client/core"; // Core only
import type { NormalizedCacheObject } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context"; // Auth link
import { onError } from "@apollo/client/link/error"; // Error handling
import { DefaultApolloClient } from "@vue/apollo-composable"; // Vue 3 integration
import type { App } from "vue";

// ------------------------------------------------------
// 🌐 Dynamic API URL from .env
// ------------------------------------------------------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4003";
const GRAPHQL_ENDPOINT = `${API_URL.replace(/\/$/, "")}/graphql`;

// ------------------------------------------------------
// 🔗 HTTP Link
// ------------------------------------------------------
const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

// ------------------------------------------------------
// 🛡 Auth Link (attach JWT from localStorage to all requests)
// ------------------------------------------------------
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// ------------------------------------------------------
// 🚨 Error Link for better debugging
// ------------------------------------------------------
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `❌ [GraphQL error]: Operation: ${operation.operationName}, Message: ${message}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`🚨 [Network error]:`, networkError);
  }
});

// ------------------------------------------------------
// 🚀 Apollo Client Initialization
// ------------------------------------------------------
export const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: "all" },
    query: { errorPolicy: "all" },
  },
});

// ------------------------------------------------------
// 🧹 Utilities
// ------------------------------------------------------
export const apolloUtils = {
  async clearCache() {
    await apolloClient.clearStore();
  },
  async logOut() {
    localStorage.removeItem("token");
    await apolloClient.clearStore();
  },
  debugToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      console.log("🔍 Token payload:", payload);
      return payload;
    } catch {
      console.error("❌ Failed to decode token");
      return null;
    }
  },
};

// ------------------------------------------------------
// 🔌 Vue Plugin Export
// ------------------------------------------------------
export const apolloPlugin = {
  install(app: App) {
    app.provide(DefaultApolloClient, apolloClient);
    app.config.globalProperties.$apolloUtils = apolloUtils;
  },
};
