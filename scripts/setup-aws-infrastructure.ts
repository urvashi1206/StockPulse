/**
 * AWS Infrastructure Setup Script
 * This script creates all necessary AWS resources for the stock tracker application
 */

import {
  CreateTableCommand,
  DescribeTableCommand,
  KeyType,
  ScalarAttributeType,
  ProjectionType,
  BillingMode,
} from "@aws-sdk/client-dynamodb"
import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3"
import { docClient, s3Client, TABLES, BUCKETS } from "../lib/aws/config"
import { setupAthenaDatabase } from "../lib/aws/real-athena-service"

// DynamoDB Table Definitions
const tableDefinitions = [
  {
    TableName: TABLES.STOCKS,
    KeySchema: [{ AttributeName: "symbol", KeyType: KeyType.HASH }],
    AttributeDefinitions: [{ AttributeName: "symbol", AttributeType: ScalarAttributeType.S }],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  },
  {
    TableName: TABLES.USERS,
    KeySchema: [{ AttributeName: "id", KeyType: KeyType.HASH }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: ScalarAttributeType.S },
      { AttributeName: "email", AttributeType: ScalarAttributeType.S },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "EmailIndex",
        KeySchema: [{ AttributeName: "email", KeyType: KeyType.HASH }],
        Projection: { ProjectionType: ProjectionType.ALL },
      },
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  },
  {
    TableName: TABLES.TRANSACTIONS,
    KeySchema: [{ AttributeName: "id", KeyType: KeyType.HASH }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: ScalarAttributeType.S },
      { AttributeName: "userId", AttributeType: ScalarAttributeType.S },
      { AttributeName: "date", AttributeType: ScalarAttributeType.S },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "UserIdIndex",
        KeySchema: [
          { AttributeName: "userId", KeyType: KeyType.HASH },
          { AttributeName: "date", KeyType: KeyType.RANGE },
        ],
        Projection: { ProjectionType: ProjectionType.ALL },
      },
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  },
  {
    TableName: TABLES.WATCHLISTS,
    KeySchema: [
      { AttributeName: "userId", KeyType: KeyType.HASH },
      { AttributeName: "symbol", KeyType: KeyType.RANGE },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: ScalarAttributeType.S },
      { AttributeName: "symbol", AttributeType: ScalarAttributeType.S },
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  },
  {
    TableName: TABLES.STOCK_HISTORY,
    KeySchema: [
      { AttributeName: "symbol", KeyType: KeyType.HASH },
      { AttributeName: "date", KeyType: KeyType.RANGE },
    ],
    AttributeDefinitions: [
      { AttributeName: "symbol", AttributeType: ScalarAttributeType.S },
      { AttributeName: "date", AttributeType: ScalarAttributeType.S },
    ],
    BillingMode: BillingMode.PAY_PER_REQUEST,
  },
]

// Create DynamoDB Tables
async function createDynamoDBTables() {
  console.log("Creating DynamoDB tables...")

  for (const tableDefinition of tableDefinitions) {
    try {
      // Check if table already exists
      try {
        const describeCommand = new DescribeTableCommand({ TableName: tableDefinition.TableName })
        await docClient.send(describeCommand)
        console.log(`✓ Table ${tableDefinition.TableName} already exists`)
        continue
      } catch (error) {
        // Table doesn't exist, create it
      }

      const createCommand = new CreateTableCommand(tableDefinition)
      await docClient.send(createCommand)
      console.log(`✓ Created table: ${tableDefinition.TableName}`)

      // Wait for table to be active
      let tableStatus = "CREATING"
      while (tableStatus === "CREATING") {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const describeCommand = new DescribeTableCommand({ TableName: tableDefinition.TableName })
        const response = await docClient.send(describeCommand)
        tableStatus = response.Table?.TableStatus || "CREATING"
      }

      console.log(`✓ Table ${tableDefinition.TableName} is now active`)
    } catch (error) {
      console.error(`✗ Error creating table ${tableDefinition.TableName}:`, error)
    }
  }
}

// Create S3 Buckets
async function createS3Buckets() {
  console.log("Creating S3 buckets...")

  const buckets = [BUCKETS.STOCK_DATA, BUCKETS.USER_DATA]

  for (const bucketName of buckets) {
    try {
      // Check if bucket already exists
      try {
        const headCommand = new HeadBucketCommand({ Bucket: bucketName })
        await s3Client.send(headCommand)
        console.log(`✓ Bucket ${bucketName} already exists`)
        continue
      } catch (error) {
        // Bucket doesn't exist, create it
      }

      const createCommand = new CreateBucketCommand({ Bucket: bucketName })
      await s3Client.send(createCommand)
      console.log(`✓ Created bucket: ${bucketName}`)
    } catch (error) {
      console.error(`✗ Error creating bucket ${bucketName}:`, error)
    }
  }
}

// Setup Athena
async function setupAthena() {
  console.log("Setting up Athena database and tables...")

  try {
    await setupAthenaDatabase()
    console.log("✓ Athena database and tables created successfully")
  } catch (error) {
    console.error("✗ Error setting up Athena:", error)
  }
}

// Main setup function
async function setupAWSInfrastructure() {
  console.log("🚀 Setting up AWS infrastructure for Stock Tracker...")
  console.log("=".repeat(50))

  try {
    await createDynamoDBTables()
    console.log()

    await createS3Buckets()
    console.log()

    await setupAthena()
    console.log()

    console.log("=".repeat(50))
    console.log("✅ AWS infrastructure setup completed successfully!")
    console.log()
    console.log("Next steps:")
    console.log("1. Configure your environment variables:")
    console.log("   - AWS_ACCESS_KEY_ID")
    console.log("   - AWS_SECRET_ACCESS_KEY")
    console.log("   - AWS_REGION")
    console.log("2. Set up external API keys:")
    console.log("   - ALPHA_VANTAGE_API_KEY")
    console.log("   - IEX_CLOUD_API_KEY")
    console.log("   - FINNHUB_API_KEY")
    console.log("3. Run the data seeding script to populate initial data")
  } catch (error) {
    console.error("❌ Error setting up AWS infrastructure:", error)
    process.exit(1)
  }
}

// Run the setup
if (require.main === module) {
  setupAWSInfrastructure()
}

export { setupAWSInfrastructure }
