import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HabitStatsResponse } from './dto/habit-stats-response.dto';
import { HabitsService } from './habits.service';
import { CheckIn, CheckInDocument } from '../checkins/schemas/checkin.schema';
import { calculateStreaks } from '../checkins/utils/streak-calculator';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(CheckIn.name) private readonly checkinModel: Model<CheckInDocument>,
    private readonly habitsService: HabitsService,
  ) {}

  async getHabitStats(userId: string, habitId: string): Promise<HabitStatsResponse> {
    // 1. Verify habit ownership (throws 404 if not found or not owned)
    await this.habitsService.findOne(userId, habitId);

    // 2. Aggregate check-ins for the habit
    const result = await this.checkinModel
      .aggregate([
        { $match: { habitId: new Types.ObjectId(habitId) } },
        { $sort: { date: 1 } },
        {
          $group: {
            _id: '$habitId',
            dates: { $push: '$date' },
            total: { $sum: 1 },
          },
        },
      ])
      .exec();

    // 3. Handle boundary case of zero check-ins cleanly
    if (result.length === 0) {
      return {
        habitId,
        currentStreak: 0,
        longestStreak: 0,
        completionRateLast30Days: 0,
        totalCheckIns: 0,
      };
    }

    const dates: string[] = result[0].dates;
    const totalCheckIns: number = result[0].total;

    // 4. Calculate last 30 days completion rate
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');

    const earliestDate = new Date();
    earliestDate.setDate(today.getDate() - 29); // 30 days range inclusive of today
    const earliestStr = earliestDate.toLocaleDateString('en-CA');

    const last30Count = dates.filter((d) => d >= earliestStr && d <= todayStr).length;
    const completionRateLast30Days = parseFloat((last30Count / 30).toFixed(2));

    // 5. Calculate current and longest streaks using helper
    const streaks = calculateStreaks(dates, todayStr);

    return {
      habitId,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      completionRateLast30Days,
      totalCheckIns,
    };
  }
}
