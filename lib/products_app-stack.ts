import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

export class ProductsAppStack extends Stack {
  readonly productsFetchHandler: NodejsFunction;
  readonly productsAdminHandler: NodejsFunction;
  readonly productsDynamoDB: Table;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productsDynamoDB = new Table(this, "ProductsDynamoDB", {
      tableName: "Products",
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: BillingMode.PROVISIONED,
      readCapacity: 1, // readings per second
      writeCapacity: 1, // writings per second
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    this.productsFetchHandler = new NodejsFunction(
      this,
      "ProductsFetchFunction",
      {
        functionName: "ProductsFetchFunction",
        entry: "lambda/products/products-fetch-function.ts",
        handler: "handler",
        memorySize: 512,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(5),
        environment: {
          PRODUCTS_DYNAMODB: this.productsDynamoDB.tableName,
        },
        bundling: {
          minify: true,
          sourceMap: false,
        },
      }
    );

    this.productsDynamoDB.grantReadData(this.productsFetchHandler);

    this.productsAdminHandler = new NodejsFunction(
      this,
      "ProductsAdminFunction",
      {
        functionName: "ProductsAdminFunction",
        entry: "lambda/products/products-admin-function.ts",
        handler: "handler",
        memorySize: 512,
        runtime: Runtime.NODEJS_20_X,
        timeout: Duration.seconds(5),
        environment: {
          PRODUCTS_DYNAMODB: this.productsDynamoDB.tableName,
        },
        bundling: {
          minify: true,
          sourceMap: false,
        },
      }
    );

    this.productsDynamoDB.grantWriteData(this.productsAdminHandler);
  }
}
