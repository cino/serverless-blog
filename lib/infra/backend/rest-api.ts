import { Construct } from 'constructs';
import { EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Tags } from 'aws-cdk-lib';
import createContentApi from './rest-api/content';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import createMenuApi from './rest-api/menus';
import createAuthorsApi from './rest-api/authors';
import createTagsApi from './rest-api/tags';
import createSettingsApi from './rest-api/settings';

interface BackendRestApiProps {
  dynamoDb: Table,
}

export class BackEndRestApi extends Construct {
  api: RestApi;

  constructor(scope: Construct, id: string, props: BackendRestApiProps) {
    super(scope, id);

    this.api = new RestApi(this, 'blogApi', {
      restApiName: 'Serverless Blog API',
      description: 'Back-end API to manage content',

      endpointConfiguration: {
        types: [
          EndpointType.REGIONAL, // todo: Customizable
        ],
      },

      defaultCorsPreflightOptions: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowCredentials: true,
        allowOrigins: ['<origin>'],
      },
    });
    Tags.of(this.api).add('cdkTesting', 'backendRestApi');

    createAuthorsApi(this, props.dynamoDb);
    createContentApi(this, props.dynamoDb);
    createMenuApi(this, props.dynamoDb);
    createSettingsApi(this, props.dynamoDb);
    createTagsApi(this, props.dynamoDb);
  }
}
