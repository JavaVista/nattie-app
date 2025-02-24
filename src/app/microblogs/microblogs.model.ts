export interface Microblog {
  id?: string;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
}
