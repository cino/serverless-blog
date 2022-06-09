import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  console.log(event);

  return {
    statusCode: 200,
    body: JSON.stringify({
      status: 'success',
      data: 'Function',
    }),
  };
}
