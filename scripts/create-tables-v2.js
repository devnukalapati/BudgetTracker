const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb')

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
const client = new DynamoDBClient({ region: 'us-east-1', endpoint })

async function tableExists(name) {
  try { await client.send(new DescribeTableCommand({ TableName: name })); return true }
  catch { return false }
}

async function main() {
  const tableName = process.env.DYNAMODB_TABLE || 'IndiaBudget'
  if (await tableExists(tableName)) {
    console.log(`✓ ${tableName} already exists`)
    return
  }

  await client.send(new CreateTableCommand({
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
      { AttributeName: 'entity_type', AttributeType: 'S' },
      { AttributeName: 'updated_at', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'GSI1',
        KeySchema: [
          { AttributeName: 'GSI1PK', KeyType: 'HASH' },
          { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
      {
        IndexName: 'GSI2',
        KeySchema: [
          { AttributeName: 'entity_type', KeyType: 'HASH' },
          { AttributeName: 'updated_at', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'KEYS_ONLY' },
      },
    ],
  }))
  console.log(`✓ Created ${tableName} with GSI1 and GSI2`)
}

main().catch(console.error)
