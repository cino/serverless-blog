import { Tags } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaFunction } from '../../lamdba/main';
import { BackEndRestApi } from '../rest-api';

export default function createTagsApi(
  scope: BackEndRestApi,
  dynamoDb: Table,
): void {
  const listFunction = new LambdaFunction(scope, 'listTags', {
    sourceDirectory: '../../../dist/tags/list',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const postFunction = new LambdaFunction(scope, 'postTags', {
    sourceDirectory: '../../../dist/tags/post',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const getFunction = new LambdaFunction(scope, 'getTag', {
    sourceDirectory: '../../../dist/tags/get',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const putFunction = new LambdaFunction(scope, 'putTag', {
    sourceDirectory: '../../../dist/tags/put',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const deleteFunction = new LambdaFunction(scope, 'deleteTag', {
    sourceDirectory: '../../../dist/tags/delete',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const items = scope.api.root.addResource('tags');
  items.addMethod('GET', new LambdaIntegration(listFunction));
  items.addMethod('POST', new LambdaIntegration(postFunction));
  Tags.of(items).add('cdkTesting', 'backendRestApiTags');

  const singleItem = items.addResource('{id}');
  singleItem.addMethod('GET', new LambdaIntegration(getFunction));
  singleItem.addMethod('PUT', new LambdaIntegration(putFunction));
  singleItem.addMethod('DELETE', new LambdaIntegration(deleteFunction));
}
