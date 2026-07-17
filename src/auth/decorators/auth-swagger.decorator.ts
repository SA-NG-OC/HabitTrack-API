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
          statusCode: { type: 'number', example: 201 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
            },
          },
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
      description: 'Login successful, returns user details and access token.',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  _id: { type: 'string', example: '60d0fe4f5311236168a109ca' },
                  email: { type: 'string', example: 'user@example.com' },
                  name: { type: 'string', example: 'John Doe' },
                  createdAt: { type: 'string', example: '2026-07-17T02:34:36.000Z' },
                  updatedAt: { type: 'string', example: '2026-07-17T02:34:36.000Z' },
                },
              },
              accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
            },
          },
        },
      },
    }),
    ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials.' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' }),
  );
}
