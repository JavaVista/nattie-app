export interface Location {
  id: string;
  city: string;
  country: string;
  photo_url: string;
  created_at?: string;
}

export interface Place {
  id: string;
  location_id: string;
  place_name: string;
  photo_url: string;
  created_at?: string;
}
