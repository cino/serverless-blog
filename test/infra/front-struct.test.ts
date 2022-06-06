import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { findByTestingTag, findOAICByComment } from './utils/helpers';
import { TestBlogStack } from './utils/test-blog';

describe('Front-end Stack', () => {
  test('Generates correctly with Route53/ACM/CloudFront', () => {
    const app = new App();
    const stack = new TestBlogStack(app, 'ServerlessBlog', {}, {
      dns: {
        domain: 'example.com',
      },

      frontEnd: {
        alias: 'blog.example.com',
        source: Source.asset(path.join(__dirname, 'utils/html')),
      },
    });
    const template = Template.fromStack(stack);

    template.hasResource('AWS::S3::Bucket', findByTestingTag('frontBucket'));
    template.hasResource(
      'AWS::CloudFront::CloudFrontOriginAccessIdentity',
      findOAICByComment('ServerlessBlog Front Origin Access Identity'),
    );
    template.hasResource('AWS::CloudFront::Distribution', findByTestingTag('FrontAppDistribution'));

    const frontAppDistribution = template.findResources(
      'AWS::CloudFront::Distribution',
      findByTestingTag('FrontAppDistribution'),
    );

    const distributionConfigAlias = Object.values(frontAppDistribution)[0].Properties.DistributionConfig.Aliases;
    expect(distributionConfigAlias).toStrictEqual(['blog.example.com']);

    const viewerCertificate = Object.values(frontAppDistribution)[0].Properties.DistributionConfig.ViewerCertificate;
    expect(viewerCertificate).toHaveProperty('AcmCertificateArn');
    expect(viewerCertificate).toHaveProperty('SslSupportMethod');
  });

  test('Generates CloudFront without Alias when no DNS provided', () => {
    const app = new App();
    const stack = new TestBlogStack(app, 'ServerlessBlog', {}, {
      frontEnd: {
        source: Source.asset(path.join(__dirname, 'utils/html')),
      },
    });
    const template = Template.fromStack(stack);

    template.hasResource('AWS::S3::Bucket', findByTestingTag('frontBucket'));
    template.hasResource(
      'AWS::CloudFront::CloudFrontOriginAccessIdentity',
      findOAICByComment('ServerlessBlog Front Origin Access Identity'),
    );
    template.hasResource('AWS::CloudFront::Distribution', findByTestingTag('FrontAppDistribution'));

    const frontAppDistribution = template.findResources(
      'AWS::CloudFront::Distribution',
      findByTestingTag('FrontAppDistribution'),
    );

    const distributionConfigAlias = Object.values(frontAppDistribution)[0].Properties.DistributionConfig.Aliases;
    expect(distributionConfigAlias).toStrictEqual(undefined);

    const viewerCertificate = Object.values(frontAppDistribution)[0].Properties.DistributionConfig.ViewerCertificate;
    expect(viewerCertificate).toStrictEqual({ CloudFrontDefaultCertificate: true });
  });

  it('Generates without Front-End application', () => {
    const app = new App();
    const stack = new TestBlogStack(app, 'ServerlessBlog', {}, {});
    const template = Template.fromStack(stack);

    // Assert all the Resources that should be missing from the output.
    const frontBucket = template.findResources('AWS::S3::Bucket', findByTestingTag('frontBucket'));
    expect(frontBucket).toStrictEqual({});

    const frontOAI = template.findResources(
      'AWS::CloudFront::CloudFrontOriginAccessIdentity',
      findOAICByComment('ServerlessBlog Front Origin Access Identity'),
    );
    expect(frontOAI).toStrictEqual({});

    const frontAppDistribution = template.findResources(
      'AWS::CloudFront::Distribution',
      findByTestingTag('FrontAppDistribution'),
    );
    expect(frontAppDistribution).toStrictEqual({});
  });
});
