import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckIn, CheckInSchema } from './schemas/checkin.schema';
import { CheckInsService } from './checkins.service';
import { CheckInsController } from './checkins.controller';
import { HabitsModule } from '../habits/habits.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CheckIn.name, schema: CheckInSchema }]),
    HabitsModule,
  ],
  controllers: [CheckInsController],
  providers: [CheckInsService],
  exports: [CheckInsService],
})
export class CheckInsModule {}
