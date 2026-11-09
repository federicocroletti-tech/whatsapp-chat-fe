export type ServiceRequestStatus = 'received' | 'in_review' | 'closed';

export interface ServiceRequest {
  id: string;
  wa_id: string;
  customer_name: string;
  motorcycle: string;
  issue: string;
  availability: string;
  status: ServiceRequestStatus;
  created_at: string;
}

export interface OperatorSession {
  username: string;
  role: 'owner' | 'operator';
}

export interface TenantProfile {
  displayName: string;
  privacyUrl: string;
  branding: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
  };
}
