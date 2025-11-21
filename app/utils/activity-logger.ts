export async function logActivity(
    userId: number,
    action: 'login' | 'create' | 'update' | 'delete' | 'detection',
    target: string,
    details?: any
) {
    try {
        const response = await fetch('/api/activity-logs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                action,
                target,
                details,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to log activity');
        }

        return await response.json();
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw the error - we don't want to break the application flow
        // if activity logging fails
        return null;
    }
}

// Helper function to format details for common actions
export const formatActivityDetails = {
    login: (username: string) => ({
        username,
        timestamp: new Date().toISOString(),
    }),
    
    create: (resourceType: string, resourceName: string, additionalInfo?: any) => ({
        type: resourceType,
        name: resourceName,
        ...additionalInfo,
        timestamp: new Date().toISOString(),
    }),
    
    update: (resourceType: string, resourceName: string, changes: any) => ({
        type: resourceType,
        name: resourceName,
        changes,
        timestamp: new Date().toISOString(),
    }),
    
    delete: (resourceType: string, resourceName: string) => ({
        type: resourceType,
        name: resourceName,
        timestamp: new Date().toISOString(),
    }),
    
    detection: (animalType: string, confidence: number, location?: string) => ({
        animalType,
        confidence,
        location,
        timestamp: new Date().toISOString(),
    }),
}; 