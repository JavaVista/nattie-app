export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at?: string;
}

export interface AuthState {
  user: any | null;
  error: any | null;
  profile: UserProfile | null;
}
