import { Construct } from 'constructs';
import { ISource } from 'aws-cdk-lib/aws-s3-deployment';
import { ServerlessBlogApi } from './infra/api-struct';
import { ServerlessBlogAdmin } from './infra/admin-struct';
import { ServerlessBlogFront } from './infra/front-struct';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';

export interface ServerlessBlogProps {
  hostedZone?: IHostedZone,

  admin?: {
    /**
   * Alias to be configured on the CLoudFront distrubution, when not given the Distribution
   * will be using the *.cloudfront.net domain.
   *
   * @default undefined
   * @example
   * admin.example.com | example.com
   */
    alias?: string,

    /**
     * Source code of the Admin Application which will be deployed towards the S3 Bucket.
     *
     * @example
     * Source.asset(path.join(__dirname, '../app'), {
     *   bundling: {
     *     image: DockerImage.fromRegistry('node:16-alpine'),
     *     command: [
     *       'sh',
     *       '-c',
     *       `npm ci && npm run build && cp -a /asset-input/dist/* /asset-output`,
     *     ],
     *   },
     * }),
     */
    source?: ISource,
  },

  /**
   * Specifiy an ISource object to deploy an CloudFront distribution with your
   * application in place.
   *
   * @default undefined
   */
  frontEnd?: {

    /**
     * Alias to be configured on the CLoudFront distrubution, when not given the Distribution
     * will be using the *.cloudfront.net domain.
     *
     * @default undefined
     * @example
     * blog.example.com | example.com
     */
    alias?: string,

    /**
     * Source code of the Front-End Application which will be deployed towards the S3 Bucket.
     *
     * @example
     * Source.asset(path.join(__dirname, '../app'), {
     *   bundling: {
     *     image: DockerImage.fromRegistry('node:16-alpine'),
     *     command: [
     *       'sh',
     *       '-c',
     *       `npm ci && npm run build && cp -a /asset-input/dist/* /asset-output`,
     *     ],
     *   },
     * }),
     */
    source?: ISource,
  }
}

export class ServerlessBlog extends Construct {
  constructor(scope: Construct, id: string, serverlessProps: ServerlessBlogProps) {
    super(scope, id);

    new ServerlessBlogApi(this, 'Api');

    new ServerlessBlogAdmin(this, 'Admin', {
      hostedZone: serverlessProps?.hostedZone,
      alias: serverlessProps.admin?.alias,
      source: serverlessProps.admin?.source,
      envVariables: {
        test: 'test',
      },
    });

    new ServerlessBlogFront(this, 'Front', {
      hostedZone: serverlessProps?.hostedZone,

      source: serverlessProps.frontEnd?.source,
      alias: serverlessProps.frontEnd?.alias,
    });
  }
}
