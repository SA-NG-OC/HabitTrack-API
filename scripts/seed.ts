import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habittrack';

async function seed() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed: mongoose.connection.db is undefined.');
  }

  // Clean existing database
  console.log('Clearing database...');
  await db.dropDatabase();

  // Create Users
  console.log('Creating sample users...');
  const passwordHash = await bcrypt.hash('password123', 10);
  const user1Id = new mongoose.Types.ObjectId();
  const user2Id = new mongoose.Types.ObjectId();

  const users = [
    {
      _id: user1Id,
      email: 'john@example.com',
      passwordHash,
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: user2Id,
      email: 'jane@example.com',
      passwordHash,
      name: 'Jane Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await db.collection('users').insertMany(users);

  // Create Habits
  console.log('Creating sample habits...');
  const habit1Id = new mongoose.Types.ObjectId();
  const habit2Id = new mongoose.Types.ObjectId();
  const habit3Id = new mongoose.Types.ObjectId();

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString('en-CA');

  const habits = [
    {
      _id: habit1Id,
      userId: user1Id,
      title: 'Drink 3L Water',
      description: 'Stay hydrated throughout the day',
      category: 'health',
      frequency: 'daily',
      color: '#4F46E5',
      archived: false,
      stats: {
        currentStreak: 2,
        longestStreak: 2,
        lastCheckInDate: todayStr,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: habit2Id,
      userId: user1Id,
      title: 'Read Books',
      description: 'Read at least 10 pages of a book',
      category: 'general',
      frequency: 'daily',
      color: '#10B981',
      archived: false,
      stats: {
        currentStreak: 0,
        longestStreak: 0,
        lastCheckInDate: null,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: habit3Id,
      userId: user2Id,
      title: 'Weekly Gym Session',
      description: 'Work out at least once a week',
      category: 'health',
      frequency: 'weekly',
      color: '#EF4444',
      archived: false,
      stats: {
        currentStreak: 1,
        longestStreak: 1,
        lastCheckInDate: todayStr,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await db.collection('habits').insertMany(habits);

  // Create Check-ins
  console.log('Creating sample check-ins...');
  const checkins = [
    {
      habitId: habit1Id,
      userId: user1Id,
      date: yesterdayStr,
      note: 'Morning water goals met',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      habitId: habit1Id,
      userId: user1Id,
      date: todayStr,
      note: 'Felt very hydrated today',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      habitId: habit3Id,
      userId: user2Id,
      date: todayStr,
      note: 'Leg day workout completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await db.collection('checkins').insertMany(checkins);

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
