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
}
