import { Tags } from 'aws-cdk-lib';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LambdaFunction } from '../../lamdba/main';
import { BackEndRestApi } from '../rest-api';

export default function createAuthorsApi(
  scope: BackEndRestApi,
  dynamoDb: Table,
): void {
  const listFunction = new LambdaFunction(scope, 'listAuthors', {
    sourceDirectory: '../../../dist/authors/list',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const postFunction = new LambdaFunction(scope, 'postAuthors', {
    sourceDirectory: '../../../dist/authors/post',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const getFunction = new LambdaFunction(scope, 'getAuthor', {
    sourceDirectory: '../../../dist/authors/get',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const putFunction = new LambdaFunction(scope, 'putAuthor', {
    sourceDirectory: '../../../dist/authors/put',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const deleteFunction = new LambdaFunction(scope, 'deleteAuthor', {
    sourceDirectory: '../../../dist/authors/delete',
    envVariables: {
      TABLE_NAME: dynamoDb.tableName,
    },
  }).function;

  const items = scope.api.root.addResource('authors');
  items.addMethod('GET', new LambdaIntegration(listFunction));
  items.addMethod('POST', new LambdaIntegration(postFunction));
  Tags.of(items).add('cdkTesting', 'backendRestApiAuthors');

  const singleItem = items.addResource('{id}');
  singleItem.addMethod('GET', new LambdaIntegration(getFunction));
  singleItem.addMethod('PUT', new LambdaIntegration(putFunction));
  singleItem.addMethod('DELETE', new LambdaIntegration(deleteFunction));
}
