import { Tags } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaFunction } from '../../lamdba/main';
import { BackEndRestApi } from '../rest-api';

export default function createMenuApi(
  scope: BackEndRestApi,
  dynamoDb: Table,
): void {
  const listFunction = new LambdaFunction(scope, 'listMenu', {
    sourceDirectory: '../../../dist/menus/list',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const postFunction = new LambdaFunction(scope, 'postMenu', {
    sourceDirectory: '../../../dist/menus/post',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const getFunction = new LambdaFunction(scope, 'getMenu', {
    sourceDirectory: '../../../dist/menus/get',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const putFunction = new LambdaFunction(scope, 'putMenu', {
    sourceDirectory: '../../../dist/menus/put',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const deleteFunction = new LambdaFunction(scope, 'deleteMenu', {
    sourceDirectory: '../../../dist/menus/delete',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const items = scope.api.root.addResource('menus');
  items.addMethod('GET', new LambdaIntegration(listFunction));
  items.addMethod('POST', new LambdaIntegration(postFunction));
  Tags.of(items).add('cdkTesting', 'backendRestApiMenus');

  const singleItem = items.addResource('{id}');
  singleItem.addMethod('GET', new LambdaIntegration(getFunction));
  singleItem.addMethod('PUT', new LambdaIntegration(putFunction));
  singleItem.addMethod('DELETE', new LambdaIntegration(deleteFunction));
}
