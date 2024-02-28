import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

import { ProductsRepository } from "/opt/nodejs/products-layer";
import { DynamoDB } from "aws-sdk";

const productsTableName = process.env.PRODUCTS_TABLE_NAME!;
const dynamoDBClient = new DynamoDB.DocumentClient();

const productsRepository = new ProductsRepository(
  dynamoDBClient,
  productsTableName
);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  const { httpMethod, resource, pathParameters } = event;

  if (resource === "/products") {
    if (httpMethod === "GET") {
      const products = await productsRepository.list();

      return {
        body: JSON.stringify(products),
        statusCode: 200,
      };
    }
  } else if (resource === "/products/{id}") {
    const id = <string>pathParameters!.id;

    try {
      const product = await productsRepository.show(id);

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
  }

  return {
    body: JSON.stringify({ message: "Resource not found." }),
    statusCode: 400,
  };
}
