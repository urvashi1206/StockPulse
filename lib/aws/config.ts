/**
 * AWS Configuration and Client Setup
 * This file sets up the AWS SDK clients for DynamoDB, S3, and other services
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { S3Client } from "@aws-sdk/client-s3"
import { AthenaClient } from "@aws-sdk/client-athena"

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION || "us-east-1"
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY

// DynamoDB Client Setup
const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  credentials:
    AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient)

// S3 Client Setup
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials:
    AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

// Athena Client Setup
export const athenaClient = new AthenaClient({
  region: AWS_REGION,
  credentials:
    AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
})

// Table Names
export const TABLES = {
  STOCKS: process.env.STOCKS_TABLE || "StockTracker-Stocks",
  USERS: process.env.USERS_TABLE || "StockTracker-Users",
  TRANSACTIONS: process.env.TRANSACTIONS_TABLE || "StockTracker-Transactions",
  WATCHLISTS: process.env.WATCHLISTS_TABLE || "StockTracker-Watchlists",
  STOCK_HISTORY: process.env.STOCK_HISTORY_TABLE || "StockTracker-StockHistory",
}

// S3 Bucket Names
export const BUCKETS = {
  STOCK_DATA: process.env.STOCK_DATA_BUCKET || "stocktracker-historical-data",
  USER_DATA: process.env.USER_DATA_BUCKET || "stocktracker-user-data",
}

// Athena Configuration
export const ATHENA_CONFIG = {
  DATABASE: process.env.ATHENA_DATABASE || "stocktracker_analytics",
  OUTPUT_LOCATION: process.env.ATHENA_OUTPUT_LOCATION || "s3://stocktracker-athena-results/",
  WORKGROUP: process.env.ATHENA_WORKGROUP || "primary",
}
