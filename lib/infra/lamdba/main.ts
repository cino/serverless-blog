import { Duration } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Architecture, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { join } from 'path';

export interface LambdaFunctionProps {
  readonly sourceFile: string;
  readonly envVariables?: { [key: string]: string };
}

/**
 * Seperate Construct to create a Lambda function which will be re-used
 * across the project and has a tied down role to the specific needs.
 */
export class LambdaFunction extends Construct {
  public readonly role: Role;

  // eslint-disable-next-line @typescript-eslint/ban-types
  public readonly function: Function;

  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    super(scope, id);

    const extraEnvVariables = props.envVariables
      ? props.envVariables
      : {};

    this.role = new Role(this, 'role', {
      roleName: id + 'Role',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });

    this.function = new NodejsFunction(this, 'Lambda', {
      // code: Code.fromAsset(join(__dirname, props.sourceDirectory)),
      entry: join(__dirname, props.sourceFile),
      handler: 'main.handler',
      environment: {
        ...extraEnvVariables,
      },
      architecture: Architecture.ARM_64,
      memorySize: 1524,
      role: this.role,
      runtime: Runtime.NODEJS_16_X,
      timeout: Duration.seconds(30),
      logRetention: RetentionDays.ONE_WEEK,
    });

    // Add Custom inline policy to own allow writing to own log group
    this.role.attachInlinePolicy(new Policy(this, 'loggingPolicy', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'logs:CreateLogGroup',
          ],
          resources: ['*'],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: [
            this.function.logGroup.logGroupArn,
          ],
        }),
      ],
    }));
  }
}
