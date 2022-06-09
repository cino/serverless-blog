import { Tags } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaFunction } from '../../lamdba/main';
import { BackEndRestApi } from '../rest-api';

export default function createContentApi(
  scope: BackEndRestApi,
  dynamoDb: Table,
): void {
  const listFunction = new LambdaFunction(scope, 'listContent', {
    sourceDirectory: '../../../dist/content/list',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const postFunction = new LambdaFunction(scope, 'postContent', {
    sourceDirectory: '../../../dist/content/post',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const getFunction = new LambdaFunction(scope, 'getContent', {
    sourceDirectory: '../../../dist/content/get',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const putFunction = new LambdaFunction(scope, 'putContent', {
    sourceDirectory: '../../../dist/content/put',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const deleteFunction = new LambdaFunction(scope, 'deleteContent', {
    sourceDirectory: '../../../dist/content/delete',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const items = scope.api.root.addResource('content');
  items.addMethod('GET', new LambdaIntegration(listFunction));
  items.addMethod('POST', new LambdaIntegration(postFunction));
  Tags.of(items).add('cdkTesting', 'backendRestApiContent');

  const singleItem = items.addResource('{id}');
  singleItem.addMethod('GET', new LambdaIntegration(getFunction));
  singleItem.addMethod('PUT', new LambdaIntegration(putFunction));
  singleItem.addMethod('DELETE', new LambdaIntegration(deleteFunction));
}
