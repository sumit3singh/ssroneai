/**
 * SSR One AI — TypeScript Developer SDK for Third-Party Plugins & Clients
 */

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: "payment" | "sms" | "email" | "whatsapp" | "gst" | "shipping" | "custom";
  hooks?: string[];
}

export interface PaymentRequest {
  order_id: string;
  amount: number;
  currency: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface PaymentResult {
  transaction_id: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  provider: string;
  raw_response?: Record<string, unknown>;
}

export abstract class BasePaymentPlugin {
  abstract readonly pluginId: string;
  abstract readonly providerName: string;
  abstract processPayment(request: PaymentRequest): Promise<PaymentResult>;
  abstract refundPayment(transactionId: string, amount: number): Promise<boolean>;
}
