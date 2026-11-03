# Kurio Marketplace

Marketplace demonstrativo de NFTs desenvolvido com React, TypeScript, Vite e CSS responsivo.

## Requisitos
- Node.js 20 ou superior
- npm

## Instalação e execução

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite (normalmente `http://localhost:5173`).

## Comandos

```bash
npm run build       # build de produção e verificação TypeScript
npm run preview     # pré-visualização do build
npm run typecheck   # verificação de tipos
npm run lint        # análise estática
```

## Funcionalidades disponíveis

- Página inicial com catálogo, filtros, ordenação e paginação demonstrativos.
- Página de detalhes do NFT com seleção de edição, quantidade, favoritos e compartilhamento.
- Carrinho integrado ao fluxo de compra: o botão **Comprar** adiciona o NFT selecionado e abre o carrinho.
- Carrinho com alteração de quantidade, remoção de itens, subtotal, cupom promocional e total.
- Persistência local do carrinho usando `localStorage` (`kurio-cart`).
- Cupons demonstrativos: `KURIO10` (10%) e `LANCAMENTO15` (15%).
- Layout responsivo para desktop, tablet e celular.

## Limitações da demonstração

Os dados do catálogo, avaliações, cupons e colecionadores são fictícios. O botão **Conectar e finalizar** ainda não realiza pagamento nem conecta uma carteira; a integração de checkout será implementada em uma etapa posterior. O carrinho persiste no navegador atual e não é sincronizado entre dispositivos ou usuários.

## Estrutura

```text
src/
  App.tsx       # páginas e fluxos da interface
  main.tsx      # ponto de entrada React
  styles.css    # identidade visual e responsividade
```

## Fluxo de perfil do colecionador

No carrinho, o botão **Conectar e finalizar** abre a etapa de perfil do colecionador. O formulário valida campos obrigatórios no navegador, permite selecionar rede e tipo de carteira, exibe os NFTs do carrinho e mantém o subtotal com o desconto promocional já aplicado. As opções de pagamento são demonstrativas; nenhuma carteira ou transação blockchain real é conectada nesta etapa.

Campos de endereço Ethereum aceitam o formato `0x` seguido de 40 caracteres hexadecimais. Cupons de demonstração: `KURIO10` e `LANCAMENTO15`.


### Confirmação de compra e autenticação (etapa 5)

- Confirmação com identificador demonstrativo, data, carteira selecionada, itens, quantidades e total calculado a partir do carrinho.
- Janela de autenticação sobre a página inicial com abas Entrar/Criar conta, alternância de visibilidade de senha e tela de recuperação de acesso.
- Ações Google/Facebook e recuperação de senha são estados demonstrativos; exigem OAuth e serviço de e-mail para funcionar de verdade.
- A confirmação não envia transação à Ethereum nem gera hash real de blockchain.


### Autenticação e painel (etapa 7)

- O botão ao lado do carrinho exibe **Entrar** quando não há sessão autenticada e **Meu perfil** quando existe uma sessão válida.
- O painel é protegido pela condição de sessão: sem autenticação, o acesso abre a janela de login em vez de exibir o painel.
- Cadastro e login funcionam em modo local demonstrativo. O cadastro armazena um hash SHA-256 da senha no `localStorage`; a sessão fica em `sessionStorage` e termina ao fechar a aba/navegador. A senha em texto puro não é persistida.
- A alteração de senha verifica a senha atual e compara a confirmação antes de atualizar o hash local.
- Dados do perfil e carteiras são persistidos no navegador. Não há sincronização entre dispositivos ou usuários.
- Para produção, substituir esse adaptador local por API HTTPS com autenticação no servidor, hash de senha com Argon2id/bcrypt, sessões seguras via cookie HttpOnly/SameSite, recuperação por token de uso único e OAuth real. SHA-256 no cliente é apenas demonstração e não substitui hash de senha no backend.
- Google/Facebook e envio de e-mail continuam sem integração externa; a interface informa essa limitação.

## Etapa 8 — API, PostgreSQL e autenticação no servidor

A autenticação local do navegador foi substituída por uma API Express e PostgreSQL. O navegador não guarda mais hash/senha nem decide sozinho se o usuário está autenticado. A sessão é mantida pelo servidor em PostgreSQL e identificada por cookie `HttpOnly`, `SameSite=Lax`; em produção o cookie usa `Secure`.

