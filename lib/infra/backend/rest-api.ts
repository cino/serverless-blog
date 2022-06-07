import { Construct } from 'constructs';
import { EndpointType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Tags } from 'aws-cdk-lib';

export class BackEndRestApi extends Construct {
  // api: RestApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    console.log(id);
    // this.api = new RestApi(this, 'teamsApi', {
    //   restApiName: 'Serverless Blog API',
    //   description: 'Back-end API to manage content',
    //   endpointConfiguration: {
    //     types: [
    //       EndpointType.REGIONAL, // todo: Customizable
    //     ],
    //   },
    // });
    // Tags.of(this.api).add('cdkTesting', 'backendRestApi');
  }
}
