import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetHabitByIdDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific habit by ID (must be owned by the user)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Habit retrieved successfully.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '60d0fe4f5311236168a109cb' },
              userId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
              title: { type: 'string', example: 'Drink 2L Water' },
              description: { type: 'string', example: 'Track water intake during the day' },
              category: { type: 'string', example: 'health' },
              frequency: { type: 'string', example: 'daily' },
              color: { type: 'string', example: '#4F46E5' },
              archived: { type: 'boolean', example: false },
              stats: {
                type: 'object',
                properties: {
                  currentStreak: { type: 'number', example: 2 },
                  longestStreak: { type: 'number', example: 5 },
                  lastCheckInDate: { type: 'string', example: '2026-07-16' },
                },
              },
              createdAt: { type: 'string', example: '2026-07-15T02:00:00.000Z' },
              updatedAt: { type: 'string', example: '2026-07-16T18:30:00.000Z' },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token.' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found or unauthorized.' }),
  );
}
