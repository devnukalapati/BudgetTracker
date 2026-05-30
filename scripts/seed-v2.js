const { DynamoDBClient, BatchWriteItemCommand } = require('@aws-sdk/client-dynamodb')
const { marshall } = require('@aws-sdk/util-dynamodb')

const endpoint = process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000'
const TABLE = process.env.DYNAMODB_TABLE || 'IndiaBudget'
const client = new DynamoDBClient({ region: 'us-east-1', endpoint })

const args = process.argv.slice(2)
const stateArg = args.find(a => a.startsWith('--state='))?.split('=')[1]

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function batchWrite(items) {
  const chunks = []
  for (let i = 0; i < items.length; i += 25) chunks.push(items.slice(i, i + 25))
  for (const chunk of chunks) {
    let unprocessed = chunk
    let attempts = 0
    while (unprocessed.length > 0 && attempts < 5) {
      const result = await client.send(new BatchWriteItemCommand({
        RequestItems: {
          [TABLE]: unprocessed.map(item => ({ PutRequest: { Item: marshall(item, { removeUndefinedValues: true }) } }))
        }
      }))
      unprocessed = result.UnprocessedItems?.[TABLE]?.map(r => {
        const u = {}
        for (const [k,v] of Object.entries(r.PutRequest.Item)) u[k] = v
        return u
      }) || []
      if (unprocessed.length > 0) {
        attempts++
        await new Promise(r => setTimeout(r, 100 * Math.pow(2, attempts)))
      }
    }
  }
}

const YEARS = ['2022-23', '2023-24', '2024-25']
const now = new Date().toISOString()

