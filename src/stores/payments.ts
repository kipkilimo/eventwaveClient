// stores/payments.ts
import { defineStore } from "pinia";
import { apolloClient } from "@/plugins/apollo";
import { gql } from "@apollo/client/core";
import { useRouter } from "vue-router";

// -----------------------------
// Types
// -----------------------------
interface PaymentState {
  payments: any[];
  paymentObject: Record<string, any>;
  payment: Record<string, any>;
  showSubscriptionPayment: boolean;
}

interface WaiverPaymentInput {
  userId: string;
  discussionGroupId: string;
}

interface MpesaDonationInput {
  paidAmount: string;
  paymentPhoneNumber: string;
}

interface PaypalDonationInput {
  userId: string;
  transactionReferenceNumber: string;
  paidAmount: string;
  transactionEntity: string;
  departmentId?: string;
  discussionGroupId?: string;
}

interface GraphqlResponse<T> {
  data: T;
}

interface WaiverPaymentResponse {
  publicationCreditsPaymentViaWaiver: { id: string };
}

interface MpesaDonationResponse {
  processMpesaDonation: { id: string };
}

interface PaypalDonationResponse {
  processPaypalDonation: { id: string };
}

// -----------------------------
// Store
// -----------------------------
export const usePaymentsStore = defineStore("paymentStore", {
  state: (): PaymentState => ({
    payments: [],
    paymentObject: {},
    payment: {},
    showSubscriptionPayment: false,
  }),

  actions: {
    // -----------------------------
    // Waiver Payment
    // -----------------------------
    async handleMakeAccessPaymentViaWAIVER(vals: WaiverPaymentInput) {
      const router = useRouter();

      const WAIVER_MUTATION = gql`
        mutation publicationCreditsPaymentViaWaiver(
          $userId: String!
          $discussionGroupId: String!
        ) {
          publicationCreditsPaymentViaWaiver(
            userId: $userId
            discussionGroupId: $discussionGroupId
          ) {
            id
          }
        }
      `;

      try {
        const result = await apolloClient.mutate<GraphqlResponse<WaiverPaymentResponse>>({
          mutation: WAIVER_MUTATION,
          variables: {
            userId: vals.userId,
            discussionGroupId: vals.discussionGroupId,
          },
        });
        console.log("Waiver Payment Result:", result.data);
        setTimeout(() => router.push("/dashboard/library"), 1800);
      } catch (error: any) {
        console.error("Waiver Payment error:", error);
        setTimeout(() => {
          localStorage.removeItem("currentUser");
          router.push("/dashboard/library");
        }, 1800);
      }
    },

    // -----------------------------
    // PayPal Donation
    // -----------------------------
    async handleMakeDonationViaPaypal(vals: PaypalDonationInput) {
      const router = useRouter();

      const PAYPAL_MUTATION = gql`
        mutation processPaypalDonation(
          $userId: String
          $transactionReferenceNumber: String!
          $paidAmount: String!
          $transactionEntity: String
          $departmentId: String
          $discussionGroupId: String
        ) {
          processPaypalDonation(
            userId: $userId
            transactionReferenceNumber: $transactionReferenceNumber
            paidAmount: $paidAmount
            transactionEntity: $transactionEntity
            departmentId: $departmentId
            discussionGroupId: $discussionGroupId
          ) {
            id
          }
        }
      `;

      try {
        const result = await apolloClient.mutate<GraphqlResponse<PaypalDonationResponse>>({
          mutation: PAYPAL_MUTATION,
          variables: {
            userId: vals.userId,
            transactionReferenceNumber: vals.transactionReferenceNumber,
            paidAmount: vals.paidAmount,
            transactionEntity: vals.transactionEntity,
            departmentId: vals.departmentId,
            discussionGroupId: vals.discussionGroupId,
          },
        });
        console.log("PayPal Payment Result:", result.data);
        setTimeout(() => router.push("/dashboard/library"), 1800);
      } catch (error: any) {
        console.error("PayPal Payment error:", error);
      }
    },

    // -----------------------------
    // MPESA Donation
    // -----------------------------
    async handleDonationViaMpesa(vals: MpesaDonationInput) {
      const router = useRouter();

      const MPESA_MUTATION = gql`
        mutation processMpesaDonation(
          $paidAmount: String!
          $paymentPhoneNumber: String!
        ) {
          processMpesaDonation(
            paidAmount: $paidAmount
            paymentPhoneNumber: $paymentPhoneNumber
          ) {
            id
          }
        }
      `;

      try {
        const result = await apolloClient.mutate<GraphqlResponse<MpesaDonationResponse>>({
          mutation: MPESA_MUTATION,
          variables: {
            paidAmount: vals.paidAmount,
            paymentPhoneNumber: vals.paymentPhoneNumber,
          },
        });
        console.log("MPESA Donation Result:", result.data);
        router.push("/dashboard/library");
      } catch (error: any) {
        console.error("MPESA Payment error:", error);
      }
    },
  },
});
