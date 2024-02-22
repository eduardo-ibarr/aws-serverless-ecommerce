import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const {
    httpMethod,
    resource,
    pathParameters,
    requestContext: { requestId: apiRequestId },
  } = event;

  const { awsRequestId: lambdaRequestId } = context;

  console.log({ apiRequestId, lambdaRequestId });

  if (resource === "/products") {
    if (httpMethod === "GET") {
      console.log(`${httpMethod} - ${resource}`);

      return {
        body: JSON.stringify({ message: `${httpMethod} - ${resource}` }),
        statusCode: 200,
      };
    }
  } else if (resource === "/products/{id}") {
    console.log(`${httpMethod} - ${resource}`);

    return {
      body: JSON.stringify({
        message: `${httpMethod} - ${resource}`,
      }),
      statusCode: 200,
    };
  }

  return {
    body: JSON.stringify({ message: "Resource not found." }),
    statusCode: 400,
  };
}