### Requisitos adicionais
- Node.js 20+
- Docker Desktop (ou PostgreSQL 16 instalado)

### Subir o banco
Na raiz do projeto:

```bash
docker compose up -d postgres
```

O schema inicial é aplicado automaticamente na primeira criação do volume.

### Configurar e iniciar a API

```bash
cd server
cp .env.example .env
```

Edite `server/.env` e substitua `SESSION_SECRET` por uma string aleatória com pelo menos 32 caracteres. Em seguida:

```bash
npm install
npm run dev
```

A API ficará em `http://localhost:3001`; verifique `http://localhost:3001/api/health`.

### Iniciar o frontend
Na raiz, crie `.env` a partir de `.env.example` e execute:

```bash
npm install
npm run dev
```

O frontend chama a API com `fetch` e `credentials: 'include'`. O endereço pode ser alterado em `VITE_API_URL`.

### Rotas implementadas
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- `PUT /api/auth/password` (verificação da senha atual; Argon2 não está instalado, usa bcrypt com fator 12).
- `GET/PUT /api/profile`.
- `GET/POST/DELETE /api/wallets` (carteira principal única e carteiras secundárias por usuário).
- `GET /api/health`.

### Segurança e limites desta etapa
- Senhas são processadas no backend com bcrypt; nunca são armazenadas em texto puro nem enviadas ao `localStorage`.
- Sessões ficam no PostgreSQL via `connect-pg-simple`; cookie `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- Validação de payloads com Zod, cabeçalhos com Helmet, CORS restrito à origem configurada e limite de tentativas nas rotas de autenticação.
- Configure HTTPS, `NODE_ENV=production`, `FRONTEND_ORIGIN` com o domínio real e `SESSION_SECRET` forte antes de publicar. Se frontend e API estiverem em sites diferentes, será necessário ajustar a estratégia de cookie/CORS e proteção CSRF para o domínio final.
- A recuperação de senha por e-mail, OAuth Google/Facebook, pagamentos e transações blockchain ainda não estão integrados. A tela de recuperação continua informando essa limitação.
- Os dados antigos que estavam no `localStorage` da etapa 7 não são migrados automaticamente. Cadastre uma conta novamente na API.
- O cadastro exige senha de pelo menos 10 caracteres. O PostgreSQL inicializa o schema somente ao criar o volume; para reinicializar o banco de desenvolvimento, use `docker compose down -v` (isso apaga os dados locais).

## Etapa 9 — testes automatizados da API

A suíte de integração usa `node:test` e `supertest` e valida os fluxos críticos de autenticação, sessão, perfil e carteiras diretamente contra PostgreSQL. Os testes usam um banco separado (`kurio_test`) e recusam executar se o nome do banco informado não contiver `_test`, para reduzir o risco de apagar dados de desenvolvimento.

### Preparar o banco exclusivo de testes

Na raiz do projeto, com Docker Desktop iniciado:

```powershell
docker compose --profile test up -d postgres-test
```

O banco de testes fica na porta `5433`; o banco de desenvolvimento continua na porta `5432`. Aguarde o container `postgres-test` ficar saudável.

### Instalar dependências e executar a suíte

```powershell
cd server
npm install
$env:TEST_DATABASE_URL="postgres://kurio:kurio_test_password@localhost:5433/kurio_test"
npm test
```

Para executar novamente os testes automaticamente após alterações:

```powershell
npm run test:watch
```

Também é possível executar a suíte a partir da raiz:

```powershell
npm run test:api
```

**Atenção:** a suíte cria as tabelas necessárias e remove os usuários de teste que ela própria cadastrou. Use exclusivamente o banco `kurio_test`; não configure `TEST_DATABASE_URL` com o banco real ou de desenvolvimento. O serviço de testes usa volume próprio (`kurio_test_pgdata`), separado do volume principal.

### Cobertura incluída

- Health check da API.
- Cadastro válido, validação e e-mail duplicado.
- Hash de senha e ausência de dados sensíveis na resposta.
- Login válido e inválido.
- Proteção de rotas privadas, logout e encerramento da sessão.
- Criação e leitura de perfil.
- Alteração de senha e autenticação com a nova senha.
- Cadastro, listagem e remoção de carteiras.
- Proteção contra exclusão da carteira principal e acesso cruzado entre usuários.

Os testes são de integração do backend. Ainda não substituem testes de interface no navegador (Playwright), testes de contrato com serviços externos ou testes de carga.

## Instalação assistida no Windows (etapa 9.1)

Na raiz do projeto, abra PowerShell e execute:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\instalar-windows.ps1
```

