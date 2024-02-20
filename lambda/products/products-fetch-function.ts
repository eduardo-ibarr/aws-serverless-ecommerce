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
    requestContext: { requestId: apiRequestId },
  } = event;

  const { awsRequestId: lambdaRequestId } = context;

  console.log({ apiRequestId, lambdaRequestId });

  if (resource === "/products") {
    if (httpMethod === "GET") {
      console.log("GET");

      return {
        body: JSON.stringify({ message: "Hello World" }),
        statusCode: 200,
      };
    }
  }

  return {
    body: JSON.stringify({ message: "Resource not found." }),
    statusCode: 400,
  };
}
