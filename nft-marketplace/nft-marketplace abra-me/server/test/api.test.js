import { before, after, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import request from 'supertest'

// Os testes exigem um banco separado. Nunca execute a suíte contra o banco de desenvolvimento.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error('Defina TEST_DATABASE_URL apontando para um banco PostgreSQL exclusivo, por exemplo: postgres://kurio:senha@localhost:5432/kurio_test')
}
const testDb = new URL(process.env.TEST_DATABASE_URL)
if (!testDb.pathname.toLowerCase().includes('_test')) {
  throw new Error('Por segurança, o nome do banco em TEST_DATABASE_URL precisa conter _test.')
}
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
process.env.SESSION_SECRET ||= 'kurio-test-session-secret-with-more-than-32-characters'
process.env.FRONTEND_ORIGIN ||= 'http://localhost:5173'

const here = dirname(fileURLToPath(import.meta.url))
const { default: app, pool } = await import('../src/index.js')
const prefix = `test-${randomUUID()}`
const createdEmails = new Set()
const validPassword = 'SenhaSegura123!'

const userPayload = (overrides = {}) => ({
  username: 'Colecionador Teste',
  email: `${prefix}-${randomUUID()}@kurio.test`,
  password: validPassword,
  ...overrides,
})

const walletPayload = (overrides = {}) => ({
  displayName: 'Carteira de teste', nickname: 'MetaMask pessoal', network: 'Ethereum',
  profileName: 'Colecionador', address: '0x1234567890abcdef1234567890abcdef12345678',
  secondary: '', type: 'MetaMask', identification: 'principal',
  email: `${prefix}@kurio.test`, ens: '.eth', ...overrides,
})

async function register(agent, payload = userPayload()) {
  createdEmails.add(payload.email.toLowerCase())
  return agent.post('/api/auth/register').send(payload)
}

before(async () => {
  const schema = await readFile(resolve(here, '../sql/schema.sql'), 'utf8')
  await pool.query(schema)
  await pool.query(`CREATE TABLE IF NOT EXISTS user_sessions (sid varchar NOT NULL COLLATE "default", sess json NOT NULL, expire timestamp(6) NOT NULL, CONSTRAINT session_pkey PRIMARY KEY (sid))`)
})

after(async () => {
  if (createdEmails.size) {
    await pool.query('DELETE FROM users WHERE email = ANY($1::varchar[])', [[...createdEmails]])
  }
  await pool.end()
})

test('GET /api/health informa que a API está disponível', async () => {
  const response = await request(app).get('/api/health')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { status: 'ok', service: 'kurio-api' })
})

test('cadastro cria usuário, inicia sessão e não expõe hash da senha', async () => {
  const agent = request.agent(app)
  const payload = userPayload()
  const response = await register(agent, payload)
  assert.equal(response.status, 201)
  assert.equal(response.body.user.email, payload.email.toLowerCase())
  assert.equal('password_hash' in response.body.user, false)
  const me = await agent.get('/api/auth/me')
  assert.equal(me.status, 200)
  assert.equal(me.body.user.id, response.body.user.id)
  const stored = await pool.query('SELECT password_hash FROM users WHERE email=$1', [payload.email.toLowerCase()])
  assert.notEqual(stored.rows[0].password_hash, payload.password)
})

test('cadastro rejeita dados inválidos e e-mail duplicado', async () => {
  const agent = request.agent(app)
  const invalid = await agent.post('/api/auth/register').send({ username: 'A', email: 'email-invalido', password: '123' })
  assert.equal(invalid.status, 400)
  const payload = userPayload()
  const first = await register(agent, payload)
  assert.equal(first.status, 201)
  const duplicate = await agent.post('/api/auth/register').send(payload)
  assert.equal(duplicate.status, 409)
})

test('login aceita credenciais corretas e rejeita senha incorreta', async () => {
  const payload = userPayload()
  await register(request.agent(app), payload)
  const invalidAgent = request.agent(app)
  const invalid = await invalidAgent.post('/api/auth/login').send({ email: payload.email, password: 'senha-errada' })
  assert.equal(invalid.status, 401)
  const agent = request.agent(app)
  const login = await agent.post('/api/auth/login').send({ email: payload.email, password: payload.password })
  assert.equal(login.status, 200)
  assert.equal((await agent.get('/api/auth/me')).status, 200)
})

