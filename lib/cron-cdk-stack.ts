import { Stack, StackProps, Duration, CfnParameter } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_sns as sns } from 'aws-cdk-lib';
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib';
import lambda = require('aws-cdk-lib/aws-lambda');
import fs = require('fs');
import { join } from 'path';
import events = require('aws-cdk-lib/aws-events');
import targets = require('aws-cdk-lib/aws-events-targets');


export class CronCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handlerFunction = new lambda.Function(this, 'CronQuote', {
      code: lambda.Code.fromAsset(join(__dirname, '../lambdas'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash', '-c',
            'pip install requests boto3 -t /asset-output && cp -au . /asset-output'
          ],
        },
      }),
      handler: 'app.handler',
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_9,
    });

    // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
    const rule = new events.Rule(this, 'Cron-rule', {
        schedule: events.Schedule.expression('cron(0 18 ? * MON-FRI *)')
    });

    rule.addTarget(new targets.LambdaFunction(handlerFunction))

    // SNS Topic
    const topic = new sns.Topic(this, 'Email Topic', {
      displayName: 'Email subscription topic',
    });
    topic.addSubscription(new subscriptions.EmailSubscription('darasticdara@gmail.com'));

    // adding environment
    handlerFunction.addEnvironment('EMAIL_TOPIC_ARN', topic.topicArn)
  
    // permission
    topic.grantPublish(handlerFunction)

  }
}
