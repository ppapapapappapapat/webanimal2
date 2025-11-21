import { NextResponse } from 'next/server';
import { prisma } from '../../../database/client';
import { Detection } from '../../../database/database';

export async function GET() {
  try {
    const detections = await prisma.detection.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        animal: true,
        user: true
      }
    });
    
    return NextResponse.json(detections);
  } catch (error) {
    console.error('Error fetching detections:', error);
    return NextResponse.json({ error: 'Failed to fetch detections' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const detection = await prisma.detection.create({
      data: {
        userId: data.userId,
        animalId: data.animalId,
        location: data.location,
        timestamp: new Date(),
        confidence: data.confidence,
        imageUrl: data.imageUrl,
        status: data.status,
        animal: {
          connect: { id: data.animalId }
        },
        user: {
          connect: { id: data.userId }
        }
      }
    });

    // Send real-time update to WebSocket clients
    const wsClients = new Set<WebSocket>();
    wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'new_detection',
          detection
        }));
      }
    });

    return NextResponse.json(detection);
  } catch (error) {
    console.error('Error creating detection:', error);
    return NextResponse.json({ error: 'Failed to create detection' }, { status: 500 });
  }
}
