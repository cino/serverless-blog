#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BlogApiStack } from '../lib/infra/api-stack';
import { AdminStack } from '../lib/infra/admin-stack';

const app = new cdk.App();

new BlogApiStack(app, 'blog-api');
new AdminStack(app, 'blog-admin');
