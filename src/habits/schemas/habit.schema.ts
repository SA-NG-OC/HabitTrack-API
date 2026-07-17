import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HabitDocument = Habit & Document;

export enum HabitFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

@Schema({ _id: false })
export class HabitStats {
  @Prop({ default: 0 })
  currentStreak: number;

  @Prop({ default: 0 })
  longestStreak: number;

  @Prop({ type: String, default: null })
  lastCheckInDate: string | null;
}

@Schema({ timestamps: true })
export class Habit {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  title: string;

  @Prop({ trim: true, maxlength: 500, default: '' })
  description: string;

  @Prop({ trim: true, default: 'general' })
  category: string;

  @Prop({ type: String, enum: HabitFrequency, default: HabitFrequency.DAILY })
  frequency: HabitFrequency;

  @Prop({ default: '#4F46E5' })
  color: string;

  @Prop({ default: false })
  archived: boolean;

  @Prop({ type: HabitStats, default: () => ({}) })
  stats: HabitStats;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

HabitSchema.index({ userId: 1, archived: 1 });
HabitSchema.index({ userId: 1, createdAt: -1 });
