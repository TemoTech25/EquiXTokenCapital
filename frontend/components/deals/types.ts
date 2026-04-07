export type DealStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'TRANSFER_COMPLETED' | string;

export type DealParticipant = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type DealDocument = {
  id: string;
  name?: string;
  fileName?: string;
  documentType?: string;
};

export type DealTimelineEvent = {
  id?: string;
  label?: string;
  description?: string;
  at?: string;
};

export type Deal = {
  id: string;
  propertyId: string;
  status: DealStatus;
  createdAt?: string;
  updatedAt?: string;
  property?: {
    id: string;
    title?: string;
    name?: string;
  };
  buyerId?: string;
  sellerId?: string;
  agentId?: string;
  conveyancerId?: string;
  buyer?: DealParticipant;
  seller?: DealParticipant;
  agent?: DealParticipant;
  conveyancer?: DealParticipant;
  timeline?: DealTimelineEvent[];
  documents?: DealDocument[];
};
