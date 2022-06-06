import { Stack, StackProps } from 'aws-cdk-lib';
import { IHostedZone, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { ISource } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { ServerlessBlog } from '../../lib/main';

/**
 * Semi-clone of Serverless Blog properties to fake an application creation
 */
export interface TestBlogStackProps extends StackProps {
  dns?: {
    // Domain to create hosted zone for which is used in the serverless blog stack
    domain?: string,
  },
  frontEnd?: {
    alias?: string,
    source: ISource,
  }
}

export class TestBlogStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps, testProps: TestBlogStackProps) {
    super(scope, id, props);

    let hostedZone: IHostedZone | undefined = undefined;
    if (testProps.dns?.domain) {
      hostedZone = new PublicHostedZone(this, 'testBlogHostedZone', {
        zoneName: testProps.dns.domain,
      });
    }

    new ServerlessBlog(this, 'ServerlessBlog', {
      dns: {
        hostedZone: hostedZone,
      },

      frontEnd: {
        alias: testProps.frontEnd?.alias,
        source: testProps.frontEnd?.source,
      },
    });
  }
}
