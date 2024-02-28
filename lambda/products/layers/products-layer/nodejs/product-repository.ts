import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

export class ProductsRepository {
  private dynamoDBClient: DocumentClient;
  private productsTableName: string;

  constructor(dynamoDBClient: DocumentClient, productsTableName: string) {
    this.dynamoDBClient = dynamoDBClient;
    this.productsTableName = productsTableName;
  }

  public async list(): Promise<Product[]> {
    const { Items } = await this.dynamoDBClient
      .scan({
        TableName: this.productsTableName,
      })
      .promise();

    return <Product[]>Items;
  }

  public async show(id: string): Promise<Product> {
    const { Item } = await this.dynamoDBClient
      .get({
        Key: { id },
        TableName: this.productsTableName,
      })
      .promise();

    if (!Item) {
      throw new Error("Product not found");
    }

    return <Product>Item;
  }

  public async store(product: Product): Promise<Product> {
    product.id = uuid();

    await this.dynamoDBClient
      .put({
        TableName: this.productsTableName,
        Item: product,
      })
      .promise();

    return product;
  }

  public async delete(id: string): Promise<Product> {
    const { Attributes } = await this.dynamoDBClient
      .delete({
        Key: { id },
        TableName: this.productsTableName,
        ReturnValues: "ALL_OLD",
      })
      .promise();

    if (!Attributes) {
      throw new Error("Product not found");
    }

    return <Product>Attributes;
  }

  public async update(id: string, product: Product): Promise<Product> {
    const { Attributes } = await this.dynamoDBClient
      .update({
        Key: { id },
        TableName: this.productsTableName,
        ConditionExpression: "attribute_exists(id)",
        ReturnValues: "UPDATED_NEW",
        UpdateExpression:
          "set productName = :n, code = :c, price = :p, model = :m",
        ExpressionAttributeValues: {
          ":n": product.productName,
          ":c": product.code,
          ":p": product.price,
          ":m": product.model,
        },
      })
      .promise();

    if (!Attributes) {
      throw new Error("Product not found");
    }

    return <Product>Attributes;
  }
}
