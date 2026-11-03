import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'
import bcrypt from 'bcryptjs'
import pg from 'pg'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { OAuth2Client } from 'google-auth-library'

const { Pool } = pg
const required = ['DATABASE_URL', 'SESSION_SECRET', 'FRONTEND_ORIGIN']
for (const key of required) if (!process.env[key]) throw new Error(`Variável obrigatória ausente: ${key}`)
if (process.env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET deve ter pelo menos 32 caracteres.')
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined })
export const app = express()
const PgSession = connectPgSimple(session)
const isProduction = process.env.NODE_ENV === 'production'

app.set('trust proxy', 1)
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_ORIGIN.split(',').map(v => v.trim()), credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(session({
  store: new PgSession({ pool, tableName: 'user_sessions', createTableIfMissing: true }),
  name: 'kurio.sid', secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 }
}))
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: process.env.NODE_ENV === 'test' ? 1000 : 10, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Muitas tentativas. Aguarde alguns minutos.' } })
const registerSchema = z.object({ username: z.string().trim().min(2).max(40), email: z.string().trim().email().max(254), password: z.string().min(10).max(72) })
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) })
const profileSchema = z.object({ displayName: z.string().trim().min(2).max(80), username: z.string().trim().min(2).max(40), email: z.string().trim().email().max(254), ensSuffix: z.string().max(20), walletNickname: z.string().max(60), avatar: z.string().max(500000).optional().default('') })
const walletSchema = z.object({ displayName: z.string().max(80), nickname: z.string().min(1).max(60), network: z.string().max(40), profileName: z.string().max(80), address: z.string().min(3).max(200), secondary: z.string().max(200), type: z.string().max(40), identification: z.string().max(100), email: z.string().email().max(254), ens: z.string().max(20) })
const safeUser = row => ({ id: row.id, username: row.username, email: row.email })
const requireAuth = (req, res, next) => req.session.userId ? next() : res.status(401).json({ error: 'Autenticação necessária.' })

const frontendUrl = (path = '/') => new URL(path, process.env.FRONTEND_ORIGIN.split(',')[0].trim()).toString()
const oauthErrorRedirect = (res, code) => res.redirect(frontendUrl(`/?oauth_error=${encodeURIComponent(code)}&open_login=1`))
const oauthProviders = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: () => process.env.GOOGLE_REDIRECT_URI || `http://localhost:${process.env.PORT || 3001}/api/auth/google/callback`,
  },
  facebook: {
    clientId: () => process.env.FACEBOOK_APP_ID,
    clientSecret: () => process.env.FACEBOOK_APP_SECRET,
    redirectUri: () => process.env.FACEBOOK_REDIRECT_URI || `http://localhost:${process.env.PORT || 3001}/api/auth/facebook/callback`,
  },
}

function providerReady(provider) {
  const config = oauthProviders[provider]
  return Boolean(config?.clientId() && config?.clientSecret())
}

async function startOAuth(req, res, provider) {
  if (!providerReady(provider)) return oauthErrorRedirect(res, 'provider_not_configured')
  const state = randomBytes(32).toString('hex')
  req.session.oauthState = { ...(req.session.oauthState || {}), [provider]: state }
  await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()))
  const config = oauthProviders[provider]
  const authUrl = provider === 'google'
    ? new URL('https://accounts.google.com/o/oauth2/v2/auth')
    : new URL(`https://www.facebook.com/${process.env.META_GRAPH_VERSION || 'v22.0'}/dialog/oauth`)
  authUrl.search = new URLSearchParams({
    client_id: config.clientId(),
    redirect_uri: config.redirectUri(),
    response_type: 'code',
    state,
    scope: provider === 'google' ? 'openid email profile' : 'email,public_profile',
  }).toString()
  if (provider === 'google') authUrl.searchParams.set('prompt', 'select_account')
  res.redirect(authUrl.toString())
}

async function exchangeOAuthCode(provider, code) {
  const config = oauthProviders[provider]
  const body = new URLSearchParams({
    code,
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    redirect_uri: config.redirectUri(),
    grant_type: 'authorization_code',
  })
  const tokenUrl = provider === 'google'
    ? 'https://oauth2.googleapis.com/token'
    : `https://graph.facebook.com/${process.env.META_GRAPH_VERSION || 'v22.0'}/oauth/access_token?${body.toString()}`
  const response = provider === 'google'
    ? await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body })
    : await fetch(tokenUrl, { method: 'GET' })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.access_token) throw new Error(`Não foi possível obter token do ${provider}.`)
  return data
}

