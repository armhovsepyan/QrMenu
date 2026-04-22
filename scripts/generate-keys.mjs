// Generates POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY
// Usage: node scripts/generate-keys.mjs
// Then copy the output into your .env file.

import { createHmac, randomBytes } from 'crypto'

function makeJwt(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig    = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

const pgPass    = randomBytes(32).toString('hex')
const jwtSecret = randomBytes(64).toString('hex')
const anonKey   = makeJwt({ role: 'anon',         iss: 'supabase', iat: 1613531985, exp: 4769205985 }, jwtSecret)
const svcKey    = makeJwt({ role: 'service_role', iss: 'supabase', iat: 1613531985, exp: 4769205985 }, jwtSecret)

console.log('# Paste these values into your .env file\n')
console.log(`POSTGRES_PASSWORD=${pgPass}`)
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`ANON_KEY=${anonKey}`)
console.log(`SERVICE_ROLE_KEY=${svcKey}`)
