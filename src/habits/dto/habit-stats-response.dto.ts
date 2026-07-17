import { ApiProperty } from '@nestjs/swagger';

export class HabitStatsResponse {
  @ApiProperty({
    description: 'The ID of the habit',
    example: '60d0fe4f5311236168a109cb',
  })
  habitId!: string;

  @ApiProperty({
    description: 'The current active streak (consecutive days)',
    example: 3,
  })
  currentStreak!: number;

  @ApiProperty({
    description: 'The longest historical streak achieved',
    example: 7,
  })
  longestStreak!: number;

  @ApiProperty({
    description: 'The completion rate over the last 30 days (0 to 1)',
    example: 0.5,
  })
  completionRateLast30Days!: number;

  @ApiProperty({
    description: 'Total number of check-ins for the habit',
    example: 15,
  })
  totalCheckIns!: number;
}
