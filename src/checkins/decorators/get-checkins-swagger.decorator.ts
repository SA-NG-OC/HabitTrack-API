import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiGetCheckInsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Retrieve check-in history for a specific habit' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Check-in history retrieved successfully.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '60d0fe4f5311236168a109cd' },
                habitId: { type: 'string', example: '60d0fe4f5311236168a109cb' },
                userId: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                date: { type: 'string', example: '2026-07-17' },
                note: { type: 'string', example: 'Completed morning routine!' },
                createdAt: { type: 'string', example: '2026-07-17T04:15:00.000Z' },
                updatedAt: { type: 'string', example: '2026-07-17T04:15:00.000Z' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token.' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found or unauthorized.' }),
  );
}