test('rotas privadas bloqueiam usuários sem sessão e logout encerra a sessão', async () => {
  const anonymous = request.agent(app)
  assert.equal((await anonymous.get('/api/auth/me')).status, 401)
  assert.equal((await anonymous.get('/api/profile')).status, 401)
  assert.equal((await anonymous.get('/api/wallets')).status, 401)

  const payload = userPayload()
  const agent = request.agent(app)
  await register(agent, payload)
  assert.equal((await agent.post('/api/auth/logout')).status, 204)
  assert.equal((await agent.get('/api/auth/me')).status, 401)
})

test('perfil pode ser criado e atualizado apenas pela sessão autenticada', async () => {
  const payload = userPayload()
  const agent = request.agent(app)
  await register(agent, payload)
  const profile = { displayName: 'Colecionador Kurio', username: 'kurio-user', email: payload.email, ensSuffix: '.eth', walletNickname: 'Minha carteira', avatar: '' }
  const saved = await agent.put('/api/profile').send(profile)
  assert.equal(saved.status, 200)
  assert.equal(saved.body.profile.displayName, profile.displayName)
  const read = await agent.get('/api/profile')
  assert.equal(read.status, 200)
  assert.equal(read.body.profile.username, profile.username)
  const invalid = await agent.put('/api/profile').send({ ...profile, email: 'inválido' })
  assert.equal(invalid.status, 400)
})

test('alteração de senha exige senha atual e permite novo login', async () => {
  const payload = userPayload()
  const agent = request.agent(app)
  await register(agent, payload)
  const wrong = await agent.put('/api/auth/password').send({ currentPassword: 'incorreta', newPassword: 'NovaSenhaSegura123!' })
  assert.equal(wrong.status, 400)
  const changed = await agent.put('/api/auth/password').send({ currentPassword: payload.password, newPassword: 'NovaSenhaSegura123!' })
  assert.equal(changed.status, 200)
  assert.equal((await agent.get('/api/auth/me')).status, 200)
  const oldLogin = await request(app).post('/api/auth/login').send({ email: payload.email, password: payload.password })
  assert.equal(oldLogin.status, 401)
  const newLogin = await request(app).post('/api/auth/login').send({ email: payload.email, password: 'NovaSenhaSegura123!' })
  assert.equal(newLogin.status, 200)
})

test('carteiras podem ser criadas, listadas e removidas sem permitir exclusão da principal', async () => {
  const payload = userPayload()
  const agent = request.agent(app)
  await register(agent, payload)
  const primary = await agent.post('/api/wallets').send({ ...walletPayload(), isPrimary: true })
  assert.equal(primary.status, 201)
  assert.equal(primary.body.wallet.isPrimary, true)
  const secondary = await agent.post('/api/wallets').send({ ...walletPayload({ nickname: 'Carteira secundária', address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' }), isPrimary: false })
  assert.equal(secondary.status, 201)
  const list = await agent.get('/api/wallets')
  assert.equal(list.status, 200)
  assert.equal(list.body.wallets.length, 2)
  const deletePrimary = await agent.delete(`/api/wallets/${primary.body.wallet.id}`)
  assert.equal(deletePrimary.status, 404)
  const deleteSecondary = await agent.delete(`/api/wallets/${secondary.body.wallet.id}`)
  assert.equal(deleteSecondary.status, 204)
  assert.equal((await agent.get('/api/wallets')).body.wallets.length, 1)
})

test('um usuário não consegue consultar ou remover carteira de outro usuário', async () => {
  const firstPayload = userPayload()
  const secondPayload = userPayload()
  const first = request.agent(app)
  const second = request.agent(app)
  await register(first, firstPayload)
  await register(second, secondPayload)
  const created = await first.post('/api/wallets').send(walletPayload())
  assert.equal(created.status, 201)
  const secondList = await second.get('/api/wallets')
  assert.equal(secondList.status, 200)
  assert.equal(secondList.body.wallets.length, 0)
  const forbiddenDelete = await second.delete(`/api/wallets/${created.body.wallet.id}`)
  assert.equal(forbiddenDelete.status, 404)
  assert.equal((await first.get('/api/wallets')).body.wallets.length, 1)
})
