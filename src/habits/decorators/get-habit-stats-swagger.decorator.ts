import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetHabitStatsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get aggregated statistics for a specific habit' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Habit statistics retrieved successfully.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              habitId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
              currentStreak: { type: 'number', example: 3 },
              longestStreak: { type: 'number', example: 7 },
              completionRateLast30Days: { type: 'number', example: 0.5 },
              totalCheckIns: { type: 'number', example: 15 },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token.' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found or unauthorized.' }),
  );
}
