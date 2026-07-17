import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Habit, HabitSchema } from './schemas/habit.schema';
import { HabitsService } from './habits.service';
import { HabitsController } from './habits.controller';
import { StatsService } from './stats.service';
import { CheckIn, CheckInSchema } from '../checkins/schemas/checkin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: CheckIn.name, schema: CheckInSchema },
    ]),
  ],
  controllers: [HabitsController],
  providers: [HabitsService, StatsService],
  exports: [HabitsService, StatsService],
})
export class HabitsModule {}
