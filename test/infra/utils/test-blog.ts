import { Stack, StackProps } from 'aws-cdk-lib';
import { IHostedZone, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { ISource, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';
import { ServerlessBlog } from '../../../lib/main';

/**
 * Semi-clone of Serverless Blog properties to fake an application creation
 */
export interface TestBlogStackProps extends StackProps {
  dns?: {
    // Domain to create hosted zone for which is used in the serverless blog stack
    domain?: string,
  },
  admin?: {
    alias?: string,
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
      hostedZone: hostedZone,
      admin: {
        alias: testProps.admin?.alias,
        source: Source.asset(path.join(__dirname, 'html')),
      },
      frontEnd: {
        alias: testProps.frontEnd?.alias,
        source: testProps.frontEnd?.source,
      },
    });
  }
}
