import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCheckInDto {
  @ApiProperty({
    description: 'Date of the check-in in YYYY-MM-DD format',
    example: '2026-07-17',
  })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format',
  })
  date!: string;

  @ApiPropertyOptional({
    description: 'Optional note describing this check-in',
    example: 'Completed morning gym session!',
    maxLength: 280,
  })
  @IsString()
  @IsOptional()
  @MaxLength(280)
  note?: string;
}
