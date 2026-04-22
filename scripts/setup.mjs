import { createHmac, randomBytes } from 'crypto'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')
const sqlPath = resolve(root, 'docker/db/zz-set-passwords.sql')

if (existsSync(envPath)) {
  console.log('.env already exists — skipping. Delete it and re-run to regenerate.')
  process.exit(0)
}

function makeJwt(payload, secret) {
  const h   = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const b   = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url')
  return `${h}.${b}.${sig}`
}

const pgPass    = randomBytes(32).toString('hex')
const jwtSecret = randomBytes(64).toString('hex')
const anonKey   = makeJwt({ role: 'anon',         iss: 'supabase', iat: 1613531985, exp: 4769205985 }, jwtSecret)
const svcKey    = makeJwt({ role: 'service_role', iss: 'supabase', iat: 1613531985, exp: 4769205985 }, jwtSecret)

// Write .env
writeFileSync(envPath, [
  'POSTGRES_PASSWORD=' + pgPass,
  'JWT_SECRET='        + jwtSecret,
  'ANON_KEY='          + anonKey,
  'SERVICE_ROLE_KEY='  + svcKey,
  '# ANTHROPIC_API_KEY=sk-ant-...',
].join('\n') + '\n')

// Patch docker/db/zz-set-passwords.sql — replace every PASSWORD '...' value
const sql = readFileSync(sqlPath, 'utf8')
const patched = sql.replace(/PASSWORD '[^']+'/g, `PASSWORD '${pgPass}'`)
writeFileSync(sqlPath, patched)

console.log('✓ .env created')
console.log('✓ docker/db/zz-set-passwords.sql updated')
console.log('\nNext steps:')
console.log('  docker compose up -d --build')
console.log('  open http://localhost:3000/auth/register')
