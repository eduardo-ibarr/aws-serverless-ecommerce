#!/usr/bin/env node
import "source-map-support/register";
import { App, Environment } from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/products_app-stack";
import { ECommerceApiStack } from "../lib/e_commerce_api-stack";
import * as dotenv from "dotenv";
import { ProductsAppLayersStack } from "../lib/products_app_layers-stack";

dotenv.config();

const app = new App();

const env: Environment = {
  account: process.env.AWS_ACCOUNT_ID,
  region: process.env.AWS_REGION,
};

const tags = {
  cost: "ECommerce",
  team: "Eduardo Ibarr",
};

const productsAppLayerStack = new ProductsAppLayersStack(
  app,
  "ProductsAppLayer",
  {
    tags,
    env,
  }
);

const productsAppStack = new ProductsAppStack(app, "ProductsApp", {
  env,
  tags,
});

productsAppStack.addDependency(productsAppLayerStack);

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceAPI", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
});

eCommerceApiStack.addDependency(productsAppStack);
