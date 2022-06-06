import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { findByTestingTag, findOAICByComment } from './utils/helpers';
import { TestBlogStack } from './utils/test-blog';

describe('Admin Stack', () => {
  test('Generates correctly with Route53/ACM/CloudFront', () => {
    const app = new App();
    const stack = new TestBlogStack(app, 'ServerlessBlog', {}, {
      dns: {
        domain: 'example.com',
      },

      admin: {
        alias: 'blog-admin.example.com',
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

    const adminAppDistribution = template.findResources(
      'AWS::CloudFront::Distribution',
      findByTestingTag('FrontAppDistribution'),
    );

    const distributionConfigAlias = Object.values(adminAppDistribution)[0].Properties.DistributionConfig.Aliases;
    expect(distributionConfigAlias).toStrictEqual(['blog.example.com']);

    const viewerCertificate = Object.values(adminAppDistribution)[0].Properties.DistributionConfig.ViewerCertificate;
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

    template.hasResource('AWS::S3::Bucket', findByTestingTag('adminBucket'));
    template.hasResource(
      'AWS::CloudFront::CloudFrontOriginAccessIdentity',
      findOAICByComment('ServerlessBlog Admin Origin Access Identity'),
    );
    template.hasResource('AWS::CloudFront::Distribution', findByTestingTag('AdminAppDistribution'));

    const adminAppDistribution = template.findResources(
      'AWS::CloudFront::Distribution',
      findByTestingTag('AdminAppDistribution'),
    );

    const distributionConfigAlias = Object.values(adminAppDistribution)[0].Properties.DistributionConfig.Aliases;
    expect(distributionConfigAlias).toStrictEqual(undefined);

    const viewerCertificate = Object.values(adminAppDistribution)[0].Properties.DistributionConfig.ViewerCertificate;
    expect(viewerCertificate).toStrictEqual({ CloudFrontDefaultCertificate: true });
  });
});
