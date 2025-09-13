export interface Branch {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'inactive';
  members_count: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'trainer' | 'member';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_login?: string;
  created_at: string;
  subscription_plan?: string;
  phone?: string;
  location?: string;
  bio?: string;
  branches?: Branch[];
}
