import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import { mockUsers, mockAnimals, mockDetections } from './mock-data';

export async function GET() {
  try {
    console.log('Starting seed operation...');
    
    // Check if data already exists
    const existingUsers = await prisma.user.count();
    console.log(`Existing users: ${existingUsers}`);
    
    if (existingUsers > 0) {
      console.log('Database already has data. Seed operation canceled.');
      return NextResponse.json(
        { error: 'Database already has data. Seed operation canceled.' },
        { status: 400 }
      );
    }

    console.log(`Ready to seed ${mockUsers.length} users, ${mockAnimals.length} animals, ${mockDetections.length} detections`);

    // Seed users
    console.log('Seeding users...');
    for (const user of mockUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: hashedPassword,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: new Date()
        }
      });
    }
    console.log('Users seeded successfully');

    // Seed animals
    console.log('Seeding animals...');
    for (const animal of mockAnimals) {
      await prisma.animal.create({
        data: {
          id: animal.id,
          name: animal.name,
          species: animal.species,
          gender: animal.gender,
          age: animal.age,
          weight: animal.weight,
          height: animal.height,
          health: animal.health,
          description: animal.description,
          imageUrl: animal.imageUrl,
          createdAt: animal.createdAt,
          updatedAt: new Date()
        }
      });
    }
    console.log('Animals seeded successfully');

    // Seed detections
    console.log('Seeding detections...');
    for (const detection of mockDetections) {
      await prisma.detection.create({
        data: {
          id: detection.id,
          userId: detection.userId,
          animalId: detection.animalId,
          location: detection.location,
          timestamp: detection.timestamp,
          confidence: detection.confidence,
          imageUrl: detection.imageUrl,
          notes: detection.notes,
          status: detection.status
        }
      });
    }
    console.log('Detections seeded successfully');

    console.log('Database seed completed successfully');
    return NextResponse.json({
      message: 'Database successfully seeded',
      users: mockUsers.length,
      animals: mockAnimals.length,
      detections: mockDetections.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 