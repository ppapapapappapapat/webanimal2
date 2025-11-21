'use client';

import { User } from '../context/UserContext';

export type Animal = {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  color?: string;
  weight?: number;
  weightKg?: number;
  userId: string;
  imageUrl?: string;
  status: 'healthy' | 'sick' | 'recovering' | 'unknown';
  lastCheckup?: Date;
  medicalHistory?: string[];
  description?: string;
  createdAt: Date;
  taxonomy?: string; // Changed to match DetectionReport type
};

export type Detection = {
  id: string;
  userId: string;
  animalId?: string;
  timestamp: Date;
  imageUrl: string;
  detections: Array<{
    class: string;
    score: number;
    bbox: number[];
    isEndangered?: boolean;
    taxonomy?: string; // Changed to match DetectionReport type
  }>;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  observerName?: string;
  mode?: 'image' | 'video';
  deviceInfo?: {
    userAgent: string;
    platform: string;
    screenWidth: number;
    screenHeight: number;
  };
  metadata?: {
    animalCount: number;
    highestConfidence: number;
    hasEndangeredSpecies: boolean;
    endangeredCount: number;
    sessionId: string;
  };
};

// Add new DetectionReport type
export type DetectionReport = {
  id: string;
  userId: string;
  timestamp: string;
  imageSource: string; // Add this property
  detectedAnimals: {
    type: string;
    confidence: number;
    isEndangered: boolean;
    details?: {
      conservationStatus: string;
      population: string;
      habitat: string;
    };
  }[];
  summary: {
    totalAnimals: number;
    endangeredCount: number;
    highestConfidence: number;
    averageConfidence: number;
  };
  detectionMode: string;
  environmentData?: {
    browser: string;
    screenResolution: string;
    timeZone: string;
  };
};

// For storing user credentials separately from user profile data
export type UserCredentials = {
  userId: string;
  email: string;
  password: string;
};

// Fix missing AnimalReport type definition
type AnimalReport = {
  id: string;
  userId: string;
  animalType: string;
  date: Date;
  isEndangered: boolean;
  notes?: string;
  location?: { latitude: number; longitude: number };
};

// Add this type definition near the top with the other type definitions
export type AnimalDiagnosis = {
  id: string;
  userId: string;
  animalType: string;
  symptoms: string;
  diagnosis: string;
  date: string;
  imageUrl?: string;
  recommendation?: string;
  severity?: 'low' | 'medium' | 'high';
  followUpRecommended?: boolean;
  createdAt: Date;
};

export type Diagnosis = {
  id: string;
  animalType: string;
  symptoms: string;
  diagnosis: string;
  date: string;
  userId: string;
  imageUrl?: string;
  createdAt: Date;
};

// Mock data
const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2025-01-15T10:30:00.000Z'),
    updatedAt: new Date('2025-01-15T10:30:00.000Z'),
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2025-02-20T14:45:00.000Z'),
    updatedAt: new Date('2025-02-20T14:45:00.000Z'),
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  },
  {
    id: 'default_admin',
    name: 'Admin User',
    email: 'admin@animalcare.com',
    role: 'admin',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2025-01-01T08:00:00.000Z'),
    updatedAt: new Date('2025-01-01T08:00:00.000Z'),
    preferences: {
      theme: 'dark',
      notifications: true,
      language: 'en'
    }
  },
  {
    id: 'default_user',
    name: 'Regular User',
    email: 'user@animalcare.com',
    role: 'user',
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=150&q=80',
    createdAt: new Date('2025-01-01T09:00:00.000Z'),
    updatedAt: new Date('2025-01-01T09:00:00.000Z'),
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  }
];

// Mock credentials store - in a real app, passwords would be hashed
const MOCK_CREDENTIALS: UserCredentials[] = [
  {
    userId: 'user_1',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    userId: 'user_2',
    email: 'jane@example.com',
    password: 'admin123'
  },
  {
    userId: 'default_admin',
    email: 'admin@animalcare.com',
    password: 'admin123456'
  },
  {
    userId: 'default_user',
    email: 'user@animalcare.com',
    password: 'user123456'
  }
];

