import { Collection } from "mongodb";
import { getDb } from "../database/index.mts";

export interface User {
  _id?: string;
  email: string;
  password?: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
}

async function getCollection(): Promise<Collection<User>> {
  const db = await getDb();
  return db.collection<User>("users");
}

export const userModel = {
  async getUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection();
    return await collection.findOne({ email: email });
  },

  async createUser(user: User): Promise<any> {
    const collection = await getCollection();
    return await collection.insertOne(user);
  }
};
