export interface StateInfo {
  code: string
  name: string
  region: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Union Territory'
  capital: string
}

export const STATES: StateInfo[] = [
  { code: 'central', name: 'Union of India', region: 'Central', capital: 'New Delhi' },
  { code: 'andhra-pradesh', name: 'Andhra Pradesh', region: 'South', capital: 'Amaravati' },
  { code: 'arunachal-pradesh', name: 'Arunachal Pradesh', region: 'Northeast', capital: 'Itanagar' },
  { code: 'assam', name: 'Assam', region: 'Northeast', capital: 'Dispur' },
  { code: 'bihar', name: 'Bihar', region: 'East', capital: 'Patna' },
  { code: 'chhattisgarh', name: 'Chhattisgarh', region: 'Central', capital: 'Raipur' },
  { code: 'goa', name: 'Goa', region: 'West', capital: 'Panaji' },
  { code: 'gujarat', name: 'Gujarat', region: 'West', capital: 'Gandhinagar' },
  { code: 'haryana', name: 'Haryana', region: 'North', capital: 'Chandigarh' },
  { code: 'himachal-pradesh', name: 'Himachal Pradesh', region: 'North', capital: 'Shimla' },
  { code: 'jharkhand', name: 'Jharkhand', region: 'East', capital: 'Ranchi' },
  { code: 'karnataka', name: 'Karnataka', region: 'South', capital: 'Bengaluru' },
  { code: 'kerala', name: 'Kerala', region: 'South', capital: 'Thiruvananthapuram' },
  { code: 'madhya-pradesh', name: 'Madhya Pradesh', region: 'Central', capital: 'Bhopal' },
  { code: 'maharashtra', name: 'Maharashtra', region: 'West', capital: 'Mumbai' },
  { code: 'manipur', name: 'Manipur', region: 'Northeast', capital: 'Imphal' },
  { code: 'meghalaya', name: 'Meghalaya', region: 'Northeast', capital: 'Shillong' },
  { code: 'mizoram', name: 'Mizoram', region: 'Northeast', capital: 'Aizawl' },
  { code: 'nagaland', name: 'Nagaland', region: 'Northeast', capital: 'Kohima' },
  { code: 'odisha', name: 'Odisha', region: 'East', capital: 'Bhubaneswar' },
  { code: 'punjab', name: 'Punjab', region: 'North', capital: 'Chandigarh' },
  { code: 'rajasthan', name: 'Rajasthan', region: 'North', capital: 'Jaipur' },
  { code: 'sikkim', name: 'Sikkim', region: 'Northeast', capital: 'Gangtok' },
  { code: 'tamil-nadu', name: 'Tamil Nadu', region: 'South', capital: 'Chennai' },
  { code: 'telangana', name: 'Telangana', region: 'South', capital: 'Hyderabad' },
  { code: 'tripura', name: 'Tripura', region: 'Northeast', capital: 'Agartala' },
  { code: 'uttar-pradesh', name: 'Uttar Pradesh', region: 'North', capital: 'Lucknow' },
  { code: 'uttarakhand', name: 'Uttarakhand', region: 'North', capital: 'Dehradun' },
  { code: 'west-bengal', name: 'West Bengal', region: 'East', capital: 'Kolkata' },
]

export const VALID_STATE_CODES = new Set(STATES.map(s => s.code))

export function getStateInfo(code: string): StateInfo | undefined {
  return STATES.find(s => s.code === code)
}