const MOCK_ANIMALS: Animal[] = [
  {
    id: 'animal_1',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    age: 3,
    color: 'Cream',
    weight: 4.5,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-05-10'),
    medicalHistory: ['Vaccinated', 'Neutered'],
    createdAt: new Date('2022-01-15'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_2',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 5,
    color: 'Golden',
    weight: 30,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-15'),
    medicalHistory: ['Vaccinated', 'Microchipped'],
    createdAt: new Date('2020-03-10'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_3',
    name: 'Dumbo',
    species: 'Elephant',
    age: 10,
    color: 'Grey',
    weight: 2000,
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=400&q=80',
    status: 'recovering',
    lastCheckup: new Date('2025-06-01'),
    medicalHistory: ['Treated for foot injury'],
    createdAt: new Date('2018-05-20'),
    taxonomy: 'Chordata:Mammalia:Proboscidea:Elephantidae'
  },
  {
    id: 'animal_4',
    name: 'Midnight',
    species: 'Horse',
    breed: 'Arabian',
    age: 7,
    color: 'Black',
    weight: 450,
    userId: 'user_3',
    imageUrl: 'https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-01'),
    medicalHistory: ['Vaccinated', 'Dental check'],
    createdAt: new Date('2019-11-12'),
    taxonomy: 'Chordata:Mammalia:Perissodactyla:Equidae'
  },
  {
    id: 'animal_5',
    name: 'Max',
    species: 'Dog',
    breed: 'German Shepherd',
    age: 4,
    color: 'Black and Tan',
    weight: 35,
    userId: 'default_user',
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-15'),
    medicalHistory: ['Vaccinated', 'Hip dysplasia screening'],
    createdAt: new Date('2020-06-23'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_6',
    name: 'Luna',
    species: 'Cat',
    breed: 'Maine Coon',
    age: 2,
    color: 'Tabby',
    weight: 6.2,
    userId: 'default_user',
    imageUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-05'),
    medicalHistory: ['Vaccinated', 'Spayed'],
    createdAt: new Date('2021-09-17'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_7',
    name: 'Rocky',
    species: 'Parrot',
    breed: 'African Grey',
    age: 15,
    color: 'Grey',
    weight: 0.4,
    userId: 'user_3',
    imageUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-05-22'),
    medicalHistory: ['Annual checkup', 'Beak trim'],
    createdAt: new Date('2019-03-30'),
    taxonomy: 'Chordata:Aves:Psittaciformes:Psittacidae'
  },
  {
    id: 'animal_8',
    name: 'Charlie',
    species: 'Rabbit',
    breed: 'Holland Lop',
    age: 1,
    color: 'White',
    weight: 1.2,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-11'),
    medicalHistory: ['Vaccinated', 'Neutered'],
    createdAt: new Date('2022-04-10'),
    taxonomy: 'Chordata:Mammalia:Lagomorpha:Leporidae'
  },
  {
    id: 'animal_9',
    name: 'Simba',
    species: 'Lion',
    age: 5,
    color: 'Golden',
    weight: 190,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-30'),
    medicalHistory: ['Vaccinated', 'Dental examination'],
    createdAt: new Date('2020-02-14'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_10',
    name: 'Bella',
    species: 'Dog',
    breed: 'Beagle',
    age: 6,
    color: 'Tricolor',
    weight: 12,
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=400&q=80',
    status: 'recovering',
    lastCheckup: new Date('2025-08-05'),
    medicalHistory: ['Surgery - knee repair', 'Vaccinated'],
    createdAt: new Date('2018-11-03'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_11',
    name: 'Nemo',
    species: 'Fish',
    breed: 'Clownfish',
    age: 1,
    color: 'Orange and White',
    weight: 0.01,
    userId: 'default_user',
    imageUrl: 'https://images.unsplash.com/photo-1522720833375-9c27ffb02a5e?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-10'),
    medicalHistory: ['Water quality check'],
    createdAt: new Date('2022-09-01'),
    taxonomy: 'Chordata:Actinopterygii:Perciformes:Pomacentridae'
  },
  {
    id: 'animal_12',
    name: 'Spike',
    species: 'Hedgehog',
    age: 2,
    color: 'Brown',
    weight: 0.5,
    userId: 'user_3',
    imageUrl: 'https://images.unsplash.com/photo-1541494510502-7a132b230c9c?auto=format&fit=crop&w=400&q=80',
    status: 'sick',
    lastCheckup: new Date('2025-08-18'),
    medicalHistory: ['Respiratory infection treatment', 'Mite prevention'],
    createdAt: new Date('2021-07-20')
  },
  {
    id: 'animal_13',
    name: 'Zazu',
    species: 'Bird',
    breed: 'Hornbill',
    age: 3,
    color: 'Black and White',
    weight: 0.8,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-25'),
    medicalHistory: ['Annual checkup', 'Wing clipping'],
    createdAt: new Date('2021-01-15')
  },
  {
    id: 'animal_14',
    name: 'Marty',
    species: 'Zebra',
    age: 6,
    color: 'Black and White',
    weight: 350,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1526095179574-86e545346ae6?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-20'),
    medicalHistory: ['Vaccinated', 'Hoof trim'],
    createdAt: new Date('2019-04-12')
  },
  {
    id: 'animal_15',
    name: 'Snowball',
    species: 'Cat',
    breed: 'Persian',
    age: 4,
    color: 'White',
    weight: 4.8,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-30'),
    medicalHistory: ['Vaccinated', 'Dental cleaning'],
    createdAt: new Date('2020-10-10')
  },
  {
    id: 'animal_16',
    name: 'Caesar',
    species: 'Chimpanzee',
    age: 8,
    color: 'Black',
    weight: 70,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1544377472-75ea8c17decc?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-12'),
    medicalHistory: ['Annual health check', 'Dental examination'],
    createdAt: new Date('2020-05-15'),
    taxonomy: 'Chordata:Mammalia:Primates:Hominidae'
  },
  {
    id: 'animal_17',
    name: 'Maurice',
    species: 'Orangutan',
    age: 12,
    color: 'Reddish-brown',
    weight: 80,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1580638858755-e9fecf9d2bc6?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-22'),
    medicalHistory: ['Diet adjustment', 'Joint examination'],
    createdAt: new Date('2019-08-23'),
    taxonomy: 'Chordata:Mammalia:Primates:Hominidae'
  },
  {
    id: 'animal_18',
    name: 'George',
    species: 'Capuchin Monkey',
    age: 5,
    color: 'Brown and white',
    weight: 3.5,
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1563218151-d6c9132621de?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-05-30'),
    medicalHistory: ['Parasitic treatment', 'Vaccinated'],
    createdAt: new Date('2021-03-10'),
    taxonomy: 'Chordata:Mammalia:Primates:Cebidae'
  },
  {
    id: 'animal_19',
    name: 'Baloo',
    species: 'Grizzly Bear',
    age: 7,
    color: 'Brown',
    weight: 320,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-05'),
    medicalHistory: ['Annual check-up', 'Dental cleaning'],
    createdAt: new Date('2019-11-30'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Ursidae'
  },
  {
    id: 'animal_20',
    name: 'Iceberg',
    species: 'Polar Bear',
    age: 9,
    color: 'White',
    weight: 450,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1553425300-8c56e9188a7e?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-01'),
    medicalHistory: ['Dietary supplement', 'Fur analysis'],
    createdAt: new Date('2018-12-15'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Ursidae'
  },
  {
    id: 'animal_21',
    name: 'Panda',
    species: 'Giant Panda',
    age: 5,
    color: 'Black and white',
    weight: 110,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1566054757965-8c4085344c96?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-15'),
    medicalHistory: ['Bamboo diet evaluation', 'Weight monitoring'],
    createdAt: new Date('2020-01-20'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Ursidae'
  },
  {
    id: 'animal_22',
    name: 'Rex',
    species: 'German Shepherd',
    age: 4,
    color: 'Black and tan',
    weight: 40,
    userId: 'user_3',
    imageUrl: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-25'),
    medicalHistory: ['Vaccinated', 'Neutered'],
    createdAt: new Date('2021-02-15'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_23',
    name: 'Lassie',
    species: 'Rough Collie',
    age: 6,
    color: 'Sable and white',
    weight: 27,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1541687536867-52ead2d1fc3d?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-10'),
    medicalHistory: ['Vaccinated', 'Dental cleaning'],
    createdAt: new Date('2020-03-05'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_24',
    name: 'Bluey',
    species: 'Australian Cattle Dog',
    age: 3,
    color: 'Blue mottled',
    weight: 18,
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1558583055-d7ac15ffa2a3?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-05'),
    medicalHistory: ['Vaccinated', 'Joint health assessment'],
    createdAt: new Date('2022-01-10'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
  },
  {
    id: 'animal_25',
    name: 'Emperor',
    species: 'Emperor Penguin',
    age: 12,
    color: 'Black and white with yellow',
    weight: 40,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-30'),
    medicalHistory: ['Feather condition check', 'Nutrition assessment'],
    createdAt: new Date('2019-05-25'),
    taxonomy: 'Chordata:Aves:Sphenisciformes:Spheniscidae'
  },
  {
    id: 'animal_26',
    name: 'Skipper',
    species: 'Adelie Penguin',
    age: 8,
    color: 'Black and white',
    weight: 5.5,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1598425237654-4fc758e50a93?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-20'),
    medicalHistory: ['Beak examination', 'Swimming assessment'],
    createdAt: new Date('2020-08-15'),
    taxonomy: 'Chordata:Aves:Sphenisciformes:Spheniscidae'
  },
  {
    id: 'animal_27',
    name: 'Rico',
    species: 'Rockhopper Penguin',
    age: 6,
    color: 'Black and white with yellow crest',
    weight: 2.5,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1568263356942-db8995bd0882?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-10'),
    medicalHistory: ['Foot health check', 'Vitamins supplement'],
    createdAt: new Date('2021-04-12'),
    taxonomy: 'Chordata:Aves:Sphenisciformes:Spheniscidae'
  },
  {
    id: 'animal_28',
    name: 'Mufasa',
    species: 'African Lion',
    age: 8,
    color: 'Golden',
    weight: 190,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-15'),
    medicalHistory: ['Vaccinated', 'Dental examination'],
    createdAt: new Date('2019-06-20'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_29',
    name: 'Nala',
    species: 'African Lioness',
    age: 7,
    color: 'Tawny',
    weight: 130,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1545137419-a00bea39618e?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-15'),
    medicalHistory: ['Reproductive health check', 'Joint examination'],
    createdAt: new Date('2019-06-25'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_30',
    name: 'Rajah',
    species: 'Bengal Tiger',
    age: 6,
    color: 'Orange with black stripes',
    weight: 220,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-05'),
    medicalHistory: ['Dietary assessment', 'Muscle condition check'],
    createdAt: new Date('2020-04-10'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_31',
    name: 'Shere Khan',
    species: 'Siberian Tiger',
    age: 9,
    color: 'Light orange with dark stripes',
    weight: 320,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1615963244664-5b845b2025ee?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-05-25'),
    medicalHistory: ['Fur condition evaluation', 'Cold weather adaptation assessment'],
    createdAt: new Date('2018-09-15'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_32',
    name: 'Bagheera',
    species: 'Black Jaguar',
    age: 5,
    color: 'Black',
    weight: 100,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1604848648460-f44d10193927?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-08'),
    medicalHistory: ['Dental check', 'Vision assessment'],
    createdAt: new Date('2021-01-05'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_33',
    name: 'Spots',
    species: 'Jaguar',
    age: 6,
    color: 'Golden with black rosettes',
    weight: 95,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1551972251-12070d63502a?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-18'),
    medicalHistory: ['Parasite prevention', 'Muscle tone evaluation'],
    createdAt: new Date('2020-03-28'),
    taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
  },
  {
    id: 'animal_34',
    name: 'Tantor',
    species: 'African Elephant',
    age: 25,
    color: 'Grey',
    weight: 5500,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1581852017103-68ac65514cf7?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-05-15'),
    medicalHistory: ['Tusk examination', 'Foot care'],
    createdAt: new Date('2017-07-10'),
    taxonomy: 'Chordata:Mammalia:Proboscidea:Elephantidae'
  },
  {
    id: 'animal_35',
    name: 'Hathi',
    species: 'Asian Elephant',
    age: 30,
    color: 'Grey',
    weight: 4200,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1503786472775-5000336a0e07?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-22'),
    medicalHistory: ['Joint supplement', 'Digestive health check'],
    createdAt: new Date('2016-11-15'),
    taxonomy: 'Chordata:Mammalia:Proboscidea:Elephantidae'
  },
  {
    id: 'animal_36',
    name: 'Marlin',
    species: 'Clownfish',
    age: 2,
    color: 'Orange with white stripes',
    weight: 0.01,
    userId: 'user_1',
    imageUrl: 'https://images.unsplash.com/photo-1576806021995-9f68eb39f10b?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-08-01'),
    medicalHistory: ['Water parameter check', 'Gill examination'],
    createdAt: new Date('2023-01-25'),
    taxonomy: 'Chordata:Actinopterygii:Perciformes:Pomacentridae'
  },
  {
    id: 'animal_37',
    name: 'Bruce',
    species: 'Great White Shark',
    age: 15,
    color: 'Grey and white',
    weight: 1100,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1560275619-4cc5fa59d3ae?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-12'),
    medicalHistory: ['Migration tracking', 'Teeth health assessment'],
    createdAt: new Date('2018-05-30'),
    taxonomy: 'Chordata:Chondrichthyes:Lamniformes:Lamnidae'
  },
  {
    id: 'animal_38',
    name: 'Flounder',
    species: 'Atlantic Salmon',
    age: 3,
    color: 'Silver with black spots',
    weight: 7,
    userId: 'user_2',
    imageUrl: 'https://images.unsplash.com/photo-1551428294-3fb13786e367?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-28'),
    medicalHistory: ['Scale analysis', 'Swimming pattern assessment'],
    createdAt: new Date('2022-02-15'),
    taxonomy: 'Chordata:Actinopterygii:Salmoniformes:Salmonidae'
  },
  {
    id: 'animal_39',
    name: 'Bubbles',
    species: 'Bottlenose Dolphin',
    age: 12,
    color: 'Grey',
    weight: 300,
    userId: 'default_admin',
    imageUrl: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-07-05'),
    medicalHistory: ['Echolocation test', 'Skin condition evaluation'],
    createdAt: new Date('2019-04-18'),
    taxonomy: 'Chordata:Mammalia:Cetacea:Delphinidae'
  },
  {
    id: 'animal_40',
    name: 'Kaa',
    species: 'Python',
    age: 8,
    color: 'Brown and tan patterns',
    weight: 35,
    userId: 'user_3',
    imageUrl: 'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=400&q=80',
    status: 'healthy',
    lastCheckup: new Date('2025-06-15'),
    medicalHistory: ['Scale health check', 'Parasite screening'],
    createdAt: new Date('2020-10-12'),
    taxonomy: 'Chordata:Reptilia:Squamata:Pythonidae'
  }
];

const MOCK_DETECTIONS: Detection[] = [
  {
    id: 'detection_1',
    userId: 'user_1',
    animalId: 'animal_1',
    timestamp: new Date('2025-06-10T14:30:00.000Z'),
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    detections: [
      {
        class: 'cat',
        score: 0.97,
        bbox: [120, 80, 200, 180],
        taxonomy: 'Chordata:Mammalia:Carnivora:Felidae'
      }
    ],
    notes: 'Whiskers in the backyard',
    location: {
      latitude: 37.7749,
      longitude: -122.4194
    }
  },
  {
    id: 'detection_2',
    userId: 'user_1',
    animalId: 'animal_2',
    timestamp: new Date('2025-06-15T10:15:00.000Z'),
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    detections: [
      {
        class: 'dog',
        score: 0.95,
        bbox: [50, 30, 250, 220],
        taxonomy: 'Chordata:Mammalia:Carnivora:Canidae'
      }
    ],
    notes: 'Buddy playing in the park',
    location: {
      latitude: 37.7735,
      longitude: -122.4056
    }
  }
];

// Add to the mock data sections
const MOCK_REPORTS: DetectionReport[] = [
  {
    id: 'report_1',
    userId: 'user_1',
    timestamp: new Date('2025-06-10T14:35:00.000Z').toISOString(),
    imageSource: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    detectedAnimals: [
      { 
        type: 'cat', 
        confidence: 0.97, 
        isEndangered: false,
        details: {
          conservationStatus: 'Not Endangered',
          population: 'Stable',
          habitat: 'Domestic'
        }
      }
    ],
    summary: {
      totalAnimals: 1,
      endangeredCount: 0,
      highestConfidence: 0.97,
      averageConfidence: 0.97
    },
    environmentData: {
      browser: 'Chrome',
      screenResolution: '1920x1080',
      timeZone: 'America/Los_Angeles'
    },
    detectionMode: 'image'
  }
];

// Add this mock data array before the Database class definition
const MOCK_DIAGNOSES: AnimalDiagnosis[] = [
  {
    id: 'diag_1',
    userId: 'user_1',
    animalType: 'Dog',
    symptoms: 'Coughing and sneezing',
    diagnosis: 'Upper Respiratory Infection',
    date: '2025-03-15T10:30:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=500&q=80',
    recommendation: 'Rest, hydration, and antibiotics',
    severity: 'medium',
    followUpRecommended: true,
    createdAt: new Date('2025-03-15T10:30:00.000Z')
  },
  {
    id: 'diag_2',
    userId: 'user_2',
    animalType: 'Cat',
    symptoms: 'Scratching and skin irritation',
    diagnosis: 'Dermatitis',
    date: '2025-03-10T14:45:00.000Z',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
    recommendation: 'Anti-itch medication and allergen elimination',
    severity: 'low',
    followUpRecommended: false,
    createdAt: new Date('2025-03-10T14:45:00.000Z')
  }
];

// Add type definitions for mock database
type MockDatabase = {
  users: User[];
  animals: Animal[];
  detections: Detection[];
  reports: DetectionReport[];
};

// Initialize mock database with proper types
const mockDatabase: MockDatabase = {
  users: [
    {
      id: 'admin-1',
      name: 'System Admin',
      email: 'admin@wildlife.com',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  animals: [],
  detections: [],
  reports: []
};

export class Database {
  // User methods
  static async getUserByEmail(email: string) {
    const user = mockDatabase.users.find(u => u.email === email);
    if (!user) return null;
    return { ...user, password: MOCK_CREDENTIALS.find(c => c.userId === user.id)?.password };
  }

  static async verifyCredentials(email: string, password: string) {
    const credentials = MOCK_CREDENTIALS.find(c => c.email === email);
    return credentials?.password === password;
  }

  static async getAllUsers() {
    return mockDatabase.users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  static async createUser(userData: Partial<User>) {
    const newUser = {
      id: `user-${mockDatabase.users.length + 1}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
    mockDatabase.users.push(newUser);
    if (userData.password) {
      MOCK_CREDENTIALS.push({
        userId: newUser.id,
        email: newUser.email,
        password: userData.password
      });
    }
    return newUser;
  }

  // Animal methods
  static async getAnimals() {
    return mockDatabase.animals;
  }

  static async getAnimalById(id: string) {
    return mockDatabase.animals.find(animal => animal.id === id) || null;
  }

  static async createAnimal(animalData: Partial<Animal>) {
    const newAnimal = {
      id: `animal-${mockDatabase.animals.length + 1}`,
      ...animalData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Animal;
    mockDatabase.animals.push(newAnimal);
    return newAnimal;
  }

  static async deleteAnimal(id: string) {
    const index = mockDatabase.animals.findIndex(animal => animal.id === id);
    if (index !== -1) {
      mockDatabase.animals.splice(index, 1);
      return true;
    }
    return false;
  }

  // Detection methods
  static async createDetection(detectionData: Partial<Detection>) {
    const newDetection = {
      id: `detection-${mockDatabase.detections.length + 1}`,
      ...detectionData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Detection;
    mockDatabase.detections.push(newDetection);
    return newDetection;
  }

  static async getDetectionsByUserId(userId: string) {
    return mockDatabase.detections.filter(detection => detection.userId === userId);
  }

  // Report methods
  static async createReport(reportData: Partial<DetectionReport>) {
    const newReport = {
      id: `report-${mockDatabase.reports.length + 1}`,
      ...reportData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as DetectionReport;
    mockDatabase.reports.push(newReport);
    return newReport;
  }

  static async getReportsByUserId(userId: string) {
    return mockDatabase.reports.filter(report => report.userId === userId);
  }

  // Add missing method for animal detections
  static async getDetectionsByAnimalId(animalId: string) {
    return mockDatabase.detections.filter(detection => detection.animalId === animalId);
  }

  // Add missing method for detection reports
  static async getDetectionReports(userId: string) {
    return mockDatabase.reports.filter(report => report.userId === userId);
  }

  // Diagnosis methods
  static async logDiagnosis(diagnosisData: Partial<Diagnosis>): Promise<Diagnosis> {
    const newDiagnosis = {
      id: `diagnosis-${Date.now()}`,
      ...diagnosisData,
      createdAt: new Date()
    } as Diagnosis;
    
    // In a real app, this would be saved to a database
    // For now, we'll just return the diagnosis object
    return newDiagnosis;
  }

  static async getDetectionReportById(id: string): Promise<DetectionReport | null> {
    const userId = 'default_user'; // Replace with the appropriate userId
    const reports = await this.getDetectionReports(userId); // Pass userId as an argument
    return reports.find((report) => report.id === id) || null;
  }

  static async saveDetectionReport(report: DetectionReport): Promise<void> {
    // Replace this with actual SQL database logic
    console.log('Saving report to database:', report);
    // Example: Use an API call or database client to save the report
  }
}