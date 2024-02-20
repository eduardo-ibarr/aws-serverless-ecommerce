import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

export class ProductsAppStack extends Stack {
  readonly productsFetchHandler: NodejsFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
        bundling: {
          minify: true,
          sourceMap: false,
        },
      }
    );
  }
}
