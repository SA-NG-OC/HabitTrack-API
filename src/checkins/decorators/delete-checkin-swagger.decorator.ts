import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiDeleteCheckInDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Remove a logged check-in (recalculates streaks)' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Check-in removed successfully.',
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
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Habit or check-in not found or unauthorized.' }),
  );
}
