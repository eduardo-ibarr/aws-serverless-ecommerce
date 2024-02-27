import { Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class ProductsAppLayersStack extends Stack {
  readonly productsLayer: LayerVersion;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.productsLayer = new LayerVersion(this, "ProductsLayer", {
      code: Code.fromAsset("lambda/products/layers/products-layer"),
      compatibleRuntimes: [Runtime.NODEJS_20_X],
      layerVersionName: "ProductsLayer",
      removalPolicy: RemovalPolicy.RETAIN,
    });

    new StringParameter(this, "ProductsLayerVersionArn", {
      parameterName: "ProductsLayerVersionArn",
      stringValue: this.productsLayer.layerVersionArn,
    });
  }
}
