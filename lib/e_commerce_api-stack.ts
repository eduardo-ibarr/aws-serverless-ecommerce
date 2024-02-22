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
  productsAdminHandler: NodejsFunction;
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

    const productsAdminIntegration = new LambdaIntegration(
      props.productsAdminHandler
    );

    const productsResource = api.root.addResource("products");

    const productIDResource = productsResource.addResource("{id}");

    productsResource.addMethod("GET", productsFetchIntegration);
    productsResource.addMethod("POST", productsAdminIntegration);

    productIDResource.addMethod("GET", productsFetchIntegration);
    productIDResource.addMethod("PUT", productsAdminIntegration);
    productIDResource.addMethod("DELETE", productsAdminIntegration);
  }
}
