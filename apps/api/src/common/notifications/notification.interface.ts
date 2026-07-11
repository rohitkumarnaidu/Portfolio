export interface LeadNotificationPayload {
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  source: string;
  createdAt: string;
}

export interface NotificationAdapter {
  sendNewLeadNotification(payload: LeadNotificationPayload): Promise<void>;
  sendLeadStatusChanged(leadId: string, email: string, name: string, newStatus: string): Promise<void>;
}