async function fetchProviderProfile(provider, tokens) {
  if (provider === 'google') {
    const client = new OAuth2Client(oauthProviders.google.clientId())
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: oauthProviders.google.clientId() })
    const payload = ticket.getPayload()
    if (!payload?.sub || !payload.email || payload.email_verified !== true) throw new Error('O Google não retornou um e-mail verificado.')
    return { providerId: payload.sub, email: payload.email.toLowerCase(), username: payload.name || payload.given_name || payload.email.split('@')[0] }
  }
  const graphVersion = process.env.META_GRAPH_VERSION || 'v22.0'
  const url = new URL(`https://graph.facebook.com/${graphVersion}/me`)
  url.searchParams.set('fields', 'id,name,email')
  const response = await fetch(url, { headers: { Authorization: `Bearer ${tokens.access_token}` } })
  const profile = await response.json().catch(() => ({}))
  if (!response.ok || !profile.id || !profile.email) throw new Error('O Facebook não retornou um e-mail. Verifique a permissão email e a conta utilizada.')
  return { providerId: String(profile.id), email: String(profile.email).toLowerCase(), username: profile.name || String(profile.email).split('@')[0] }
}

async function authenticateOAuthUser(provider, profile) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const linked = await client.query('SELECT u.id,u.username,u.email FROM oauth_accounts oa JOIN users u ON u.id=oa.user_id WHERE oa.provider=$1 AND oa.provider_user_id=$2', [provider, profile.providerId])
    let user = linked.rows[0]
    if (!user) {
      const existing = await client.query('SELECT id,username,email FROM users WHERE email=$1', [profile.email])
      if (existing.rowCount) throw new Error('Este e-mail já possui cadastro por senha ou outro provedor. Entre com seu método original para evitar vinculação automática de contas.')
      const inserted = await client.query('INSERT INTO users(username,email,password_hash) VALUES($1,$2,NULL) RETURNING id,username,email', [String(profile.username).trim().slice(0,40) || profile.email.split('@')[0], profile.email])
      user = inserted.rows[0]
      await client.query('INSERT INTO oauth_accounts(user_id,provider,provider_user_id) VALUES($1,$2,$3)', [user.id, provider, profile.providerId])
    }
    await client.query('COMMIT')
    return user
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}

async function finishOAuth(req, res, provider) {
  const expectedState = req.session.oauthState?.[provider]
  const receivedState = String(req.query.state || '')
  if (req.session.oauthState) delete req.session.oauthState[provider]
  if (!expectedState || !receivedState || expectedState !== receivedState) {
    await new Promise(resolve => req.session.save(() => resolve()))
    return oauthErrorRedirect(res, 'invalid_state')
  }
  if (req.query.error) return oauthErrorRedirect(res, 'access_denied')
  try {
    if (!providerReady(provider)) return oauthErrorRedirect(res, 'provider_not_configured')
    const code = String(req.query.code || '')
    if (!code) return oauthErrorRedirect(res, 'missing_code')
    const tokens = await exchangeOAuthCode(provider, code)
    const profile = await fetchProviderProfile(provider, tokens)
    const user = await authenticateOAuthUser(provider, profile)
    await new Promise((resolve, reject) => req.session.regenerate(error => error ? reject(error) : resolve()))
    req.session.userId = user.id
    await new Promise((resolve, reject) => req.session.save(error => error ? reject(error) : resolve()))
    return res.redirect(frontendUrl('/?oauth=success'))
  } catch (error) {
    console.error(`OAuth ${provider}:`, error.message)
    return oauthErrorRedirect(res, error.message.includes('já possui cadastro') ? 'email_already_registered' : 'provider_auth_failed')
  }
}

