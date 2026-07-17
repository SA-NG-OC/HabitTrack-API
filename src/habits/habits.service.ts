import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit, HabitDocument } from './schemas/habit.schema';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private readonly habitModel: Model<HabitDocument>,
  ) {}

  async create(userId: string, dto: CreateHabitDto): Promise<HabitDocument> {
    const createdHabit = new this.habitModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
    return createdHabit.save();
  }

  async findAll(userId: string): Promise<HabitDocument[]> {
    return this.habitModel
      .find({ userId: new Types.ObjectId(userId), archived: false })
      .exec();
  }

  async findOne(userId: string, id: string): Promise<HabitDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Habit not found');
    }

    const habit = await this.habitModel
      .findOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
      .exec();

    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }

  async update(userId: string, id: string, dto: UpdateHabitDto): Promise<HabitDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Habit not found');
    }

    const habit = await this.findOne(userId, id);

    Object.assign(habit, dto);
    return habit.save();
  }

  async remove(userId: string, id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Habit not found');
    }

    const result = await this.habitModel
      .deleteOne({ _id: new Types.ObjectId(id), userId: new Types.ObjectId(userId) })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Habit not found');
    }
  }
}
