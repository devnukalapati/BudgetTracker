import { z } from 'zod'

const EnvSchema = z.object({
  AWS_REGION: z.string().default('us-east-1'),
  DYNAMODB_ENDPOINT: z.string().optional(),
  DYNAMODB_TABLE: z.string().default('IndiaBudget'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function loadConfig() {
  const result = EnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error('Invalid environment configuration:', result.error.format())
    throw new Error('Missing or invalid environment variables. Check .env.local.')
  }
  return result.data
}

export const config = loadConfig()
