export type AnimalReport = {
  id: string;
  userId: string;
  animalType: string;
  date: Date;
  isEndangered: boolean;
  notes?: string;
}; 