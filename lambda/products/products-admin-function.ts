import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

type Resources = "/products" | "/products/{id}";
type Methods = "POST" | "PUT" | "GET" | "DELETE";

type Operations = {
  [key in Resources]: {
    [key in Methods]?: () => Promise<APIGatewayProxyResult>;
  };
};

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const { httpMethod, resource, pathParameters } = event;

  const operations: Operations = {
    "/products": {
      GET: async (): Promise<APIGatewayProxyResult> => {
        console.log(`${httpMethod} - ${resource}`);

        return {
          body: JSON.stringify({ message: `${httpMethod} - ${resource}` }),
          statusCode: 200,
        };
      },
      POST: async (): Promise<APIGatewayProxyResult> => {
        console.log(`${httpMethod} - ${resource}`);

        return {
          body: JSON.stringify({ message: `${httpMethod} - ${resource}` }),
          statusCode: 200,
        };
      },
    },
    "/products/{id}": {
      GET: async (): Promise<APIGatewayProxyResult> => {
        console.log(`${httpMethod} - ${resource}`);

        return {
          body: JSON.stringify({ message: `${httpMethod} - ${resource}` }),
          statusCode: 200,
        };
      },
      PUT: async (): Promise<APIGatewayProxyResult> => {
        console.log(`${httpMethod} - ${resource}`);

        return {
          body: JSON.stringify({ message: `${httpMethod} - ${resource}` }),
          statusCode: 200,
        };
      },
    },
  };

  if (!(resource in operations)) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Recurso não encontrado" }),
    };
  }

  const resourceMethods = operations[<Resources>resource];

  if (!resourceMethods) {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Métodos não permitidos para o recurso",
      }),
    };
  }

  const methodHandler = resourceMethods[<Methods>httpMethod];

  if (!methodHandler) {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método não permitido para o recurso" }),
    };
  }

  return methodHandler();
}
