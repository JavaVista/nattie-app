export interface Microblog {
  id?: string;
  user_id: string;
  title: string;
  content: any;
  useless_facts?: string[];
  file_urls?: string[];
  created_at?: string;
  country?: string;
  location_id?: string;
  place_id?: string;
}
