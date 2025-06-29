/**
 * Real S3 Service Implementation
 * This handles file storage and retrieval from AWS S3
 */

import { GetObjectCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { s3Client, BUCKETS } from "./config"

// Upload historical data to S3
export async function uploadHistoricalData(symbol: string, timeframe: string, data: any[]): Promise<string> {
  try {
    const key = `historical/${symbol}/${timeframe}.json`

    const command = new PutObjectCommand({
      Bucket: BUCKETS.STOCK_DATA,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: "application/json",
      Metadata: {
        symbol,
        timeframe,
        uploadedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(command)
    return `s3://${BUCKETS.STOCK_DATA}/${key}`
  } catch (error) {
    console.error("Error uploading historical data:", error)
    throw new Error(`Failed to upload historical data for ${symbol}`)
  }
}

// Download historical data from S3
export async function downloadHistoricalData(symbol: string, timeframe: string): Promise<any[]> {
  try {
    const key = `historical/${symbol}/${timeframe}.json`

    const command = new GetObjectCommand({
      Bucket: BUCKETS.STOCK_DATA,
      Key: key,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      throw new Error("No data found")
    }

    const data = await response.Body.transformToString()
    return JSON.parse(data)
  } catch (error) {
    console.error("Error downloading historical data:", error)
    throw new Error(`Failed to download historical data for ${symbol}`)
  }
}

// Upload user data export
export async function uploadUserDataExport(userId: string, data: any): Promise<string> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const key = `exports/${userId}/export-${timestamp}.json`

    const command = new PutObjectCommand({
      Bucket: BUCKETS.USER_DATA,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
      Metadata: {
        userId,
        exportedAt: new Date().toISOString(),
      },
    })

    await s3Client.send(command)
    return `s3://${BUCKETS.USER_DATA}/${key}`
  } catch (error) {
    console.error("Error uploading user data export:", error)
    throw new Error(`Failed to upload data export for user ${userId}`)
  }
}

// List user exports
export async function listUserExports(userId: string): Promise<any[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKETS.USER_DATA,
      Prefix: `exports/${userId}/`,
    })

    const response = await s3Client.send(command)

    return (response.Contents || []).map((object) => ({
      key: object.Key,
      size: object.Size,
      lastModified: object.LastModified,
      url: `s3://${BUCKETS.USER_DATA}/${object.Key}`,
    }))
  } catch (error) {
    console.error("Error listing user exports:", error)
    throw new Error(`Failed to list exports for user ${userId}`)
  }
}

// Delete old exports
export async function deleteUserExport(userId: string, key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKETS.USER_DATA,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error("Error deleting user export:", error)
    throw new Error(`Failed to delete export ${key}`)
  }
}

// Upload market data files
export async function uploadMarketDataFile(filename: string, data: Buffer): Promise<string> {
  try {
    const key = `market-data/${filename}`

    const command = new PutObjectCommand({
      Bucket: BUCKETS.STOCK_DATA,
      Key: key,
      Body: data,
      ContentType: "application/octet-stream",
    })

    await s3Client.send(command)
    return `s3://${BUCKETS.STOCK_DATA}/${key}`
  } catch (error) {
    console.error("Error uploading market data file:", error)
    throw new Error(`Failed to upload market data file ${filename}`)
  }
}
