import { RemovalPolicy, Tags } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class BackEndDatabase extends Construct {
  table: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.table = new Table(this, 'content', {
      partitionKey: {
        name: 'PK',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,

      // todo: Modify to be specific to each environment.
      removalPolicy: RemovalPolicy.DESTROY,
    });
    Tags.of(this.table).add('cdkTesting', 'backendDynamoDb');
  }
}
