import { CfnOutput, StackProps, Tags } from 'aws-cdk-lib';
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
import { BucketDeployment, ISource } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface FrontProps extends StackProps {
  // Leave empty if you don't want the CloudFront distribution to include
  // a custom domain alias.
  hostedZone?: IHostedZone;
  alias?: string;

  // Leave empty if you don't like to create a Front-End application at all.
  source?: ISource;
}

export class ServerlessBlogFront extends Construct {
  constructor(scope: Construct, id: string, props?: FrontProps) {
    super(scope, id);

    if (props?.source === undefined) {
      return;
    }

    const frontBucket = new Bucket(this, 'FrontBucket', {
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
    Tags.of(frontBucket).add('cdkTesting', 'frontBucket');

    let viewerCertificate: ViewerCertificate | undefined = undefined;

    if (props.hostedZone && props.alias) {
      const certificate = new DnsValidatedCertificate(this, 'FrontAppCertificate', {
        domainName: props.alias,
        hostedZone: props.hostedZone,
        region: 'us-east-1', // Needs to be in use-east-1 to use CloudFront
      });
      viewerCertificate = ViewerCertificate.fromAcmCertificate(certificate, {
        aliases: [props.alias],
      });
    }

    const cloudFrontOriginAccessIdentity = new OriginAccessIdentity(this, 'FrontOAI', {
      comment: 'ServerlessBlog Front Origin Access Identity',
    });
    Tags.of(cloudFrontOriginAccessIdentity).add('cdkTesting', 'frontOAI');
    frontBucket.grantRead(cloudFrontOriginAccessIdentity);

    const distribution = new CloudFrontWebDistribution(this, 'FrontAppDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: frontBucket,
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
    Tags.of(distribution).add('cdkTesting', 'FrontAppDistribution');

    if (props.hostedZone) {
      new ARecord(this, 'AliasRecord', {
        zone: props.hostedZone,
        recordName: props.alias,
        target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      });
    }

    new BucketDeployment(this, 'FrontDeployment', {
      destinationBucket: frontBucket,
      sources: [
        props.source,
      ],
      distribution,
      distributionPaths: ['/*'],
    });

    // We are using CfnOutput to output the CloudFront URL to the console and the CloudFormation interface
    new CfnOutput(this, 'Front Website Url', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'Front Website Bucket', { value: frontBucket.bucketName });
  }
}
