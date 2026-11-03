CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username VARCHAR(40) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE, password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Permite contas criadas por provedores OAuth, que não usam senha local.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(80) NOT NULL, username VARCHAR(40) NOT NULL,
  ens_suffix VARCHAR(20) NOT NULL DEFAULT '.eth', wallet_nickname VARCHAR(60) NOT NULL DEFAULT 'Minha carteira',
  avatar TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(80) NOT NULL DEFAULT '', nickname VARCHAR(60) NOT NULL,
  network VARCHAR(40) NOT NULL, profile_name VARCHAR(80) NOT NULL DEFAULT '', address VARCHAR(200) NOT NULL,
  secondary VARCHAR(200) NOT NULL DEFAULT '', wallet_type VARCHAR(40) NOT NULL,
  identification VARCHAR(100) NOT NULL DEFAULT '', email VARCHAR(254) NOT NULL, ens VARCHAR(20) NOT NULL DEFAULT '.eth',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wallets_user_id_idx ON wallets(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS wallets_one_primary_per_user ON wallets(user_id) WHERE is_primary=true;


-- Contas vinculadas por provedores OAuth (Google/Facebook).
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('google', 'facebook')),
  provider_user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_user_id),
  UNIQUE(user_id, provider)
);
CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts(user_id);
