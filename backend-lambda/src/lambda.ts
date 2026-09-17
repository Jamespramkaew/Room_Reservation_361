import { Context as LambdaContext, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import app from './index';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * AWS Lambda Handler
 * แปลง API Gateway Event → Hono Request → Hono Response → API Gateway Response
 */
export const handler = async (
  event: APIGatewayProxyEvent,
  context: LambdaContext
): Promise<APIGatewayProxyResult> => {
  // Lambda optimization: reuse connections
  context.callbackWaitsForEmptyEventLoop = false;
  
  const startTime = Date.now();
  
  console.log('Lambda invoked:', {
    path: event.path,
    method: event.httpMethod,
    requestId: context.requestId,
    sourceIp: event.requestContext?.identity?.sourceIp,
  });

  try {
    // สร้าง URL จาก API Gateway event
    const url = new URL(event.path, `https://${event.headers.host || 'localhost'}`);
    
    // เพิ่ม query parameters
    if (event.queryStringParameters) {
      Object.entries(event.queryStringParameters).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });
    }

    // สร้าง Request object
    const request = new Request(url.toString(), {
      method: event.httpMethod,
      headers: new Headers(event.headers as Record<string, string>),
      body: event.body ? event.body : undefined,
    });

    // เรียก Hono app
    const response = await app.fetch(request);

    // แปลง Response กลับเป็น API Gateway format
    const responseBody = await response.text();
    const headers: Record<string, string> = {};
    
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const duration = Date.now() - startTime;
    console.log('Lambda completed:', {
      statusCode: response.status,
      duration: `${duration}ms`,
      requestId: context.requestId,
    });

    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'X-Request-Id': context.requestId,
      },
      body: responseBody,
      isBase64Encoded: false,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Lambda error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      requestId: context.requestId,
    });
    
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json',
        'X-Request-Id': context.requestId,
      },
      body: JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      isBase64Encoded: false,
    };
  }
};
