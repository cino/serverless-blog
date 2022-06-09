import { Tags } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaFunction } from '../../lamdba/main';
import { BackEndRestApi } from '../rest-api';

export default function createSettingsApi(
  scope: BackEndRestApi,
  dynamoDb: Table,
): void {
  const listFunction = new LambdaFunction(scope, 'listSettings', {
    sourceDirectory: '../../../dist/settings/list',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const postFunction = new LambdaFunction(scope, 'postSettings', {
    sourceDirectory: '../../../dist/settings/post',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const getFunction = new LambdaFunction(scope, 'getSetting', {
    sourceDirectory: '../../../dist/settings/get',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const putFunction = new LambdaFunction(scope, 'putSetting', {
    sourceDirectory: '../../../dist/settings/put',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const deleteFunction = new LambdaFunction(scope, 'deleteSetting', {
    sourceDirectory: '../../../dist/settings/delete',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const items = scope.api.root.addResource('settings');
  items.addMethod('GET', new LambdaIntegration(listFunction));
  items.addMethod('POST', new LambdaIntegration(postFunction));
  Tags.of(items).add('cdkTesting', 'backendRestApiSettings');

  const singleItem = items.addResource('{id}');
  singleItem.addMethod('GET', new LambdaIntegration(getFunction));
  singleItem.addMethod('PUT', new LambdaIntegration(putFunction));
  singleItem.addMethod('DELETE', new LambdaIntegration(deleteFunction));
}
