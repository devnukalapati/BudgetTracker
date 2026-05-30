import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { config } from './config'

const client = new DynamoDBClient({
  region: config.AWS_REGION,
  ...(config.DYNAMODB_ENDPOINT ? { endpoint: config.DYNAMODB_ENDPOINT } : {}),
})

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

export const TABLE_NAME = config.DYNAMODB_TABLE

// Keep old TABLES for backward compat during migration - will be removed after seed
export const TABLES = {
  BUDGET_ALLOCATIONS: 'TelanganabudgetAllocations',
  DEPARTMENTS: 'TelanganaDepartments',
  YEARS: 'TelanganaYears',
} as const
