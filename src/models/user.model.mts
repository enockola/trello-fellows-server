import mongodb from '../database/index.mts';
import type { User } from './types.mts';

export async function getUserByEmail(email: string): Promise<User | null> {
    try {
        const db = mongodb.getDb();
        const user = await db.collection<User>('users').findOne({ email: email });
        return user;
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Database query error occured while fetching user by email');
    }
}