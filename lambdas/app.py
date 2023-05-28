import random
from  requests import get
import boto3
import os

client = boto3.client('sns')
EMAIL_TOPIC_ARN = os.environ.get('EMAIL_TOPIC_ARN')

def handler(event, context):

    res = get("https://api.api-ninjas.com/v1/quotes?category=happiness", 
               headers={'authority': 'api.api-ninjas.com', 'accept': '*/*',
                        'dnt': '1',  'origin': 'https://api-ninjas.com',
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36', 
                        'referer': 'https://api-ninjas.com/'}, timeout=7)
    quote = res.json()[0]['quote']

    client.publish(
        TopicArn=EMAIL_TOPIC_ARN,
        Message=quote,
        Subject='Quote for the day',
        )

    print(quote)
    return quote
