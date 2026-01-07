export interface EmailDelivery {
  deliveryId: string;
  recommendationId: string;
  recipientEmail: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
}
