import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { docClient, TABLE_NAME } from './dynamodb'
import { createLogger } from './logger'
import type { Year, Department, BudgetAllocation, FiscalHealth, StateIndex, Tender } from '@/types/budget'

const log = createLogger({ module: 'budget-queries' })

// ── State index ────────────────────────────────────────────────
export async function getStates(): Promise<StateIndex[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': 'STATE_INDEX' },
  }))
  return (result.Items || []) as StateIndex[]
}

// ── Years ──────────────────────────────────────────────────────
export async function getYears(stateCode: string): Promise<Year[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}`,
      ':sk': 'YEAR#',
    },
    ScanIndexForward: false,
  }))
  return (result.Items || []) as Year[]
}

export async function getYearSummary(stateCode: string, year: string): Promise<Year | null> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}`,
      ':sk': `YEAR#${year}`,
    },
    Limit: 1,
  }))
  if (!result.Items?.length) return null
  return result.Items[0] as Year
}

// ── Departments ────────────────────────────────────────────────
export async function getDepartments(stateCode: string, year: string, limit = 200): Promise<Department[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}#YEAR#${year}`,
      ':sk': 'DEPT#',
    },
    Limit: limit,
  }))
  // filter out allocation items (SK has SCHEME# in it)
  return (result.Items || [])
    .filter(item => !item.SK.includes('#SCHEME#'))
    .map(item => ({
      dept_id: item.dept_id,
      name: item.name,
      total_budget: item.total_budget,
      year,
      state_code: stateCode,
    })) as Department[]
}

// ── Schemes / Allocations ──────────────────────────────────────
export async function getSchemes(stateCode: string, year: string, deptId: string): Promise<BudgetAllocation[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}#YEAR#${year}`,
      ':sk': `DEPT#${deptId}#SCHEME#`,
    },
    Limit: 500,
  }))
  return (result.Items || []).map(item => ({
    dept_id: item.dept_id,
    dept_name: item.dept_name,
    scheme_name: item.scheme_name,
    budget_estimate: item.budget_estimate,
    revised_estimate: item.revised_estimate,
    actual_spent: item.actual_spent,
    source_url: item.source_url,
    year,
    state_code: stateCode,
  })) as BudgetAllocation[]
}

export async function getDeptAllYears(stateCode: string, deptId: string): Promise<BudgetAllocation[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': `STATE#${stateCode}#DEPT#${deptId}` },
    Limit: 500,
  }))
  return (result.Items || []) as BudgetAllocation[]
}

export async function getSourceUrl(stateCode: string, year: string): Promise<string> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}#YEAR#${year}`,
      ':sk': 'DEPT#',
    },
    Limit: 1,
  }))
  return result.Items?.[0]?.source_url || 'https://openbudgetsindia.org'
}

// ── Fiscal Health ──────────────────────────────────────────────
export async function getFiscalHealth(stateCode: string, year: string): Promise<FiscalHealth | null> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK = :sk',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}#YEAR#${year}`,
      ':sk': 'FISCAL#SUMMARY',
    },
    Limit: 1,
  }))
  if (!result.Items?.length) return null
  return result.Items[0] as FiscalHealth
}

export async function getFiscalHealthAllYears(stateCode: string): Promise<FiscalHealth[]> {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': `FISCAL#${stateCode}` },
    Limit: 20,
  }))
  return (result.Items || []) as FiscalHealth[]
}

// ── Tenders ────────────────────────────────────────────────────
export interface PaginatedResult<T> { data: T[]; nextCursor: string | null }

export async function getTenders(
  stateCode: string, year: string, deptId: string,
  opts: { limit?: number; cursor?: string } = {}
): Promise<PaginatedResult<Tender>> {
  const limit = opts.limit || 50
  const exclusiveStartKey = opts.cursor
    ? JSON.parse(Buffer.from(opts.cursor, 'base64').toString())
    : undefined

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
    ExpressionAttributeValues: {
      ':pk': `STATE#${stateCode}#DEPT#${deptId}#TENDER`,
      ':sk': `YEAR#${year}#TENDER#`,
    },
    Limit: limit,
    ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
  }))

  const nextCursor = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : null

  return { data: (result.Items || []) as Tender[], nextCursor }
}

export async function getTendersByCompany(
  gstin: string,
  opts: { limit?: number; cursor?: string } = {}
): Promise<PaginatedResult<Tender>> {
  const limit = opts.limit || 50
  const exclusiveStartKey = opts.cursor
    ? JSON.parse(Buffer.from(opts.cursor, 'base64').toString())
    : undefined

  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk',
    ExpressionAttributeValues: { ':pk': `COMPANY#${gstin}` },
    ScanIndexForward: false,
    Limit: limit,
    ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
  }))

  const nextCursor = result.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
    : null

  return { data: (result.Items || []) as Tender[], nextCursor }
}

// ── Health check ───────────────────────────────────────────────
export async function checkDbHealth(): Promise<boolean> {
  try {
    const { DynamoDBClient, DescribeTableCommand } = await import('@aws-sdk/client-dynamodb')
    const raw = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.DYNAMODB_ENDPOINT ? { endpoint: process.env.DYNAMODB_ENDPOINT } : {}),
    })
    await raw.send(new DescribeTableCommand({ TableName: TABLE_NAME }))
    return true
  } catch {
    return false
  }
}