app.get('/api/auth/google', (req, res, next) => startOAuth(req, res, 'google').catch(next))
app.get('/api/auth/google/callback', (req, res, next) => finishOAuth(req, res, 'google').catch(next))
app.get('/api/auth/facebook', (req, res, next) => startOAuth(req, res, 'facebook').catch(next))
app.get('/api/auth/facebook/callback', (req, res, next) => finishOAuth(req, res, 'facebook').catch(next))

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'kurio-api' }))
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Confira nome, e-mail e senha (mínimo de 10 caracteres).' })
    const { username, password } = parsed.data
    const email = parsed.data.email.toLowerCase()
    const hash = await bcrypt.hash(password, 12)
    const result = await pool.query('INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING id,username,email', [username, email, hash])
    req.session.userId = result.rows[0].id
    res.status(201).json({ user: safeUser(result.rows[0]) })
  } catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' }); next(error) }
})
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Informe um e-mail e senha válidos.' })
    const result = await pool.query('SELECT id,username,email,password_hash FROM users WHERE email=$1', [parsed.data.email.toLowerCase()])
    const user = result.rows[0]
    if (!user || !user.password_hash || !(await bcrypt.compare(parsed.data.password, user.password_hash))) return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    await new Promise((resolve, reject) => req.session.regenerate(err => err ? reject(err) : resolve()))
    req.session.userId = user.id
    res.json({ user: safeUser(user) })
  } catch (error) { next(error) }
})
app.post('/api/auth/logout', requireAuth, (req, res, next) => req.session.destroy(error => { if (error) return next(error); res.clearCookie('kurio.sid', { httpOnly: true, secure: isProduction, sameSite: 'lax' }); res.status(204).end() }))
app.get('/api/auth/me', requireAuth, async (req, res, next) => {
  try { const result = await pool.query('SELECT id,username,email FROM users WHERE id=$1', [req.session.userId]); if (!result.rowCount) return res.status(401).json({ error: 'Sessão inválida.' }); res.json({ user: safeUser(result.rows[0]) }) } catch (error) { next(error) }
})
app.get('/api/profile', requireAuth, async (req, res, next) => {
  try { const result = await pool.query('SELECT p.display_name AS "displayName", p.username, u.email, p.ens_suffix AS "ensSuffix", p.wallet_nickname AS "walletNickname", p.avatar FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=$1', [req.session.userId]); res.json({ profile: result.rows[0] ?? null }) } catch (error) { next(error) }
})
app.put('/api/profile', requireAuth, async (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados do perfil inválidos.' })
    const p = parsed.data
    await pool.query('UPDATE users SET email=$1, updated_at=NOW() WHERE id=$2', [p.email.toLowerCase(), req.session.userId])
    const result = await pool.query(`INSERT INTO profiles(user_id,display_name,username,ens_suffix,wallet_nickname,avatar) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET display_name=EXCLUDED.display_name, username=EXCLUDED.username, ens_suffix=EXCLUDED.ens_suffix, wallet_nickname=EXCLUDED.wallet_nickname, avatar=EXCLUDED.avatar, updated_at=NOW() RETURNING display_name AS "displayName",username,ens_suffix AS "ensSuffix",wallet_nickname AS "walletNickname",avatar`, [req.session.userId,p.displayName,p.username,p.ensSuffix,p.walletNickname,p.avatar])
    res.json({ profile: result.rows[0] })
  } catch (error) { next(error) }
})
app.put('/api/auth/password', requireAuth, async (req, res, next) => {
  try {
    const parsed = z.object({ currentPassword: z.string().min(1).max(72), newPassword: z.string().min(10).max(72) }).safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'A nova senha deve ter pelo menos 10 caracteres.' })
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.session.userId])
    if (!result.rowCount || !result.rows[0].password_hash || !(await bcrypt.compare(parsed.data.currentPassword, result.rows[0].password_hash))) return res.status(400).json({ error: 'A senha atual não confere.' })
    const hash = await bcrypt.hash(parsed.data.newPassword, 12)
    await pool.query('UPDATE users SET password_hash=$1,updated_at=NOW() WHERE id=$2', [hash,req.session.userId])
    const userId = req.session.userId
    req.session.regenerate(err => { if (err) return next(err); req.session.userId = userId; res.json({ message: 'Senha atualizada.' }) })
  } catch (error) { next(error) }
})
app.get('/api/wallets', requireAuth, async (req,res,next) => { try { const result = await pool.query('SELECT id,display_name AS "displayName",nickname,network,profile_name AS "profileName",address,secondary,wallet_type AS type,identification,email,ens,is_primary AS "isPrimary" FROM wallets WHERE user_id=$1 ORDER BY is_primary DESC,created_at', [req.session.userId]); res.json({ wallets: result.rows }) } catch(error) { next(error) } })
app.post('/api/wallets', requireAuth, async (req,res,next) => {
  try {
    const parsed = walletSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Dados da carteira inválidos.' })
    const w = parsed.data
    const sql = req.body.isPrimary === true
      ? 'INSERT INTO wallets(user_id,display_name,nickname,network,profile_name,address,secondary,wallet_type,identification,email,ens,is_primary) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,true) ON CONFLICT (user_id) WHERE is_primary=true DO UPDATE SET display_name=EXCLUDED.display_name,nickname=EXCLUDED.nickname,network=EXCLUDED.network,profile_name=EXCLUDED.profile_name,address=EXCLUDED.address,secondary=EXCLUDED.secondary,wallet_type=EXCLUDED.wallet_type,identification=EXCLUDED.identification,email=EXCLUDED.email,ens=EXCLUDED.ens RETURNING id,nickname,address,network,is_primary AS "isPrimary"'
      : 'INSERT INTO wallets(user_id,display_name,nickname,network,profile_name,address,secondary,wallet_type,identification,email,ens,is_primary) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false) RETURNING id,nickname,address,network,is_primary AS "isPrimary"'
    const result = await pool.query(sql, [req.session.userId,w.displayName,w.nickname,w.network,w.profileName,w.address,w.secondary,w.type,w.identification,w.email,w.ens])
    res.status(201).json({ wallet: result.rows[0] })
  } catch (error) { next(error) }
})
app.delete('/api/wallets/:id', requireAuth, async (req,res,next) => { try { const result=await pool.query('DELETE FROM wallets WHERE id=$1 AND user_id=$2 AND is_primary=false',[req.params.id,req.session.userId]); if(!result.rowCount) return res.status(404).json({error:'Carteira não encontrada.'}); res.status(204).end() } catch(error) { next(error) } })
app.use((error,_req,res,_next) => { console.error(error); res.status(500).json({ error: 'Erro interno. Tente novamente.' }) })
export default app

// Permite importar o app nos testes sem abrir uma porta HTTP.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT || 3001)
  app.listen(port, () => console.log(`Kurio API disponível na porta ${port}`))
}