O script verifica Node.js/npm e testa o acesso ao registro oficial do npm antes de instalar separadamente as dependências da API e do frontend. Se a verificação de rede falhar, o problema é conectividade/DNS/proxy/firewall e não uma etapa do código. Os arquivos `.npmrc` reduzem operações auxiliares (audit/fund), desativam a barra de progresso e configuram tentativas e timeout de rede.

### Diagnóstico de falha de rede do npm

```powershell
nslookup registry.npmjs.org
npm ping --fetch-retries=0 --fetch-timeout=20000
```

Se `nslookup` falhar ou `npm ping` retornar `EAI_AGAIN`, corrija DNS/rede, desative temporariamente VPN/proxy corporativo se aplicável ou tente outra rede. Não apague `package-lock.json` nem o cache do npm como primeira tentativa. Depois repita `npm install --no-audit --no-fund` dentro de `server` e na raiz.


## Login social com Google e Facebook (etapa 12)

O login social usa OAuth 2.0 Authorization Code no backend. O frontend nunca recebe nem armazena client secrets ou tokens do provedor. O callback valida `state`, verifica o ID token do Google, consulta o perfil do Facebook e cria uma sessão Kurio no PostgreSQL.

### 1. Configure o Google

1. Acesse https://console.cloud.google.com/ e crie/selecione um projeto.
2. Configure a tela de consentimento OAuth e adicione os usuários de teste enquanto o app estiver em modo de teste.
3. Crie uma credencial OAuth do tipo **Aplicativo da Web**.
4. Em **URIs de redirecionamento autorizados**, adicione exatamente `http://localhost:3001/api/auth/google/callback`.
5. Copie o Client ID e Client Secret para `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` em `server/.env`.

### 2. Configure o Facebook

1. Acesse https://developers.facebook.com/ e crie/selecione um aplicativo.
2. Adicione o produto **Facebook Login** e configure a plataforma Web.
3. Ative o OAuth Client Login e Web OAuth Login, se apresentados no painel.
4. Em **Valid OAuth Redirect URIs**, adicione exatamente `http://localhost:3001/api/auth/facebook/callback`.
5. Copie o App ID e App Secret para `FACEBOOK_APP_ID` e `FACEBOOK_APP_SECRET` em `server/.env`.
6. Solicite a permissão `email` e mantenha o aplicativo em modo de desenvolvimento até concluir a revisão/publicação exigida pela Meta. Em modo de desenvolvimento, somente usuários/roles de teste autorizados conseguem entrar.

### 3. Variáveis e execução

Copie `server/.env.example` para `server/.env`, preencha as credenciais reais e mantenha `SESSION_SECRET` com pelo menos 32 caracteres aleatórios. Não compartilhe nem envie o arquivo `.env`; ele contém segredos.

Execute `docker compose up -d postgres`, depois `cd server; npm install; npm run dev`. Em outro terminal, na raiz, execute `npm install; npm run dev`. O schema `server/sql/schema.sql` cria a tabela `oauth_accounts`. Se o banco já existia, execute uma vez `server/sql/migrations/001_oauth_accounts.sql` no banco `kurio` (por exemplo, com `docker compose exec -T postgres psql -U kurio -d kurio < server/sql/migrations/001_oauth_accounts.sql`).

### Observações de segurança e funcionamento

- O cadastro social exige e-mail verificado do Google ou e-mail retornado pelo Facebook.
- Por segurança, o sistema não vincula automaticamente um login social a uma conta existente com o mesmo e-mail. O usuário deve entrar pelo método original; vinculação de contas será uma funcionalidade separada.
- Os provedores podem exigir HTTPS, domínio verificado, política de privacidade, URL de exclusão de dados e revisão antes de liberar usuários públicos. Em localhost, use apenas credenciais de desenvolvimento/teste.
- Em produção, configure HTTPS, URLs de callback de produção e `NODE_ENV=production` para cookies `Secure`.
- O login social não está operacional até que você crie as credenciais de cada provedor e as coloque no arquivo `server/.env`.
