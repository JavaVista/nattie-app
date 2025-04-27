export interface Microblog {
  id?: string;
  user_id: string;
  title: string;
  content: string[];
  useless_facts?: string[];
  file_urls?: string[];
  created_at?: string;
  location?: string;
}
