import { Construct } from 'constructs';

export class ServerlessBlogAdmin extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    console.log('Admin stack');
  }
}
