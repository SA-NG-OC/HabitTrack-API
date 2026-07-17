import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiDeleteHabitDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a habit by ID (must be owned by the user)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Habit deleted successfully.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object', nullable: true, example: null },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Missing or invalid token.' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit not found or unauthorized.' }),
  );
}
