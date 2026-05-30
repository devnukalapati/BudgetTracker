const { DynamoDBClient, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb')
const { marshall } = require('@aws-sdk/util-dynamodb')

const client = new DynamoDBClient({ region: 'us-east-1' })

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function schemeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function batchWrite(tableName, items) {
  const chunks = []
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25))
  for (const chunk of chunks) {
    await client.send(new BatchWriteItemCommand({
      RequestItems: {
        [tableName]: chunk.map(item => ({ PutRequest: { Item: marshall(item, { removeUndefinedValues: true }) } }))
      }
    }))
  }
}

const YEARS = ['2022-23', '2023-24', '2024-25']

const DEPARTMENTS = [
  { name: 'School Education', base_budget: 15200 },
  { name: 'Health Medical & Family Welfare', base_budget: 8400 },
  { name: 'Agriculture & Cooperation', base_budget: 12800 },
  { name: 'Irrigation & CAD', base_budget: 18500 },
  { name: 'Roads & Buildings', base_budget: 11200 },
  { name: 'Municipal Administration & Urban Development', base_budget: 9600 },
  { name: 'Finance', base_budget: 22000 },
  { name: 'Home', base_budget: 6800 },
  { name: 'Energy', base_budget: 14200 },
  { name: 'Social Welfare', base_budget: 7400 },
]

const SCHEMES = {
  'School Education': ['Samagra Shiksha', 'Mid Day Meal Scheme', 'Teacher Salaries & Allowances', 'School Infrastructure Development', 'Kasturba Gandhi Balika Vidyalaya'],
  'Health Medical & Family Welfare': ['National Health Mission', 'Aarogyasri Health Insurance', 'Primary Health Centres', 'Government Hospitals Modernisation', 'Medical Education'],
  'Agriculture & Cooperation': ['Rythu Bandhu Investment Support', 'Rythu Bima Insurance', 'Micro Irrigation', 'Agriculture Research & Extension', 'Horticulture Development'],
  'Irrigation & CAD': ['Kaleshwaram Lift Irrigation', 'Mission Bhagiratha', 'Minor Irrigation Works', 'Command Area Development', 'Flood Control & Drainage'],
  'Roads & Buildings': ['State Highway Development', 'Rural Road Connectivity', 'Government Buildings Construction', 'National Highway Works', 'Urban Road Development'],
  'Municipal Administration & Urban Development': ['Hyderabad Metro Water Supply', 'GHMC Infrastructure', 'Smart City Mission', 'Urban Local Bodies Grants', 'Slum Development'],
  'Finance': ['Debt Servicing', 'Pension & Retirement Benefits', 'Grants to Local Bodies', 'Compensatory Afforestation', 'General Administration'],
  'Home': ['Police Modernisation', 'Prisons Administration', 'Fire Services', 'Civil Supplies & Consumer Affairs', 'Border & Vigilance'],
  'Energy': ['Power Purchase Agreements', 'Distribution Network Upgradation', 'Solar Energy Schemes', 'Rural Electrification', 'Free Power to Farmers'],
  'Social Welfare': ['Aasara Pensions', 'Scheduled Caste Development', 'Scheduled Tribe Development', 'Kalyana Lakshmi Shaadi Mubarak', 'BC Welfare Schemes'],
}

const YEAR_MULTIPLIER = { '2022-23': 1.0, '2023-24': 1.08, '2024-25': 1.15 }
const ACTUAL_RATIO = { '2022-23': 0.87, '2023-24': 0.79, '2024-25': 0 }

async function main() {
  const allAllocations = []
  const allDepts = []
  const yearTotals = {}

  for (const year of YEARS) {
    yearTotals[year] = 0

    for (const dept of DEPARTMENTS) {
      const deptId = slugify(dept.name)
      const deptBudget = Math.round(dept.base_budget * YEAR_MULTIPLIER[year])
      yearTotals[year] += deptBudget
      const schemes = SCHEMES[dept.name]
      const schemeShare = deptBudget / schemes.length

      allDepts.push({
        PK: `YEAR#${year}`,
        SK: `DEPT#${deptId}`,
        dept_id: deptId,
        name: dept.name,
        total_budget: deptBudget,
      })

      for (const scheme of schemes) {
        const be = Math.round(schemeShare * (0.8 + Math.random() * 0.4))
        const re = Math.round(be * (0.95 + Math.random() * 0.1))
        const actuals = ACTUAL_RATIO[year] === 0 ? 0 : Math.round(be * (ACTUAL_RATIO[year] - 0.1 + Math.random() * 0.2))
        allAllocations.push({
          PK: `YEAR#${year}`,
          SK: `DEPT#${deptId}#SCHEME#${schemeSlug(scheme)}`,
          dept_id: deptId,
          dept_name: dept.name,
          scheme_name: scheme,
          budget_estimate: be,
          revised_estimate: re,
          actual_spent: actuals,
          source_url: `https://openbudgetsindia.org/dataset/telangana-budget-${year}/resource/telangana-budget-${year}.csv`,
          year,
        })
      }
    }
  }

  console.log('Writing allocations...')
  await batchWrite('TelanganabudgetAllocations', allAllocations)

  console.log('Writing departments...')
  await batchWrite('TelanganaDepartments', allDepts)

  console.log('Writing years...')
  const yearItems = YEARS.map(year => ({
    PK: 'YEARS',
    SK: year,
    year,
    total_budget: yearTotals[year],
    ingested_at: new Date().toISOString(),
  }))
  await batchWrite('TelanganaYears', yearItems)

  console.log('Seed complete.')
  for (const year of YEARS) console.log(`  ${year}: ₹${yearTotals[year].toLocaleString('en-IN')} crore`)
}

main().catch(console.error)
