import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { Product, ProductsRepository } from "/opt/nodejs/products-layer";
import { DynamoDB } from "aws-sdk";

const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
const dynamoDBClient = new DynamoDB.DocumentClient();

const productsRepository = new ProductsRepository(
  dynamoDBClient,
  productsTableName
);

type Resources = "/products" | "/products/{id}";
type Methods = "POST" | "PUT" | "DELETE";

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
      POST: async (): Promise<APIGatewayProxyResult> => {
        const product = <Product>JSON.parse(event.body!);
        const response = await productsRepository.store(product);

        return {
          body: JSON.stringify(response),
          statusCode: 200,
        };
      },
    },
    "/products/{id}": {
      PUT: async (): Promise<APIGatewayProxyResult> => {
        const id = <string>pathParameters!.id;

        try {
          const product = <Product>JSON.parse(event.body!);
          const response = await productsRepository.update(id, product);

          return {
            body: JSON.stringify(response),
            statusCode: 200,
          };
        } catch (ConditionalCheckFailedException) {
          return {
            body: "Product not found",
            statusCode: 404,
          };
        }
      },
      DELETE: async (): Promise<APIGatewayProxyResult> => {
        const id = <string>pathParameters!.id;

        try {
          const product = productsRepository.delete(id);

          return {
            body: JSON.stringify(product),
            statusCode: 200,
          };
        } catch (error) {
          console.error((<Error>error).message);

          return {
            body: (<Error>error).message,
            statusCode: 404,
          };
        }
      },
    },
  };

  if (!(resource in operations)) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Resource not found" }),
    };
  }

  const resourceMethods = operations[<Resources>resource];

  if (!resourceMethods) {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Methods not allowed for this resource",
      }),
    };
  }

  const methodHandler = resourceMethods[<Methods>httpMethod];

  if (!methodHandler) {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method  not allowed for this resource",
      }),
    };
  }

  return methodHandler();
}
