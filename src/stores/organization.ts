import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { gql } from "@apollo/client/core";
import type { Organization } from "@/types/organization";
import { reactive } from "vue";

import { useUserStore } from "@/stores/user";
/**
 * Define the structure for the dialogs state.
 */
export type DialogKey = "details" | "legal" | "invoices" | "payments" | "edit";
interface DialogsState {
  details: boolean;
  legal: boolean;
  invoices: boolean;
  payments: boolean;
  edit: boolean;
  [key: string]: boolean;
}

const userStore = useUserStore();
// Dialog states (now typed)
const dialogs = reactive<DialogsState>({
  details: false,
  legal: false,
  invoices: false,
  payments: false,
  edit: false,
});

export const useOrganizationStore = defineStore("organizationStore", {
  state: () => ({
    dialogs: dialogs,
    organizations: [] as Organization[],
    organization: null as Organization | null,
    currentOrganization: null as Organization | null,
    myOrganization: null as Organization | null,
    total: 0,
    limit: 10,
    page: 1,
    itemsPerPage: 10,
    loading: false,
    dialogOpen: false,
    showLegalUpload: false,
    createDialogOpen: false,
    newVoucherDialog: false,
    createOrgUpload: false,
    dialogDetailOpen: false,
    error: null as unknown,
  }),

  actions: {
    openDialog(org: Organization, dialogKey: DialogKey) {
      this.currentOrganization = org;
      dialogs[dialogKey] = true;
    },

    closeDialog(dialogKey: DialogKey) {
      dialogs[dialogKey] = false;
      this.currentOrganization = null;
    },

    closeAllDialogs() {
      (Object.keys(dialogs) as DialogKey[]).forEach((key) => {
        dialogs[key] = false;
      });
      this.currentOrganization = null;
    },

    // -----------------------------
    // FETCH PAGINATED ORGANIZATIONS
    // -----------------------------
    async fetchOrganizationsPaginated(page = 1, limit = 10, filters?: any) {
      this.loading = true;
      this.error = null;

      try {
        const query = gql`
          query AdminOrganizationsDashboard(
            $page: Int!
            $limit: Int!
            $filters: OrganizationFilters
          ) {
            organizationsPaginated(
              page: $page
              limit: $limit
              filters: $filters
            ) {
              total
              page
              limit
              data {
                id
                name
                address
                email
                phone
                website
                subscriptionTier
                billingStatus
                nextBillingDate
                billingCycle
                trialEndsAt
                subscriptionStartDate
                subscriptionEndDate
                maxEvents
                maxParticipantsPerEvent
                maxConcurrentEvents
                maxStorageGB
                currentEventCount
                currentParticipantCount
                eventsThisMonth
                billingEmail
                billingAddress
                taxId
                registrationNumber
                paymentMethodId
                autoRenew
                customDomain
                ssoEnabled
                apiAccessEnabled
                webhookUrl
                dedicatedSupport
                customSLA
                orgLegalDocuments {
                  type
                  url
                  version
                  signedAt
                  signedBy
                }
                termsAcceptedAt
                privacyPolicyAcceptedAt
                isBlocked
                isSuspended
                orgType
                status
                metadata {
                  createdVia
                  approvalRequired
                  approvedBy
                  approvedAt
                  sourceIp
                  userAgent
                  verificationStatus
                  verifiedAt
                }
                createdBy {
                  id
                  name
                  email
                  phone
                  role
                }
                admins {
                  id
                  name
                  email
                  phone
                  role
                }
                invoices {
                  id
                  invoiceNumber
                  amount
                  status
                  paidAt
                  createdAt
                  updatedAt
                }
                payments {
                  id
                  organization {
                    id
                  }
                  invoice {
                    id
                  }
                  payer {
                    id
                  }
                  method
                  amount
                  currency
                  reference
                  status
                  paidAt
                  createdAt
                  updatedAt
                }
                quotas {
                  eventsUsed
                  eventsLimit
                  participantsUsed
                  participantsLimit
                  storageUsedGB
                  storageLimitGB
                  apiCallsThisMonth
                  apiCallsLimit
                  concurrentEventsUsed
                  concurrentEventsLimit
                  customDomainEnabled
                  ssoEnabled
                  apiAccessEnabled
                  dedicatedSupportEnabled
                }
                createdAt
                updatedAt
              }
            }
          }
        `;

        const response = await apolloClient.query({
          query,
          variables: { page, limit, filters },
          fetchPolicy: "network-only",
        });

        const { organizationsPaginated } = response.data;

        this.organizations = organizationsPaginated?.data ?? [];
        this.currentOrganization = this.organizations[0];
        this.total = organizationsPaginated?.total ?? 0;
        this.page = organizationsPaginated?.page ?? page;
        this.limit = organizationsPaginated?.limit ?? limit;

        return organizationsPaginated;
      } catch (err) {
        console.error("❌ Error in fetchOrganizationsPaginated:", err);
        this.error = err;
        this.organizations = [];
        this.total = 0;
        return { data: [], total: 0, page: this.page, limit: this.limit };
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // FETCH ORGANIZATION BY ID
    // -----------------------------
    async fetchOrganizationById(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const query = gql`
          query GetOrganizationById($id: ID!) {
            organization(id: $id) {
              id
              name
              address
              email
              phone
              website
              subscriptionTier
              billingStatus
              nextBillingDate
              billingCycle
              trialEndsAt
              subscriptionStartDate
              subscriptionEndDate
              maxEvents
              maxParticipantsPerEvent
              maxConcurrentEvents
              maxStorageGB
              currentEventCount
              currentParticipantCount
              eventsThisMonth
              billingEmail
              billingAddress
              taxId
              registrationNumber
              paymentMethodId
              autoRenew
              customDomain
              ssoEnabled
              apiAccessEnabled
              webhookUrl
              dedicatedSupport
              customSLA
              orgLegalDocuments {
                type
                url
                version
                signedAt
                signedBy
              }
              termsAcceptedAt
              privacyPolicyAcceptedAt
              isBlocked
              isSuspended
              orgType
              status
              metadata {
                createdVia
                approvalRequired
                approvedBy
                approvedAt
                sourceIp
                userAgent
                verificationStatus
                verifiedAt
              }
              createdBy {
                id
                name
                email
                phone
                role
              }
              users {
                id
                name
                email
                phone
                role
              }
              admins {
                id
                name
                email
                phone
                role
              }
              invoices {
                id
                invoiceNumber
                amount
                status
                paidAt
                createdAt
                updatedAt
              }
              events {
                id
                title
                description
                status
                eventType
                isFreeEvent
                createdAt
                updatedAt
              }
              payments {
                id
                organization {
                  id
                }
                invoice {
                  id
                }
                payer {
                  id
                }
                method
                amount
                currency
                reference
                status
                paidAt
                createdAt
                updatedAt
              }
              quotas {
                eventsUsed
                eventsLimit
                participantsUsed
                participantsLimit
                storageUsedGB
                storageLimitGB
                apiCallsThisMonth
                apiCallsLimit
                concurrentEventsUsed
                concurrentEventsLimit
                customDomainEnabled
                ssoEnabled
                apiAccessEnabled
                dedicatedSupportEnabled
              }
              createdAt
              updatedAt
            }
          }
        `;

        const { data } = await apolloClient.query({
          query,
          variables: { id },
        });

        this.organization = data.organization ?? null;
        return data.organization;
      } catch (err) {
        console.error("❌ Error in fetchOrganizationById:", err);
        this.error = err;
        this.organization = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // FETCH MY ORGANIZATIONS
    // -----------------------------
    async fetchMyOrganizations(userId: string) {
      this.loading = true;
      this.error = null;

      try {
        const query = gql`
          query MyOrganizations($userId: ID!) {
            myOrganizations(userId: $userId) {
              id
              name
              address
              email
              phone
              website
              subscriptionTier
              billingStatus
              nextBillingDate
              billingCycle
              trialEndsAt
              subscriptionStartDate
              subscriptionEndDate
              maxEvents
              maxParticipantsPerEvent
              maxConcurrentEvents
              maxStorageGB
              currentEventCount
              currentParticipantCount
              eventsThisMonth
              billingEmail
              billingAddress
              taxId
              registrationNumber
              autoRenew
              customDomain
              ssoEnabled
              apiAccessEnabled
              webhookUrl
              dedicatedSupport
              customSLA
              orgLegalDocuments {
                type
                url
                version
                signedAt
                signedBy
              }
              termsAcceptedAt
              privacyPolicyAcceptedAt
              isBlocked
              isSuspended
              orgType
              status
              metadata {
                createdVia
                approvalRequired
                approvedBy
                approvedAt
                sourceIp
                userAgent
                verificationStatus
                verifiedAt
              }
              createdBy {
                id
                name
                email
                phone
                role
              }
              users {
                id
                name
                email
                phone
                role
              }
              admins {
                id
                name
                email
                phone
                role
              }
              invoices {
                id
                invoiceNumber
                amount
                status
                paidAt
                createdAt
                updatedAt
              }
              events {
                id
                title
                description
                status
                eventType
                isFreeEvent
              }
              payments {
                id
                organization {
                  id
                }
                invoice {
                  id
                }
                payer {
                  id
                }
                method
                amount
                currency
                reference
                status
                paidAt
                createdAt
                updatedAt
              }
              quotas {
                eventsUsed
                eventsLimit
                participantsUsed
                participantsLimit
                storageUsedGB
                storageLimitGB
                apiCallsThisMonth
                apiCallsLimit
                concurrentEventsUsed
                concurrentEventsLimit
              }
              createdAt
              updatedAt
            }
          }
        `;

        const { data } = await apolloClient.query({
          query,
          variables: { userId },
          fetchPolicy: "network-only",
        });

        this.organizations = data.myOrganizations ?? [];
        this.myOrganization = data.myOrganizations?.[0] ?? null;
        this.organization = data.myOrganizations?.[0] ?? null;
        return data.myOrganizations;
      } catch (err) {
        console.error("❌ Error in fetchMyOrganizations:", err);
        this.error = err;
        this.organizations = [];
        this.myOrganization = null;
        this.organization = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // EXPRESS CREATE ORGANIZATION (Simplified)
    // -----------------------------
    async expressCreateOrganization(input: {
      name: string;
      email: string;
      phone?: string;
      address?: string;
      website?: string;
      orgType?: string;
      subscriptionTier?: string;
      maxEvents?: number;
      maxParticipants?: number;
      orgLegalDocuments?: string[];
      billingEmail?: string;
      autoRenew?: boolean;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation ExpressCreateOrganization(
            $input: ExpressCreateOrganizationInput!
          ) {
            expressCreateOrganization(input: $input) {
              id
              name
              address
              email
              phone
              website
              orgType
              subscriptionTier
              billingStatus
              maxEvents
              maxParticipantsPerEvent
              status
              autoRenew
              createdAt
              updatedAt
            }
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { input },
        });

        const createdOrg = data.expressCreateOrganization;

        if (createdOrg) {
          this.organizations = [...this.organizations, createdOrg];
          this.currentOrganization = createdOrg;
        }
        // await this.fetchMyOrganizations(userStore?.user?.id || "");

        return createdOrg;
      } catch (err) {
        console.error("❌ Error in expressCreateOrganization:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // STANDARD CREATE ORGANIZATION (Comprehensive)
    // -----------------------------
    // In organization store
    async standardCreateOrganization(input: {
      orgCreator: string; // Add this mandatory field
      name: string;
      email: string;
      phone?: string;
      address?: string;
      website?: string;
      orgType: string;
      subscriptionTier: string;
      maxEvents?: number;
      maxParticipantsPerEvent?: number;
      orgLegalDocuments?: string[];
      taxId?: string;
      registrationNumber?: string;
      billingAddress?: string;
      billingEmail?: string;
      primaryContactName?: string;
      primaryContactPhone?: string;
      billingCycle?: string;
      autoRenew?: boolean;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation StandardCreateOrganization(
            $input: StandardCreateOrganizationInput!
          ) {
            standardCreateOrganization(input: $input) {
              id
              name
              address
              email
              phone
              website
              orgType
              subscriptionTier
              billingStatus
              maxEvents
              maxParticipantsPerEvent
              status
              billingCycle
              autoRenew
              createdAt
              updatedAt
              createdBy {
                id
                name
                email
                role
              }
            }
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { input },
        });

        const createdOrg = data.standardCreateOrganization;

        if (createdOrg) {
          this.organizations = [...this.organizations, createdOrg];
          this.currentOrganization = createdOrg;
        }

        // await this.fetchMyOrganizations(userStore?.user?.id || "");

        return createdOrg;
      } catch (err) {
        console.error("❌ Error in standardCreateOrganization:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // UPDATE ORGANIZATION
    // -----------------------------
    async updateOrganization(input: {
      id: string;
      name?: string;
      email?: string;
      orgType?: string;
      subscriptionTier?: string;
      maxEvents?: number;
      maxParticipantsPerEvent?: number;
      isBlocked?: boolean;
      phone?: string;
      address?: string;
      website?: string;
      orgLegalDocuments?: string[];
      billingEmail?: string;
      billingAddress?: string;
      autoRenew?: boolean;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation UpdateOrganization($input: UpdateOrganizationInput!) {
            updateOrganization(input: $input) {
              id
              name
              address
              email
              phone
              website
              orgType
              subscriptionTier
              billingStatus
              maxEvents
              maxParticipantsPerEvent
              isBlocked
              isSuspended
              status
              billingEmail
              billingAddress
              autoRenew
              updatedAt
            }
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { input },
        });

        const updatedOrg = data.updateOrganization;

        const index = this.organizations.findIndex((o) => o.id === input.id);
        if (index !== -1) this.organizations[index] = updatedOrg;

        if (this.organization?.id === input.id) this.organization = updatedOrg;
        if (this.myOrganization?.id === input.id)
          this.myOrganization = updatedOrg;

        return updatedOrg;
      } catch (err) {
        console.error("❌ Error in updateOrganization:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // DELETE ORGANIZATION
    // -----------------------------
    async deleteOrganization(id: string) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation DeleteOrganization($id: ID!) {
            deleteOrganization(id: $id)
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { id },
        });

        if (data.deleteOrganization) {
          this.organizations = this.organizations.filter(
            (org) => org.id !== id,
          );
          if (this.organization?.id === id) this.organization = null;
          if (this.myOrganization?.id === id) this.myOrganization = null;
          if (this.currentOrganization?.id === id)
            this.currentOrganization = null;
        }

        return data.deleteOrganization;
      } catch (err) {
        console.error("❌ Error in deleteOrganization:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // SUBSCRIPTION MANAGEMENT
    // -----------------------------
    async updateSubscription(input: {
      organizationId: string;
      subscriptionTier: string;
      billingCycle?: string;
      autoRenew?: boolean;
      paymentMethodId?: string;
    }) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation UpdateSubscription($input: UpdateSubscriptionInput!) {
            updateSubscription(input: $input) {
              id
              name
              subscriptionTier
              billingCycle
              autoRenew
              nextBillingDate
              status
            }
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { input },
        });

        const updatedOrg = data.updateSubscription;

        // Update in local state
        const index = this.organizations.findIndex(
          (o) => o.id === input.organizationId,
        );
        if (index !== -1) this.organizations[index] = updatedOrg;
        if (this.organization?.id === input.organizationId)
          this.organization = updatedOrg;
        if (this.myOrganization?.id === input.organizationId)
          this.myOrganization = updatedOrg;

        return updatedOrg;
      } catch (err) {
        console.error("❌ Error in updateSubscription:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async cancelSubscription(organizationId: string) {
      this.loading = true;
      this.error = null;

      try {
        const mutation = gql`
          mutation CancelSubscription($organizationId: ID!) {
            cancelSubscription(organizationId: $organizationId) {
              id
              subscriptionTier
              billingStatus
              status
              subscriptionEndDate
            }
          }
        `;

        const { data } = await apolloClient.mutate({
          mutation,
          variables: { organizationId },
        });

        return data.cancelSubscription;
      } catch (err) {
        console.error("❌ Error in cancelSubscription:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // ANALYTICS & QUOTAS
    // -----------------------------
    async fetchOrganizationAnalytics(organizationId: string) {
      this.loading = true;
      this.error = null;

      try {
        const query = gql`
          query OrganizationAnalytics($organizationId: ID!) {
            organizationAnalytics(organizationId: $organizationId) {
              totalEventsCreated
              totalParticipantsRegistered
              averageEventAttendance
              totalRevenue
              pendingInvoices
              overdueInvoices
              activeEvents
              eventsThisMonth
              participantsThisMonth
              apiUsagePercentage
              storageUsagePercentage
              estimatedNextInvoice
              usageByEventType {
                eventType
                count
                participants
              }
              tierSavings {
                currentTier
                estimatedMonthlyCost
                savingsFromFreeTier
                recommendedTier
              }
            }
          }
        `;

        const { data } = await apolloClient.query({
          query,
          variables: { organizationId },
        });

        return data.organizationAnalytics;
      } catch (err) {
        console.error("❌ Error in fetchOrganizationAnalytics:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrganizationQuota(organizationId: string) {
      this.loading = true;
      this.error = null;

      try {
        const query = gql`
          query OrganizationQuota($organizationId: ID!) {
            organizationQuota(organizationId: $organizationId) {
              eventsUsed
              eventsLimit
              participantsUsed
              participantsLimit
              storageUsedGB
              storageLimitGB
              apiCallsThisMonth
              apiCallsLimit
              concurrentEventsUsed
              concurrentEventsLimit
              customDomainEnabled
              ssoEnabled
              apiAccessEnabled
              dedicatedSupportEnabled
            }
          }
        `;

        const { data } = await apolloClient.query({
          query,
          variables: { organizationId },
        });

        return data.organizationQuota;
      } catch (err) {
        console.error("❌ Error in fetchOrganizationQuota:", err);
        this.error = err;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // -----------------------------
    // TOGGLE UPLOAD SECTION
    // -----------------------------
    toggleOrgUpload(value?: boolean) {
      this.createOrgUpload =
        typeof value === "boolean" ? value : !this.createOrgUpload;
    },
  },
});
