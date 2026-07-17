import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CheckIn, CheckInDocument } from './schemas/checkin.schema';
import { CreateCheckInDto } from './dto/create-checkin.dto';
import { HabitsService } from '../habits/habits.service';
import { calculateStreaks } from './utils/streak-calculator';

@Injectable()
export class CheckInsService {
  constructor(
    @InjectModel(CheckIn.name) private readonly checkinModel: Model<CheckInDocument>,
    private readonly habitsService: HabitsService,
  ) {}

  async create(userId: string, habitId: string, dto: CreateCheckInDto): Promise<CheckInDocument> {
    await this.habitsService.findOne(userId, habitId);

    let checkin: CheckInDocument;
    try {
      checkin = new this.checkinModel({
        habitId: new Types.ObjectId(habitId),
        userId: new Types.ObjectId(userId),
        date: dto.date,
        note: dto.note || '',
      });
      await checkin.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Already checked in on this date.');
      }
      throw error;
    }

    await this.recalculateStreakAndSave(userId, habitId);

    return checkin;
  }

  async findAll(userId: string, habitId: string): Promise<CheckInDocument[]> {
    await this.habitsService.findOne(userId, habitId);

    return this.checkinModel
      .find({ habitId: new Types.ObjectId(habitId) })
      .sort({ date: -1 })
      .exec();
  }

  async remove(userId: string, habitId: string, checkInId: string): Promise<void> {
    await this.habitsService.findOne(userId, habitId);

    if (!Types.ObjectId.isValid(checkInId)) {
      throw new NotFoundException('Check-in not found');
    }

    const result = await this.checkinModel
      .deleteOne({
        _id: new Types.ObjectId(checkInId),
        habitId: new Types.ObjectId(habitId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Check-in not found');
    }

    await this.recalculateStreakAndSave(userId, habitId);
  }

  private async recalculateStreakAndSave(userId: string, habitId: string): Promise<void> {
    const habit = await this.habitsService.findOne(userId, habitId);

    const checkins = await this.checkinModel
      .find({ habitId: new Types.ObjectId(habitId) })
      .sort({ date: -1 })
      .exec();

    const dates = checkins.map((c) => c.date);
    const today = new Date().toLocaleDateString('en-CA'); // Returns YYYY-MM-DD in local time

    const stats = calculateStreaks(dates, today);

    habit.stats = {
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      lastCheckInDate: stats.lastCheckInDate,
    };

    await habit.save();
  }
}
