import { Match } from 'aws-cdk-lib/assertions';

export function findByTestingTag(tag: string): object {
  return {
    Properties: Match.objectLike({
      Tags: Match.arrayWith([Match.objectLike({ Key: 'cdkTesting', Value: tag })]),
    }),
  };
}
export function findOAICByComment(comment: string): object {
  return {
    Properties: Match.objectLike({
      CloudFrontOriginAccessIdentityConfig: Match.objectLike({ Comment: comment }),
    }),
  };
}