// ── State definitions ──────────────────────────────────────────
const STATES_DATA = {
  telangana: {
    name: 'Telangana',
    region: 'South',
    capital: 'Hyderabad',
    base_multiplier: 1.0,
    departments: [
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
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Mid Day Meal Scheme', 'Teacher Salaries & Allowances', 'School Infrastructure', 'Kasturba Gandhi Balika Vidyalaya'],
      'Health Medical & Family Welfare': ['National Health Mission', 'Aarogyasri Health Insurance', 'Primary Health Centres', 'Government Hospitals', 'Medical Education'],
      'Agriculture & Cooperation': ['Rythu Bandhu', 'Rythu Bima', 'Micro Irrigation', 'Agriculture Research', 'Horticulture Development'],
      'Irrigation & CAD': ['Kaleshwaram Lift Irrigation', 'Mission Bhagiratha', 'Minor Irrigation', 'Command Area Development', 'Flood Control'],
      'Roads & Buildings': ['State Highway Development', 'Rural Roads', 'Government Buildings', 'National Highway Works', 'Urban Roads'],
      'Municipal Administration & Urban Development': ['Hyderabad Metro Water', 'GHMC Infrastructure', 'Smart City', 'Urban Local Bodies', 'Slum Development'],
      'Finance': ['Debt Servicing', 'Pension & Retirement', 'Grants to Local Bodies', 'Afforestation', 'General Administration'],
      'Home': ['Police Modernisation', 'Prisons', 'Fire Services', 'Civil Supplies', 'Vigilance'],
      'Energy': ['Power Purchase', 'Distribution Network', 'Solar Energy', 'Rural Electrification', 'Free Power to Farmers'],
      'Social Welfare': ['Aasara Pensions', 'SC Development', 'ST Development', 'Kalyana Lakshmi', 'BC Welfare'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 105000, tax_revenue: 72000, non_tax_revenue: 15000, grants_in_aid: 18000, capital_receipts: 42000, borrowings: 38000, total_expenditure: 142400, fiscal_deficit: 37400, revenue_deficit: 8000, outstanding_debt: 320000 },
      '2023-24': { revenue_receipts: 115000, tax_revenue: 80000, non_tax_revenue: 16000, grants_in_aid: 19000, capital_receipts: 45000, borrowings: 41000, total_expenditure: 153792, fiscal_deficit: 38792, revenue_deficit: 9500, outstanding_debt: 358000 },
      '2024-25': { revenue_receipts: 128000, tax_revenue: 90000, non_tax_revenue: 18000, grants_in_aid: 20000, capital_receipts: 52000, borrowings: 48000, total_expenditure: 177210, fiscal_deficit: 49210, revenue_deficit: 11000, outstanding_debt: 402000 },
    },
  },
  maharashtra: {
    name: 'Maharashtra',
    region: 'West',
    capital: 'Mumbai',
    base_multiplier: 3.2,
    departments: [
      { name: 'School Education', base_budget: 48000 },
      { name: 'Health & Family Welfare', base_budget: 22000 },
      { name: 'Agriculture', base_budget: 18000 },
      { name: 'Irrigation', base_budget: 25000 },
      { name: 'Public Works', base_budget: 32000 },
      { name: 'Urban Development', base_budget: 28000 },
      { name: 'Finance', base_budget: 72000 },
      { name: 'Home', base_budget: 18000 },
      { name: 'Energy', base_budget: 30000 },
      { name: 'Social Justice', base_budget: 20000 },
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Mid Day Meal', 'Teacher Training', 'School Buildings', 'Digital Classrooms'],
      'Health & Family Welfare': ['Mahatma Jyotirao Phule Jan Arogya', 'Ayushman Bharat', 'District Hospitals', 'Primary Health', 'Medical Colleges'],
      'Agriculture': ['PM KISAN', 'Crop Insurance', 'Irrigation Subsidy', 'Soil Health', 'Farm Mechanisation'],
      'Irrigation': ['Vidarbha Irrigation', 'Krishna Koyna', 'Minor Irrigation', 'Lift Irrigation', 'Groundwater'],
      'Public Works': ['State Highways', 'Rural Connectivity', 'Bridges', 'Tunnel Projects', 'NH Share'],
      'Urban Development': ['AMRUT', 'Smart Cities', 'SRA Slum Rehab', 'Metro Rail', 'Municipal Grants'],
      'Finance': ['Debt Service', 'Pensions', 'Local Body Grants', 'Disaster Relief', 'Contingency'],
      'Home': ['Police Force', 'Prisons', 'Fire Brigade', 'Home Guards', 'Anti-Naxal'],
      'Energy': ['MSEDCL Subsidy', 'Renewables', 'Solar Rooftop', 'Rural Power', 'Feeder Separation'],
      'Social Justice': ['Mahatma Phule BC Scheme', 'SC Sub-Plan', 'Adivasi Sub-Plan', 'Disability Welfare', 'Women Empowerment'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 330000, tax_revenue: 220000, non_tax_revenue: 45000, grants_in_aid: 65000, capital_receipts: 110000, borrowings: 95000, total_expenditure: 455000, fiscal_deficit: 125000, revenue_deficit: 15000, outstanding_debt: 720000 },
      '2023-24': { revenue_receipts: 365000, tax_revenue: 245000, non_tax_revenue: 50000, grants_in_aid: 70000, capital_receipts: 120000, borrowings: 105000, total_expenditure: 502000, fiscal_deficit: 137000, revenue_deficit: 18000, outstanding_debt: 820000 },
      '2024-25': { revenue_receipts: 402000, tax_revenue: 272000, non_tax_revenue: 55000, grants_in_aid: 75000, capital_receipts: 130000, borrowings: 115000, total_expenditure: 552000, fiscal_deficit: 150000, revenue_deficit: 20000, outstanding_debt: 930000 },
    },
  },
  karnataka: {
    name: 'Karnataka',
    region: 'South',
    capital: 'Bengaluru',
    base_multiplier: 1.8,
    departments: [
      { name: 'Education', base_budget: 28000 },
      { name: 'Health & Family Welfare', base_budget: 14000 },
      { name: 'Agriculture', base_budget: 16000 },
      { name: 'Water Resources', base_budget: 20000 },
      { name: 'Public Works', base_budget: 18000 },
      { name: 'Urban Development', base_budget: 15000 },
      { name: 'Finance', base_budget: 45000 },
      { name: 'Home', base_budget: 12000 },
      { name: 'Energy', base_budget: 20000 },
      { name: 'Social Welfare', base_budget: 14000 },
    ],
    schemes: {
      'Education': ['Samagra Shiksha', 'Vidya Nidhi', 'SSLC Coaching', 'SC/ST Hostels', 'Digital Education'],
      'Health & Family Welfare': ['Ayushman Arogya Karnataka', 'Yashaswini', 'PHC Upgrades', 'NHM', 'Sneha Santhwana'],
      'Agriculture': ['PM KISAN', 'Raitha Siri', 'Krishi Bhagya', 'Bhoochetana', 'Horticulture Mission'],
      'Water Resources': ['Upper Krishna', 'Cauvery Stage IV', 'Tungabhadra', 'Minor Irrigation', 'Lift Irrigation'],
      'Public Works': ['State Roads', 'NH Works', 'Bridges', 'Rural Roads PMGSY', 'Airport Road'],
      'Urban Development': ['BBMP Grants', 'Smart City Bengaluru', 'AMRUT', 'BWSSB', 'Metro Phase 2'],
      'Finance': ['Debt Repayment', 'Staff Pensions', 'Local Authority Grants', 'Fiscal Equalisation', 'Treasury'],
      'Home': ['Karnataka Police', 'Prisons', 'Fire Force', 'Traffic Management', 'Coastal Security'],
      'Energy': ['BESCOM Subsidy', 'HESCOM', 'Solar Mission', 'Wind Energy', 'Rural Electrification'],
      'Social Welfare': ['Sandhya Suraksha Pension', 'SC Sub-Plan', 'ST Sub-Plan', 'OBC Welfare', 'Minority Welfare'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 195000, tax_revenue: 135000, non_tax_revenue: 28000, grants_in_aid: 32000, capital_receipts: 68000, borrowings: 58000, total_expenditure: 270000, fiscal_deficit: 75000, revenue_deficit: 12000, outstanding_debt: 480000 },
      '2023-24': { revenue_receipts: 218000, tax_revenue: 152000, non_tax_revenue: 30000, grants_in_aid: 36000, capital_receipts: 75000, borrowings: 65000, total_expenditure: 300000, fiscal_deficit: 82000, revenue_deficit: 14000, outstanding_debt: 542000 },
      '2024-25': { revenue_receipts: 245000, tax_revenue: 172000, non_tax_revenue: 33000, grants_in_aid: 40000, capital_receipts: 82000, borrowings: 72000, total_expenditure: 335000, fiscal_deficit: 90000, revenue_deficit: 15000, outstanding_debt: 612000 },
    },
  },
  rajasthan: {
    name: 'Rajasthan',
    region: 'North',
    capital: 'Jaipur',
    base_multiplier: 1.0,
    departments: [
      { name: 'School Education', base_budget: 56280 },
      { name: 'Health & Medical', base_budget: 23955 },
      { name: 'Agriculture', base_budget: 20203 },
      { name: 'Water Resources', base_budget: 14431 },
      { name: 'Public Works', base_budget: 14431 },
      { name: 'Urban Development & Housing', base_budget: 14720 },
      { name: 'Finance', base_budget: 34635 },
      { name: 'Home', base_budget: 14431 },
      { name: 'Energy', base_budget: 26553 },
      { name: 'Social Justice & Empowerment', base_budget: 11545 },
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Mid Day Meal', 'Teacher Salaries', 'Rajasthan Free Uniform Scheme', 'Balika Durasth Shiksha'],
      'Health & Medical': ['Chiranjeevi Swasthya Bima', 'NHM', 'District Hospitals', 'PHC Upgrades', 'Mukhyamantri Nishulk Dawa'],
      'Agriculture': ['PM KISAN', 'Rajasthan Agriculture Credit', 'Mukhyamantri Krishak Sathi', 'Micro Irrigation', 'Horticulture Development'],
      'Water Resources': ['ERCP Eastern Rajasthan', 'Minor Irrigation', 'Drinking Water Projects', 'Indira Gandhi Canal', 'Lift Irrigation'],
      'Public Works': ['State Highways', 'Rural Roads PMGSY', 'Bridges', 'NH Works', 'Mukhyamantri Sadak'],
      'Urban Development & Housing': ['Smart City Jaipur', 'AMRUT', 'Urban Local Body Grants', 'PMAY Urban', 'Indira Rasoi Yojana'],
      'Finance': ['Debt Servicing', 'Pensions & Retirement', 'Local Body Grants', 'Old Age Pension', 'Treasury Operations'],
      'Home': ['Rajasthan Police', 'Prisons', 'Fire Services', 'Civil Defence', 'Vigilance'],
      'Energy': ['Mukhyamantri Kisan Mitra Urja', 'DISCOM Subsidy', 'Solar Energy Rajasthan', 'Rural Electrification', 'Renewables Mission'],
      'Social Justice & Empowerment': ['Palanhar Yojana', 'SC Sub-Plan', 'ST Sub-Plan', 'OBC Welfare', 'Vishesh Yogyajan Samman'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 210000, tax_revenue: 103000, non_tax_revenue: 14000, grants_in_aid: 93000, capital_receipts: 73000, borrowings: 68000, total_expenditure: 270000, fiscal_deficit: 56000, revenue_deficit: 20000, outstanding_debt: 540000 },
      '2023-24': { revenue_receipts: 238000, tax_revenue: 117000, non_tax_revenue: 16000, grants_in_aid: 105000, capital_receipts: 80000, borrowings: 75000, total_expenditure: 304000, fiscal_deficit: 63000, revenue_deficit: 23000, outstanding_debt: 610000 },
      '2024-25': { revenue_receipts: 264461, tax_revenue: 130000, non_tax_revenue: 18000, grants_in_aid: 116271, capital_receipts: 90000, borrowings: 84000, total_expenditure: 334796, fiscal_deficit: 70009, revenue_deficit: 25758, outstanding_debt: 680000 },
    },
  },
  'tamil-nadu': {
    name: 'Tamil Nadu',
    region: 'South',
    capital: 'Chennai',
    base_multiplier: 1.0,
    departments: [
      { name: 'School Education', base_budget: 48718 },
      { name: 'Health & Family Welfare', base_budget: 17780 },
      { name: 'Agriculture', base_budget: 19559 },
      { name: 'Water Resources', base_budget: 17425 },
      { name: 'Highways & Minor Ports', base_budget: 17425 },
      { name: 'Municipal Administration & Water Supply', base_budget: 19559 },
      { name: 'Finance', base_budget: 42672 },
      { name: 'Home', base_budget: 17780 },
      { name: 'Energy', base_budget: 19559 },
      { name: 'Social Welfare & Nutritious Meal', base_budget: 17780 },
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Chief Minister Breakfast Scheme', 'Teacher Salaries', 'Illam Thedi Kalvi', 'School Infrastructure'],
      'Health & Family Welfare': ['Makkalai Thedi Maruthuvam', 'CM Comprehensive Health Insurance', 'NHM', 'Government Hospitals', 'Siddha & Ayurveda'],
      'Agriculture': ['PM KISAN', 'Uzhavar Sandhai', 'Tamil Nadu Precision Farming', 'Crop Insurance', 'Horticulture Development'],
      'Water Resources': ['Cauvery Delta Development', 'Palar River', 'Minor Irrigation', 'Groundwater Management', 'Lift Irrigation Schemes'],
      'Highways & Minor Ports': ['State Highways Development', 'Rural Roads', 'Bridges', 'NH Works', 'Minor Ports Development'],
      'Municipal Administration & Water Supply': ['Chennai Metro Phase 2', 'AMRUT 2.0', 'Smart Cities', 'Municipal Grants', 'CMWSSB'],
      'Finance': ['Debt Servicing', 'Pension & Retirement', 'Local Body Devolution', 'Disaster Relief', 'Salary Commitments'],
      'Home': ['Tamil Nadu Police', 'Prisons', 'Fire & Rescue Services', 'Vigilance', 'Coastal Security'],
      'Energy': ['TANGEDCO Subsidy', 'Solar Mission', 'Wind Energy', 'Rural Electrification', 'Free Power to Farmers'],
      'Social Welfare & Nutritious Meal': ['Kalaignar Magalir Urimai Thittam', 'SC Sub-Plan', 'ST Sub-Plan', 'Women Welfare', 'Disability Welfare'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 240000, tax_revenue: 145000, non_tax_revenue: 28000, grants_in_aid: 67000, capital_receipts: 95000, borrowings: 88000, total_expenditure: 328000, fiscal_deficit: 82000, revenue_deficit: 18000, outstanding_debt: 680000 },
      '2023-24': { revenue_receipts: 273000, tax_revenue: 165000, non_tax_revenue: 31000, grants_in_aid: 77000, capital_receipts: 108000, borrowings: 100000, total_expenditure: 368000, fiscal_deficit: 95000, revenue_deficit: 22000, outstanding_debt: 775000 },
      '2024-25': { revenue_receipts: 296628, tax_revenue: 180000, non_tax_revenue: 33000, grants_in_aid: 83628, capital_receipts: 118000, borrowings: 110000, total_expenditure: 412504, fiscal_deficit: 107000, revenue_deficit: 25000, outstanding_debt: 880000 },
    },
  },
  gujarat: {
    name: 'Gujarat',
    region: 'West',
    capital: 'Gandhinagar',
    base_multiplier: 1.0,
    departments: [
      { name: 'Education', base_budget: 47512 },
      { name: 'Health & Family Welfare', base_budget: 17328 },
      { name: 'Agriculture & Co-operation', base_budget: 17241 },
      { name: 'Narmada Water Resources', base_budget: 15517 },
      { name: 'Roads & Buildings', base_budget: 14310 },
      { name: 'Urban Development & Urban Housing', base_budget: 17155 },
      { name: 'Finance', base_budget: 34345 },
      { name: 'Home', base_budget: 14310 },
      { name: 'Energy & Petrochemicals', base_budget: 22897 },
      { name: 'Social Justice & Empowerment', base_budget: 9109 },
    ],
    schemes: {
      'Education': ['Samagra Shiksha', 'Mid Day Meal', 'Vidya Sahayak', 'Mukhyamantri Gyanshakti', 'SC/ST Hostels'],
      'Health & Family Welfare': ['Mukhyamantri Amrutam', 'Ayushman Bharat', 'NHM', 'District Hospitals', 'Medical Colleges'],
      'Agriculture & Co-operation': ['PM KISAN', 'Kisan Suryodaya', 'Soil Health Cards', 'Micro Irrigation', 'Agricultural Infrastructure'],
      'Narmada Water Resources': ['Sardar Sarovar', 'Minor Irrigation', 'Sujalam Sufalam', 'Lift Irrigation', 'Groundwater Recharge'],
      'Roads & Buildings': ['State Highways', 'Rural Roads PMGSY', 'Bridges', 'NH Works', 'Urban Roads'],
      'Urban Development & Urban Housing': ['AMRUT 2.0', 'Smart City Surat & Ahmedabad', 'Metro Rail', 'PMAY Urban', 'Slum Development'],
      'Finance': ['Debt Servicing', 'Pensions', 'Local Body Grants', 'Disaster Relief', 'Treasury'],
      'Home': ['Gujarat Police', 'Prisons', 'Fire Services', 'Coastal Security', 'Home Guards'],
      'Energy & Petrochemicals': ['Kisan Suryodaya Solar', 'DISCOM Subsidy', 'Wind Energy', 'Rural Electrification', 'Renewables'],
      'Social Justice & Empowerment': ['Tribal Development', 'SC Sub-Plan', 'OBC Welfare', 'Disability Welfare', 'Women Empowerment'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 179000, tax_revenue: 132000, non_tax_revenue: 18000, grants_in_aid: 29000, capital_receipts: 72000, borrowings: 65000, total_expenditure: 246000, fiscal_deficit: 63000, revenue_deficit: 0, outstanding_debt: 430000 },
      '2023-24': { revenue_receipts: 205000, tax_revenue: 152000, non_tax_revenue: 20000, grants_in_aid: 33000, capital_receipts: 80000, borrowings: 72000, total_expenditure: 282000, fiscal_deficit: 72000, revenue_deficit: 0, outstanding_debt: 498000 },
      '2024-25': { revenue_receipts: 229653, tax_revenue: 168625, non_tax_revenue: 22000, grants_in_aid: 39028, capital_receipts: 91000, borrowings: 82000, total_expenditure: 332000, fiscal_deficit: 82000, revenue_deficit: 0, outstanding_debt: 578000 },
    },
  },
  'madhya-pradesh': {
    name: 'Madhya Pradesh',
    region: 'Central',
    capital: 'Bhopal',
    base_multiplier: 1.0,
    departments: [
      { name: 'School Education', base_budget: 45415 },
      { name: 'Health & Family Welfare', base_budget: 18486 },
      { name: 'Agriculture & Farmers Welfare', base_budget: 57418 },
      { name: 'Water Resources', base_budget: 15517 },
      { name: 'Public Works', base_budget: 16882 },
      { name: 'Urban Administration & Development', base_budget: 14434 },
      { name: 'Finance', base_budget: 33763 },
      { name: 'Home', base_budget: 14068 },
      { name: 'Energy', base_budget: 21665 },
      { name: 'Women & Child Development', base_budget: 22897 },
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Mid Day Meal', 'CM Rise Schools', 'Ladli Laxmi', 'SC/ST Hostels'],
      'Health & Family Welfare': ['Ayushman Bharat PM-JAY', 'NHM', 'District Hospitals', 'PHC Upgrades', 'Mukhyamantri Swasthya Seva'],
      'Agriculture & Farmers Welfare': ['PM KISAN', 'Mukhyamantri Kisan Kalyan', 'Soil Health', 'Crop Insurance PMFBY', 'Jal Jeevan Mission'],
      'Water Resources': ['Atal Bhujal Yojana', 'Ken Betwa Link', 'Minor Irrigation', 'Narmada Valley', 'Lift Irrigation'],
      'Public Works': ['State Highways', 'Rural Roads PMGSY', 'Bridges', 'NH Works', 'Urban Roads'],
      'Urban Administration & Development': ['Smart City Bhopal Indore', 'AMRUT 2.0', 'Metro Rail Bhopal', 'PMAY Urban', 'Municipal Grants'],
      'Finance': ['Debt Servicing', 'Pensions', 'Local Body Devolution', 'Sambal Yojana', 'General Administration'],
      'Home': ['MP Police', 'Prisons', 'Fire Services', 'Naxal Operations', 'Home Guards'],
      'Energy': ['DISCOM Subsidy', 'Solar Energy', 'Rural Electrification', 'Mukhyamantri Urja Sudhaar', 'Renewables'],
      'Women & Child Development': ['Ladli Bahna Yojana', 'ICDS', 'Anganwadi', 'Women Safety', 'CM Kanyadan Yojana'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 200000, tax_revenue: 95000, non_tax_revenue: 14000, grants_in_aid: 91000, capital_receipts: 62000, borrowings: 56000, total_expenditure: 258000, fiscal_deficit: 51000, revenue_deficit: 5000, outstanding_debt: 430000 },
      '2023-24': { revenue_receipts: 232000, tax_revenue: 110000, non_tax_revenue: 16000, grants_in_aid: 106000, capital_receipts: 72000, borrowings: 65000, total_expenditure: 300000, fiscal_deficit: 57000, revenue_deficit: 7000, outstanding_debt: 492000 },
      '2024-25': { revenue_receipts: 263817, tax_revenue: 125000, non_tax_revenue: 18000, grants_in_aid: 120817, capital_receipts: 84000, borrowings: 77000, total_expenditure: 326381, fiscal_deficit: 62564, revenue_deficit: 9000, outstanding_debt: 567000 },
    },
  },
  bihar: {
    name: 'Bihar',
    region: 'East',
    capital: 'Patna',
    base_multiplier: 1.0,
    departments: [
      { name: 'School Education', base_budget: 45378 },
      { name: 'Health', base_budget: 12872 },
      { name: 'Agriculture', base_budget: 11049 },
      { name: 'Road Construction', base_budget: 13133 },
      { name: 'Rural Development', base_budget: 12324 },
      { name: 'Urban Development & Housing', base_budget: 6629 },
      { name: 'Finance', base_budget: 26517 },
      { name: 'Home', base_budget: 14073 },
      { name: 'Energy', base_budget: 15472 },
      { name: 'Social Welfare', base_budget: 8839 },
    ],
    schemes: {
      'School Education': ['Samagra Shiksha', 'Mid Day Meal', 'Mukhyamantri Balika Cycle Yojana', 'Teacher Salaries', 'Bihar Student Credit Card'],
      'Health': ['Ayushman Bharat', 'NHM', 'District Hospitals', 'PHC Upgrades', 'Mukhyamantri Swasthya Seva Yojana'],
      'Agriculture': ['PM KISAN', 'Rajya Fasal Sahayata', 'Krishi Input Subsidy', 'Soil Health', 'Horticulture Mission'],
      'Road Construction': ['State Highways', 'Rural Roads PMGSY', 'Bridges & Flyovers', 'NH Bihar', 'Urban Roads'],
      'Rural Development': ['MGNREGS', 'PMAY Gramin', 'PMGSY', 'Jal Jeevan Mission', 'SBM Rural'],
      'Urban Development & Housing': ['Smart City Patna', 'AMRUT', 'Metro Rail Patna', 'PMAY Urban', 'Municipal Grants'],
      'Finance': ['Debt Servicing', 'Pensions', 'Local Body Grants', 'Disaster Relief SDRF', 'Treasury'],
      'Home': ['Bihar Police', 'Prisons', 'Fire Services', 'Home Guards', 'Vigilance'],
      'Energy': ['DISCOM Subsidy BSPHCL', 'Solar Energy', 'Har Ghar Bijli', 'Industrial Supply', 'Renewables'],
      'Social Welfare': ['Mukhyamantri Vridhjan Pension', 'SC Sub-Plan', 'ST Sub-Plan', 'Disability Welfare', 'Jeevikas SHG'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 175000, tax_revenue: 43000, non_tax_revenue: 6000, grants_in_aid: 126000, capital_receipts: 47000, borrowings: 42000, total_expenditure: 214000, fiscal_deficit: 28000, revenue_deficit: -8000, outstanding_debt: 280000 },
      '2023-24': { revenue_receipts: 205000, tax_revenue: 51000, non_tax_revenue: 7000, grants_in_aid: 147000, capital_receipts: 55000, borrowings: 50000, total_expenditure: 256000, fiscal_deficit: 28500, revenue_deficit: -5000, outstanding_debt: 323000 },
      '2024-25': { revenue_receipts: 226798, tax_revenue: 61626, non_tax_revenue: 8000, grants_in_aid: 157172, capital_receipts: 61000, borrowings: 57000, total_expenditure: 256333, fiscal_deficit: 29095, revenue_deficit: -1121, outstanding_debt: 367000 },
    },
  },
  odisha: {
    name: 'Odisha',
    region: 'East',
    capital: 'Bhubaneswar',
    base_multiplier: 1.0,
    departments: [
      { name: 'School & Mass Education', base_budget: 29194 },
      { name: 'Health & Family Welfare', base_budget: 18276 },
      { name: 'Agriculture & Farmers Empowerment', base_budget: 29241 },
      { name: 'Water Resources', base_budget: 11437 },
      { name: 'Works', base_budget: 10000 },
      { name: 'Housing & Urban Development', base_budget: 8410 },
      { name: 'Finance', base_budget: 21027 },
      { name: 'Home', base_budget: 10513 },
      { name: 'Energy', base_budget: 12616 },
      { name: 'Women & Child Development', base_budget: 8410 },
    ],
    schemes: {
      'School & Mass Education': ['Samagra Shiksha', 'Mid Day Meal', 'Teacher Salaries', 'MO School Abhiyan', 'SC/ST Hostels'],
      'Health & Family Welfare': ['Biju Swasthya Kalyan', 'Ayushman Bharat', 'NHM', 'District Hospitals', 'Niramaya'],
      'Agriculture & Farmers Empowerment': ['KALIA Scheme', 'PM KISAN', 'Crop Insurance PMFBY', 'Soil Health', 'Horticulture Mission'],
      'Water Resources': ['Hirakud Dam', 'Mahanadi Delta', 'Minor Irrigation', 'Lift Irrigation', 'Groundwater'],
      'Works': ['State Highways', 'Rural Roads PMGSY', 'Bridges', 'NH Works', 'Urban Roads'],
      'Housing & Urban Development': ['Smart City Bhubaneswar', 'AMRUT 2.0', 'PMAY Urban', 'Municipal Grants', 'Buxi Jagabandhu Scheme'],
      'Finance': ['Debt Servicing', 'Pensions', 'Local Body Grants', 'Disaster Relief SDRF', 'Treasury'],
      'Home': ['Odisha Police', 'Prisons', 'Fire Services', 'Home Guards', 'Coastal Security'],
      'Energy': ['DISCOM Subsidy', 'Solar Mission', 'Rural Electrification', 'Green Energy', 'Renewables'],
      'Women & Child Development': ['Mission Shakti', 'ICDS', 'Anganwadi', 'Mamata Scheme', 'Sukanya'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 150000, tax_revenue: 72000, non_tax_revenue: 22000, grants_in_aid: 56000, capital_receipts: 42000, borrowings: 37000, total_expenditure: 185000, fiscal_deficit: 27000, revenue_deficit: -22000, outstanding_debt: 235000 },
      '2023-24': { revenue_receipts: 175000, tax_revenue: 84000, non_tax_revenue: 25000, grants_in_aid: 66000, capital_receipts: 51000, borrowings: 45000, total_expenditure: 213000, fiscal_deficit: 30000, revenue_deficit: -25000, outstanding_debt: 272000 },
      '2024-25': { revenue_receipts: 211000, tax_revenue: 118000, non_tax_revenue: 27000, grants_in_aid: 66000, capital_receipts: 58000, borrowings: 51000, total_expenditure: 243908, fiscal_deficit: 32000, revenue_deficit: -27437, outstanding_debt: 308000 },
    },
  },
  central: {
    name: 'Union of India',
    region: 'Central',
    capital: 'New Delhi',
    base_multiplier: 20.0,
    departments: [
      { name: 'Defence', base_budget: 525000 },
      { name: 'Education', base_budget: 112000 },
      { name: 'Health & Family Welfare', base_budget: 86000 },
      { name: 'Agriculture & Farmers Welfare', base_budget: 125000 },
      { name: 'Railways', base_budget: 240000 },
      { name: 'Road Transport & Highways', base_budget: 195000 },
      { name: 'Finance (Transfers to States)', base_budget: 480000 },
      { name: 'Home Affairs', base_budget: 195000 },
      { name: 'Rural Development', base_budget: 175000 },
      { name: 'Urban Affairs', base_budget: 76000 },
    ],
    schemes: {
      'Defence': ['Army Modernisation', 'Navy Expansion', 'Air Force', 'DRDO R&D', 'Border Infrastructure'],
      'Education': ['PM SHRI Schools', 'Higher Education Grants', 'IITs & NITs', 'Skill India', 'Digital Education Mission'],
      'Health & Family Welfare': ['Ayushman Bharat PM-JAY', 'NHM', 'AIIMS New', 'Pradhan Mantri Swasthya', 'Cowin Vaccination'],
      'Agriculture & Farmers Welfare': ['PM KISAN', 'PMFBY Crop Insurance', 'e-NAM', 'Soil Health Cards', 'Agricultural Infrastructure Fund'],
      'Railways': ['New Lines', 'Vande Bharat', 'Station Redevelopment', 'Safety Works', 'Electrification'],
      'Road Transport & Highways': ['Bharatmala Phase 1', 'National Highways', 'PMGSY Rural Roads', 'Setu Bharatam Bridges', 'Expressways'],
      'Finance (Transfers to States)': ['Tax Devolution', 'Grants-in-Aid', 'SDRF Disaster', 'CSS Centrally Sponsored', 'Finance Commission'],
      'Home Affairs': ['CRPF BSF CISF', 'J&K Police', 'NIA', 'Border Infrastructure', 'Modernisation Police'],
      'Rural Development': ['MGNREGS', 'PMAY Rural', 'PMGSY', 'National Rural Livelihoods', 'Pradhan Mantri Gram Sadak'],
      'Urban Affairs': ['AMRUT 2.0', 'Smart Cities', 'PMAY Urban', 'Metro Rail', 'SBM Urban'],
    },
    fiscal: {
      '2022-23': { revenue_receipts: 2038000, tax_revenue: 1657000, non_tax_revenue: 381000, grants_in_aid: 0, capital_receipts: 1440000, borrowings: 1418000, total_expenditure: 4127000, fiscal_deficit: 2089000, revenue_deficit: 784000, outstanding_debt: 15500000 },
      '2023-24': { revenue_receipts: 2330000, tax_revenue: 1886000, non_tax_revenue: 444000, grants_in_aid: 0, capital_receipts: 1552000, borrowings: 1530000, total_expenditure: 4474000, fiscal_deficit: 2144000, revenue_deficit: 745000, outstanding_debt: 17200000 },
      '2024-25': { revenue_receipts: 2570000, tax_revenue: 2095000, non_tax_revenue: 475000, grants_in_aid: 0, capital_receipts: 1618000, borrowings: 1597000, total_expenditure: 4800000, fiscal_deficit: 2230000, revenue_deficit: 725000, outstanding_debt: 18900000 },
    },
  },
}

