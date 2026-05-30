const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb')

const client = new DynamoDBClient({ region: 'us-east-1' })

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }))
    return true
  } catch {
    return false
  }
}

async function createTable(params) {
  if (await tableExists(params.TableName)) {
    console.log(`✓ ${params.TableName} already exists`)
    return
  }
  await client.send(new CreateTableCommand(params))
  console.log(`✓ Created ${params.TableName}`)
}

async function main() {
  await createTable({
    TableName: 'TelanganaYears',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
  })

  await createTable({
    TableName: 'TelanganaDepartments',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
  })

  await createTable({
    TableName: 'TelanganabudgetAllocations',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'dept_id', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'DeptIndex',
        KeySchema: [
          { AttributeName: 'dept_id', KeyType: 'HASH' },
          { AttributeName: 'PK', KeyType: 'RANGE' },
        ],
        Projection: { ProjectionType: 'ALL' },
      },
    ],
  })

  console.log('All tables ready.')
}

main().catch(console.error)
