export interface Profile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface PetDetails {
  species?: string;
  breed?: string;
  age?: string;
  vet_name?: string;
  vet_phone?: string;
  feeding_schedule?: string;
  medications?: string;
  special_care?: string;
  personality_notes?: string;
}

export interface Item {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  estimated_value: number | null;
  photo_url: string | null;
  item_type: 'item' | 'pet';
  pet_details: PetDetails | null;
  created_at: string;
  updated_at: string;
}

export interface Beneficiary {
  id: string;
  item_id: string;
  owner_id: string;
  full_name: string;
  email: string;
  priority: 'primary' | 'secondary';
  created_at: string;
}

export interface Acknowledgment {
  id: string;
  beneficiary_id: string;
  item_id: string;
  status: 'pending' | 'accepted' | 'declined';
  notified_at: string;
  acknowledged_at: string | null;
  token: string;
}

// Joined types for UI use
export interface ItemWithBeneficiaries extends Item {
  beneficiaries: Beneficiary[];
}

export interface AcknowledgmentWithDetails extends Acknowledgment {
  beneficiary: Beneficiary;
  item: Item;
}

export interface Vault {
  id: string;
  owner_id: string;
  name: string;
  type: 'family' | 'shared';
  created_at: string;
}

export interface VaultMember {
  id: string;
  vault_id: string;
  email: string;
  added_at: string;
}

export interface VaultWithMembers extends Vault {
  vault_members: VaultMember[];
}
