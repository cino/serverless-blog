import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { BackEndDatabase } from './backend/dynamodb';
import { BackEndRestApi } from './backend/rest-api';

export class ServerlessBlogApi extends Construct {
  api: RestApi;

  table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Absolute basics to make the application work.
    this.table = new BackEndDatabase(this, 'Database').table;
    this.api = new BackEndRestApi(this, 'RestApi', {
      dynamoDb: this.table,
    }).api;
  }
}
