import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CheckInDocument = CheckIn & Document;

@Schema({ timestamps: true })
export class CheckIn {
  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habitId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  date!: string;

  @Prop({ trim: true, maxlength: 280, default: '' })
  note!: string;
}

export const CheckInSchema = SchemaFactory.createForClass(CheckIn);

// Unique check-in per habit per day
CheckInSchema.index({ habitId: 1, date: 1 }, { unique: true });
// Optimize retrieval sorted by date desc for streak calculation
CheckInSchema.index({ habitId: 1, date: -1 });
