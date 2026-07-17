import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateHabitDto } from './create-habit.dto';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
  @ApiPropertyOptional({
    description: 'Whether the habit is archived/hidden',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;
}
