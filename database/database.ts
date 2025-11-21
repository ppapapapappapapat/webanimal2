export interface Detection {
  id: string;
  image: string;
  animalId: string;
  userId: string;
  confidence: number;
  timestamp: Date;
}
