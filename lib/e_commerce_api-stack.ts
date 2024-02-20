import { Stack, StackProps } from "aws-cdk-lib";
import {
  RestApi,
  LambdaIntegration,
  LogGroupLogDestination,
  AccessLogFormat,
} from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

interface ECommerceApiStackProps extends StackProps {
  productsFetchHandler: NodejsFunction;
}

export class ECommerceApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, "ECommerceAPILogs");

    const api = new RestApi(this, "ECommerceAPI", {
      restApiName: "ECommerceAPI",
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      },
    });

    const productsFetchIntegration = new LambdaIntegration(
      props.productsFetchHandler
    );

    const productsResource = api.root.addResource("products");

    productsResource.addMethod("GET", productsFetchIntegration);
  }
}
