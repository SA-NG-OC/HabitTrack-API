import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { HabitFrequency } from '../schemas/habit.schema';

export class CreateHabitDto {
  @ApiProperty({
    description: 'The title of the habit',
    example: 'Drink 2L Water',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the habit',
    example: 'Track water intake during the day',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Category of the habit',
    example: 'health',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    description: 'Frequency of the habit',
    enum: HabitFrequency,
    default: HabitFrequency.DAILY,
  })
  @IsEnum(HabitFrequency)
  @IsOptional()
  frequency?: HabitFrequency;

  @ApiPropertyOptional({
    description: 'Hex color code representing the habit in UI',
    example: '#4F46E5',
    default: '#4F46E5',
  })
  @IsString()
  @IsOptional()
  color?: string;
}
