export interface Microblog {
  id?: string;
  userId: string;
  title: string;
  content: string;
  fileUrls?: string[];
  created_at?: string;
  location?: string;
}
