import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiCreateHabitDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new habit for the authenticated user' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Habit created successfully.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 201 },
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
                  currentStreak: { type: 'number', example: 0 },
                  longestStreak: { type: 'number', example: 0 },
                  lastCheckInDate: { type: 'string', nullable: true, example: null },
                },
              },
              createdAt: { type: 'string', example: '2026-07-17T03:47:32.000Z' },
              updatedAt: { type: 'string', example: '2026-07-17T03:47:32.000Z' },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token.' }),
  );
}
