import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiRegisterDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User registered successfully, returns access token.',
      schema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email already registered.' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
  );
}

export function ApiLoginDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Log in an existing user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login successful, returns access token.',
      schema: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
  );
}
