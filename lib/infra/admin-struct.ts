import { CfnOutput, DockerImage, StackProps, Tags } from 'aws-cdk-lib';
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  CloudFrontAllowedMethods,
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerCertificate,
} from 'aws-cdk-lib/aws-cloudfront';
import { ARecord, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, ISource, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';

export interface AdminProps extends StackProps {
  // Leave empty if you don't want the CloudFront distribution to include
  // a custom domain alias.
  hostedZone?: IHostedZone;
  alias?: string;

  // Leave empty if you would like the provided admin application.
  source?: ISource;

  envVariables?: { [key: string]: string };
}

export class ServerlessBlogAdmin extends Construct {
  constructor(scope: Construct, id: string, props?: AdminProps) {
    super(scope, id);

    const adminBucket = new Bucket(this, 'AdminBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    Tags.of(adminBucket).add('cdkTesting', 'adminBucket');

    let viewerCertificate: ViewerCertificate | undefined = undefined;

    if (props?.hostedZone && props?.alias) {

      const certificate = new DnsValidatedCertificate(this, 'AdminAppCertificate', {
        domainName: props.alias,
        hostedZone: props.hostedZone,
        region: 'us-east-1', // Needs to be in use-east-1 to use CloudFront
      });
      viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [props.alias],
      });
    }

    const cloudFrontOriginAccessIdentity = new OriginAccessIdentity(this, 'AdminOAI', {
      comment: 'ServerlessBlog Admin Origin Access Identity',
    });
    Tags.of(cloudFrontOriginAccessIdentity).add('cdkTesting', 'adminOAI');
    adminBucket.grantRead(cloudFrontOriginAccessIdentity);

    const distribution = new CloudFrontWebDistribution(this, 'AdminAppDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: adminBucket,
            originAccessIdentity: cloudFrontOriginAccessIdentity,
          },
          behaviors: [{
            isDefaultBehavior: true,
            compress: true,
            allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
          }],
        },
      ],
      errorConfigurations: [{
        errorCode: 404,
        responseCode: 200,
        responsePagePath: '/index.html',
      }],
      defaultRootObject: 'index.html',
      viewerCertificate: viewerCertificate,
    });
    Tags.of(distribution).add('cdkTesting', 'AdminAppDistribution');

    if (props?.hostedZone && props?.alias) {
      new ARecord(this, 'AliasRecord', {
        zone: props.hostedZone,
        recordName: props.alias,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });
    }

    const source: ISource = props?.source ? props.source : Source.asset(path.join(__dirname, '../admin'), {
      bundling: {
        image: DockerImage.fromRegistry('node:16-alpine'),
        command: [
          'sh',
          '-c',
          'npm ci && npm run build && cp -a /asset-input/dist/* /asset-output',
        ],
        environment: props?.envVariables,
      },
    });

    new BucketDeployment(this, 'AdminDeployment', {
      destinationBucket: adminBucket,
      sources: [
        source,
      ],
      distribution,
      distributionPaths: ['/*'],
    });

    // We are using CfnOutput to output the CloudFront URL to the console and the CloudFormation interface
    new CfnOutput(this, 'Admin Website Url', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'Admin Website Bucket', { value: adminBucket.bucketName });
  }
}
