import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { HabitsService } from './habits.service';
import { StatsService } from './stats.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { ApiCreateHabitDocs } from './decorators/create-habit-swagger.decorator';
import { ApiGetHabitsDocs } from './decorators/get-habits-swagger.decorator';
import { ApiGetHabitByIdDocs } from './decorators/get-habit-by-id-swagger.decorator';
import { ApiUpdateHabitDocs } from './decorators/update-habit-swagger.decorator';
import { ApiDeleteHabitDocs } from './decorators/delete-habit-swagger.decorator';
import { ApiGetHabitStatsDocs } from './decorators/get-habit-stats-swagger.decorator';

@ApiTags('Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(
    private readonly habitsService: HabitsService,
    private readonly statsService: StatsService,
  ) {}

  @Post()
  @ApiCreateHabitDocs()
  async create(@CurrentUser() user: any, @Body() dto: CreateHabitDto) {
    return this.habitsService.create(user.id, dto);
  }

  @Get()
  @ApiGetHabitsDocs()
  async findAll(@CurrentUser() user: any) {
    return this.habitsService.findAll(user.id);
  }

  @Get(':id/stats')
  @ApiGetHabitStatsDocs()
  async getStats(@CurrentUser() user: any, @Param('id') id: string) {
    return this.statsService.getHabitStats(user.id, id);
  }

  @Get(':id')
  @ApiGetHabitByIdDocs()
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.habitsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiUpdateHabitDocs()
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteHabitDocs()
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.habitsService.remove(user.id, id);
  }
}