const YEAR_MULTIPLIER = { '2022-23': 1.0, '2023-24': 1.08, '2024-25': 1.16 }
const ACTUAL_RATIO = { '2022-23': 0.87, '2023-24': 0.79, '2024-25': 0 }

function rand(min, max) { return min + Math.random() * (max - min) }

async function seedState(stateCode, stateData) {
  console.log(`\n── Seeding ${stateData.name} (${stateCode}) ──`)
  const items = []
  const yearTotals = {}

  for (const year of YEARS) {
    yearTotals[year] = 0
    const mult = YEAR_MULTIPLIER[year]
    const actualRatio = ACTUAL_RATIO[year]

    for (const dept of stateData.departments) {
      const deptId = slugify(dept.name)
      const deptBudget = Math.round(dept.base_budget * mult)
      yearTotals[year] += deptBudget
      const schemes = stateData.schemes[dept.name] || []
      const schemeShare = deptBudget / (schemes.length || 1)

      // Department item
      items.push({
        PK: `STATE#${stateCode}#YEAR#${year}`,
        SK: `DEPT#${deptId}`,
        GSI1PK: `STATE#${stateCode}#DEPT#${deptId}`,
        GSI1SK: `YEAR#${year}`,
        entity_type: 'DEPARTMENT',
        updated_at: now,
        dept_id: deptId,
        name: dept.name,
        total_budget: deptBudget,
        year,
        state_code: stateCode,
      })

      // Scheme items
      for (const scheme of schemes) {
        const be = Math.round(schemeShare * rand(0.8, 1.2))
        const re = Math.round(be * rand(0.95, 1.05))
        const actuals = actualRatio === 0 ? 0 : Math.round(be * rand(actualRatio - 0.1, actualRatio + 0.1))
        const schemeId = slugify(scheme)
        items.push({
          PK: `STATE#${stateCode}#YEAR#${year}`,
          SK: `DEPT#${deptId}#SCHEME#${schemeId}`,
          GSI1PK: `STATE#${stateCode}#DEPT#${deptId}`,
          GSI1SK: `SCHEME#${schemeId}`,
          entity_type: 'ALLOCATION',
          updated_at: now,
          dept_id: deptId,
          dept_name: dept.name,
          scheme_name: scheme,
          budget_estimate: be,
          revised_estimate: re,
          actual_spent: actuals,
          source_url: `https://openbudgetsindia.org/dataset/${stateCode}-budget-${year}/resource/${stateCode}-budget-${year}.csv`,
          year,
          state_code: stateCode,
        })
      }
    }

    // Year summary item
    items.push({
      PK: `STATE#${stateCode}`,
      SK: `YEAR#${year}`,
      GSI1PK: `YEAR_INDEX`,
      GSI1SK: `STATE#${stateCode}#YEAR#${year}`,
      entity_type: 'YEAR_SUMMARY',
      updated_at: now,
      year,
      total_budget: yearTotals[year],
      ingested_at: now,
      state_code: stateCode,
    })

    // Fiscal health item
    const fh = stateData.fiscal[year]
    if (fh) {
      items.push({
        PK: `STATE#${stateCode}#YEAR#${year}`,
        SK: 'FISCAL#SUMMARY',
        GSI1PK: `FISCAL#${stateCode}`,
        GSI1SK: `YEAR#${year}`,
        entity_type: 'FISCAL_HEALTH',
        updated_at: now,
        state_code: stateCode,
        year,
        ...fh,
        source_url: 'https://rbi.org.in/Scripts/AnnualPublications.aspx?head=State+Finances',
      })
    }
  }

  // State index item
  items.push({
    PK: 'STATE_INDEX',
    SK: `STATE#${stateCode}`,
    entity_type: 'STATE_INDEX',
    updated_at: now,
    code: stateCode,
    name: stateData.name,
    region: stateData.region,
    capital: stateData.capital,
    has_data: true,
    latest_year: '2024-25',
    total_budget: yearTotals['2024-25'],
  })

  await batchWrite(items)
  for (const year of YEARS) console.log(`  ${year}: ₹${yearTotals[year].toLocaleString('en-IN')} crore`)
  console.log(`✓ ${stateData.name} complete — ${items.length} items written`)
}

async function main() {
  const statesToSeed = stateArg
    ? [stateArg].filter(s => STATES_DATA[s])
    : Object.keys(STATES_DATA)

  if (statesToSeed.length === 0) {
    console.error('Unknown state code. Valid options:', Object.keys(STATES_DATA).join(', '))
    process.exit(1)
  }

  for (const code of statesToSeed) {
    await seedState(code, STATES_DATA[code])
  }
  console.log('\n✅ Seed complete!')
}

main().catch(err => { console.error(err); process.exit(1) })
