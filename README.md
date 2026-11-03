NFT Marketplace
Marketplace demonstrativo de NFTs com interface responsiva, catálogo de colecionáveis digitais, favoritos, carrinho, cupons promocionais, área do colecionador e API própria para autenticação e persistência de perfil/carteiras.
Estado do projeto: esta versão contém frontend React/TypeScript, API Node.js/Express, PostgreSQL, autenticação por e-mail/senha, estrutura OAuth para Google e Facebook e testes automatizados da API. O catálogo, preços, cupons e finalização de compra são demonstrativos. Não há pagamento real, mint, transferência de NFT ou transação blockchain.

Índice
- Tecnologias
- Funcionalidades
- Cupons para teste
- Estrutura do projeto
- Requisitos
- Instalação no Windows
- Configuração do banco de dados
- Configuração da API
- Execução do frontend
- Login com Google e Facebook
- Testes automatizados
- Rotas da API
- Responsividade
- Scripts disponíveis
- Segurança e limitações conhecidas
- Solução de problemas
Tecnologias
Frontend
- React 18
- TypeScript 5
- Vite 6
- CSS responsivo
- Lucide React (ícones)
- fetch para comunicação HTTP com a API
Backend
- Node.js (ES Modules)
- Express 4
- PostgreSQL 16
- pg para acesso ao banco
- express-session e connect-pg-simple para sessões persistidas no PostgreSQL
- bcryptjs para hash de senhas
- Zod para validação dos dados
- Helmet, CORS e Express Rate Limit para proteções adicionais
- google-auth-library para validação do ID Token do Google
Testes e ambiente
- Node.js Test Runner (node:test)
- Supertest
- Docker Compose para PostgreSQL de desenvolvimento e de testes
- ESLint e TypeScript para análise estática
Funcionalidades
Catálogo e descoberta
- Página inicial com catálogo demonstrativo de NFTs.
- Pesquisa por nome, número/edição e categoria.
- Filtros por categoria, rede e faixa de preço.
- Abas Todos os NFTs, Novos lançamentos e Em alta.
- Ordenação e paginação do catálogo.
- Cards com imagem, nome, edição, rede e preço em ETH.
- Página de detalhes com seleção de edição e quantidade.
Favoritos
- Adicionar e remover NFTs dos favoritos pelo ícone de coração.
- Visualização dos NFTs favoritados pelo acesso de favoritos.
- Favoritos armazenados no localStorage do navegador (kurio-favorites).
Carrinho e cupons
- Adicionar NFTs e edições ao carrinho.
- Alterar quantidade e remover itens.
- Visualizar subtotal, desconto e total.
- Persistência local do carrinho no navegador (kurio-cart).
- Aplicação de um cupom por vez; ao aplicar outro cupom válido, o desconto anterior é substituído.
Checkout demonstrativo
- Formulário de dados do colecionador e informações de carteira.
- Resumo dos NFTs e do desconto aplicado.
- Tela de confirmação com identificador demonstrativo do pedido.
- O botão de finalizar não realiza cobrança, não conecta MetaMask/WalletConnect e não envia transação à blockchain.
Conta e painel do colecionador
- Cadastro e login com e-mail e senha pela API.
- Logout e consulta da sessão atual.
- Painel protegido por autenticação.
- Consulta e atualização do perfil.
- Alteração de senha mediante validação da senha atual.
- Cadastro, consulta e remoção de carteiras secundárias.
- A carteira principal não pode ser removida pela rota de exclusão.
Login social
- Fluxo OAuth no backend para Google e Facebook.
- Validação do parâmetro state no callback.
- Verificação do ID Token do Google.
- Consulta do perfil do Facebook por meio da Graph API.
- Criação de sessão Kurio após autenticação bem-sucedida.
- Requer credenciais próprias dos provedores; veja Login com Google e Facebook.
Conteúdo e interface
- Identidade visual escura com tons de marrom e dourado/laranja.
- Seções editoriais e conteúdo demonstrativo sobre cultura digital/NFTs.
- Navegação adaptada para celular, tablet e desktop.
Cupons para teste
Os dois cupons abaixo estão habilitados no carrinho e no fluxo de checkout demonstrativo. Digite o código no campo Código promocional e clique em Aplicar.
Cupom	Desconto	Resultado esperado
KURIO10	10%	Aplica 10% de desconto sobre o subtotal dos itens no carrinho.
LANCAMENTO15	15%	Aplica 15% de desconto sobre o subtotal dos itens no carrinho.


Os códigos não diferenciam letras maiúsculas de minúsculas: por exemplo, kurio10 também é reconhecido. Apenas um cupom fica ativo por vez. Um código diferente dos dois acima exibe mensagem de código inválido ou expirado e zera o desconto aplicado.
Os cupons são regras demonstrativas implementadas no frontend. Eles não são validados por um serviço de promoções no backend e não representam descontos resgatáveis em uma venda real.

Estrutura do projeto
kurio-marketplace/
├── src/
│   ├── App.tsx              # Telas, estados e fluxos da aplicação
│   ├── api.ts               # Cliente HTTP para a API (fetch + cookie de sessão)
│   ├── main.tsx             # Inicialização React
│   └── styles.css           # Estilos globais e media queries responsivas
├── server/
│   ├── src/
│   │   └── index.js         # API Express, autenticação e OAuth
│   ├── sql/
│   │   ├── schema.sql       # Estrutura inicial do PostgreSQL
│   │   └── migrations/
│   │       └── 001_oauth_accounts.sql
│   ├── test/
│   │   └── api.test.js      # Testes de integração da API
│   ├── .env.example         # Modelo das variáveis da API
│   └── package.json
├── docker-compose.yml       # PostgreSQL de desenvolvimento e de testes
├── instalar-windows.ps1    # Instalação assistida no Windows
├── .env.example             # URL da API usada pelo frontend
├── package.json             # Scripts e dependências do frontend
└── README.md
Requisitos
- Windows 10/11, macOS ou Linux.
- Node.js 20 LTS ou superior (inclui npm).
- Docker Desktop com mecanismo Linux/WSL 2, ou PostgreSQL 16 instalado localmente.
- Navegador atualizado.
- Conexão com a internet para instalar dependências e carregar imagens externas do catálogo.
Verifique as versões:
node --version
npm --version
docker --version
docker compose version
Instalação no Windows
1. Extraia e abra a pasta correta
Extraia o ZIP e abra no VS Code a pasta que contém o package.json principal, docker-compose.yml e a pasta server.

No terminal do VS Code, confirme a pasta:
Get-ChildItem package.json, docker-compose.yml
Se o PowerShell informar que não encontrou package.json, você está na pasta errada. Use cd para entrar na pasta interna correta. Não execute npm install na pasta que contém somente o arquivo ZIP ou uma pasta externa de extração.
2. Instale as dependências
Na pasta raiz do projeto:
npm install --no-audit --no-fund
Depois instale as dependências da API:
cd server
npm install --no-audit --no-fund
cd ..
O frontend e o backend têm arquivos package.json independentes; por isso a instalação deve ser feita nos dois diretórios.

Opcionalmente, a partir da raiz, execute o instalador assistido:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\instalar-windows.ps1
O script verifica Node.js/npm e acesso HTTPS ao registro oficial do npm antes de instalar as dependências de server e da raiz.
Configuração do banco de dados
Opção A — Docker Desktop (recomendado)
1. Abra o Docker Desktop e aguarde o status de execução.
2. Na raiz do projeto, inicie o banco de desenvolvimento:
docker compose up -d postgres
3. Confira o container:
docker compose ps
O serviço postgres deve estar em execução e disponível na porta 5432. O banco é kurio, usuário kurio e senha local padrão kurio_dev_password, conforme o docker-compose.yml.

O schema é aplicado automaticamente quando o volume do PostgreSQL é criado pela primeira vez. Se você já tinha um volume de banco criado antes de uma atualização do schema, aplique a migração OAuth indicada abaixo.
Opção B — PostgreSQL instalado localmente
Instale PostgreSQL 16 e crie um banco, usuário e senha. Atualize DATABASE_URL no arquivo server/.env para apontar para a sua instalação. O schema está em server/sql/schema.sql e precisa ser aplicado ao banco antes de iniciar a API.
Migração OAuth em banco existente
Se o banco kurio já existia antes da etapa de login social, execute a migração uma vez na raiz do projeto:
docker compose exec -T postgres psql -U kurio -d kurio < server/sql/migrations/001_oauth_accounts.sql
A migração cria a tabela de associação de contas Google/Facebook. Não execute docker compose down -v em um banco com dados que deseja preservar: a opção -v remove os volumes e apaga os dados locais.
Configuração da API
1. Crie o arquivo de ambiente
No PowerShell, na raiz:
Copy-Item server/.env.example server/.env
Abra server/.env e configure:
NODE_ENV=development
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://kurio:kurio_dev_password@localhost:5432/kurio
DATABASE_SSL=false
SESSION_SECRET=SUBSTITUA_POR_UMA_CHAVE_ALEATORIA_COM_PELO_MENOS_32_CARACTERES
Gere uma chave aleatória no PowerShell, se necessário:
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
Copie o resultado para SESSION_SECRET. Não compartilhe esse valor.
2. Inicie a API
Em um terminal:
cd server
npm run dev
A API deverá iniciar na porta 3001. Teste no navegador:
http://localhost:3001/api/health
Resposta esperada:
{"status":"ok","service":"kurio-api"}
Mantenha esse terminal aberto enquanto utiliza o site.
Execução do frontend
1. Configure a URL da API
Na raiz, crie o arquivo .env:
Copy-Item .env.example .env
O conteúdo padrão é:
VITE_API_URL=http://localhost:3001/api
2. Inicie o Vite
Abra um segundo terminal na raiz do projeto:
npm run dev
O Vite normalmente disponibiliza o site em:
http://localhost:5173
Mantenha os terminais da API e do frontend abertos. Para parar cada processo, pressione Ctrl + C no terminal correspondente.
Login com Google e Facebook
O login social não funciona apenas com o botão na interface: é necessário registrar o aplicativo nos painéis oficiais e configurar credenciais válidas no servidor. Nunca coloque Client Secret ou App Secret no frontend.
Google
1. Acesse Google Cloud Console.
2. Crie ou selecione um projeto.
3. Configure a tela de consentimento OAuth e os usuários de teste, se o aplicativo estiver em modo de teste.
4. Crie uma credencial OAuth do tipo Aplicativo da Web.
5. Em URIs de redirecionamento autorizados, cadastre exatamente:
http://localhost:3001/api/auth/google/callback
6. Copie o Client ID e o Client Secret.
Facebook
1. Acesse Meta for Developers.
2. Crie ou selecione um aplicativo e adicione Facebook Login.
3. Configure a plataforma Web e habilite as opções de OAuth para Web apresentadas no painel.
4. Em Valid OAuth Redirect URIs, cadastre exatamente:
http://localhost:3001/api/auth/facebook/callback
5. Copie o App ID e App Secret. Garanta que a permissão email esteja disponível.
6. Em modo de desenvolvimento, o acesso pode ficar restrito a administradores, desenvolvedores e testadores cadastrados no aplicativo. A liberação pública pode exigir revisão e configurações adicionais da Meta.
Preencha as variáveis OAuth
No arquivo server/.env, configure:
GOOGLE_CLIENT_ID=SEU_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

FACEBOOK_APP_ID=SEU_APP_ID
FACEBOOK_APP_SECRET=SEU_APP_SECRET
FACEBOOK_REDIRECT_URI=http://localhost:3001/api/auth/facebook/callback
META_GRAPH_VERSION=v22.0
Reinicie a API depois de alterar o .env. O login Google exige e-mail verificado. O login Facebook depende de a plataforma retornar um endereço de e-mail para a conta e conceder a permissão correspondente.

Vinculação de contas: por segurança, o sistema não associa automaticamente uma conta social a uma conta local existente apenas porque os e-mails coincidem. Se o endereço já estiver cadastrado, o usuário deverá entrar pelo método original. A vinculação manual é uma funcionalidade futura.
Testes automatizados
A suíte usa node:test e Supertest e testa a API contra um banco PostgreSQL separado. Nunca configure TEST_DATABASE_URL para o banco de desenvolvimento ou produção. O teste exige que o nome do banco contenha _test.
1. Suba o PostgreSQL de testes
Na raiz do projeto:
docker compose --profile test up -d postgres-test
O banco de testes usa a porta 5433, banco kurio_test, usuário kurio e senha local kurio_test_password. Ele tem volume próprio, separado do banco de desenvolvimento.
2. Configure e rode os testes
cd server
$env:TEST_DATABASE_URL="postgres://kurio:kurio_test_password@localhost:5433/kurio_test"
npm test
Para modo watch:
npm run test:watch
A partir da raiz, também existe o atalho:
npm run test:api
Cobertura existente
- Health check da API.
- Cadastro válido, validação e e-mail duplicado.
- Login correto e senha incorreta.
- Proteção de rotas privadas e encerramento de sessão.
- Consulta e atualização de perfil.
- Alteração de senha e autenticação com a nova senha.
- Cadastro, listagem e remoção de carteiras.
- Isolamento de carteiras entre usuários.
A suíte cria os dados necessários e remove os usuários de teste ao final. Execute apenas contra o banco kurio_test.
Rotas da API
A URL base local é http://localhost:3001/api.
Método	Rota	Autenticação	Descrição
GET	/health	Não	Verifica disponibilidade da API.
POST	/auth/register	Não	Cria conta com nome, e-mail e senha (mínimo de 10 caracteres).
POST	/auth/login	Não	Autentica com e-mail e senha.
POST	/auth/logout	Sim	Encerra a sessão atual.
GET	/auth/me	Sim	Retorna o usuário da sessão.
GET	/profile	Sim	Consulta o perfil.
PUT	/profile	Sim	Cria ou atualiza os dados do perfil.
PUT	/auth/password	Sim	Altera a senha após validar a senha atual.
GET	/wallets	Sim	Lista as carteiras do usuário.
POST	/wallets	Sim	Cria ou atualiza carteira principal / adiciona carteira secundária conforme isPrimary.
DELETE	/wallets/:id	Sim	Remove carteira secundária pertencente ao usuário.
GET	/auth/google	Não	Inicia OAuth Google.
GET	/auth/google/callback	Não	Callback OAuth Google.
GET	/auth/facebook	Não	Inicia OAuth Facebook.
GET	/auth/facebook/callback	Não	Callback OAuth Facebook.


As rotas protegidas exigem o cookie de sessão emitido pela API. O frontend já utiliza credentials: 'include' nas chamadas HTTP.
Responsividade
- Celular (até 600 px): cabeçalho compacto com pesquisa, menu, banner adaptado, navegação inferior fixa, catálogo em duas colunas e ajustes específicos para detalhes do NFT, carrinho e autenticação.
- Tablet (acima de 600 px): mantém o layout intermediário/original.
- Desktop: mantém a composição ampla original.
Para testar no Chrome, abra o site, pressione F12 e depois Ctrl + Shift + M. Selecione larguras de 360 px, 390 px ou 430 px para conferir os principais formatos de celular. A barra de dispositivos do navegador simula a viewport, mas não substitui testes em aparelhos físicos.
Scripts disponíveis
Na raiz do projeto:
Comando	Função
npm run dev	Inicia o frontend Vite em desenvolvimento.
npm run build	Executa a verificação TypeScript e gera o build de produção.
npm run preview	Serve localmente o build de produção.
npm run typecheck	Verifica os tipos TypeScript.
npm run lint	Executa ESLint.
npm run dev:api	Inicia a API em modo watch.
npm run start:api	Inicia a API sem watch.
npm run test:api	Executa os testes da API.


Dentro de server:
Comando	Função
npm run dev	Inicia a API com node --watch.
npm start	Inicia a API normalmente.
npm test	Executa a suíte de testes.
npm run test:watch	Executa os testes em modo watch.


Segurança e limitações conhecidas
- Senhas locais são processadas no backend com bcrypt (custo 12); não são armazenadas em texto puro.
- Sessões são armazenadas no PostgreSQL e entregues por cookie HttpOnly, SameSite=Lax; em produção o cookie recebe Secure.
- O backend usa validação Zod, Helmet, CORS com origem configurada e limite de tentativas nas rotas de autenticação.
- O SESSION_SECRET deve ser único, aleatório e mantido fora do controle de versão.
- OAuth exige Client ID/Secret reais, configuração correta dos callbacks e autorização nas plataformas Google/Meta.
- O catálogo e os dados dos NFTs são estáticos/demonstrativos no frontend.
- Carrinho e favoritos são mantidos no localStorage do navegador; não são sincronizados entre dispositivos ou contas.
- O checkout gera uma confirmação demonstrativa. Não existe gateway de pagamento, custódia, mint, contrato inteligente ou transação Ethereum/Solana/Polygon integrada.
- Os cupons KURIO10 e LANCAMENTO15 são validados no frontend; em uma loja real, a regra deve ser validada no backend para evitar manipulação pelo navegador.
- Recuperação de senha por e-mail não está integrada a um serviço transacional.
- Não há vinculação manual de contas sociais a contas locais já existentes.
- Não há ainda testes E2E de navegador com Playwright nem auditoria Lighthouse nesta versão.
- Antes de produção, configure HTTPS, domínio e callbacks definitivos, NODE_ENV=production, SESSION_SECRET forte, política de privacidade, gestão segura de segredos, proteção CSRF apropriada ao domínio e revisão das regras comerciais/pagamentos.
Solução de problemas
npm informa ENOENT e não encontra package.json
O terminal está em uma pasta que não contém o manifesto do projeto. Entre na pasta principal (a que contém package.json e docker-compose.yml) e tente novamente:
Get-ChildItem package.json, docker-compose.yml
EBADPLATFORM / pacote inotify incompatível com Windows
O npm está tentando instalar um pacote específico de Linux no Windows. Primeiro identifique quem o solicita, sem forçar a instalação:
npm ls inotify --all
Execute na pasta em que o erro ocorreu. Confira também se está usando a versão atual do ZIP e se não está executando npm install em uma pasta antiga ou em um projeto diferente. Não use --force como correção permanente; isso pode deixar uma dependência incompatível instalada. Se a referência estiver em um lockfile antigo, compare com os package.json incluídos nesta versão antes de regenerar o lockfile.
docker não é reconhecido
Instale o Docker Desktop para Windows, habilite WSL 2 quando solicitado, conclua a instalação e abra um novo PowerShell. Teste:
docker --version
docker compose version
PostgreSQL não inicia ou a porta está ocupada
Confira os containers:
docker compose ps
Se outro PostgreSQL estiver usando a porta 5432, encerre o serviço conflitante ou altere o mapeamento de porta no docker-compose.yml e atualize DATABASE_URL no server/.env.
API não conecta ao banco
Confirme se o PostgreSQL está ativo, se DATABASE_URL corresponde às credenciais e à porta configuradas e se o arquivo server/.env existe. Reinicie a API após alterar variáveis de ambiente.
Login Google/Facebook retorna provider_not_configured
As credenciais do provedor estão ausentes ou incompletas no server/.env. Preencha Client ID/App ID e Secret, confirme o callback exato no painel do provedor e reinicie a API.
npm install falha ou excede o tempo
Verifique a conectividade com o registro oficial:
nslookup registry.npmjs.org
Test-NetConnection registry.npmjs.org -Port 443
npm ping --registry=https://registry.npmjs.org/
Se DNS resolver, mas a conexão TCP/HTTPS falhar, verifique firewall, proxy, VPN ou rede. Se npm ping funcionar, tente novamente dentro do diretório correto (server para a API e raiz para o frontend):
npm install --no-audit --no-fund
Não apague package-lock.json ou o cache como primeira medida e não use --force para contornar erros de plataforma.
Licença e uso
Projeto demonstrativo desenvolvido para avaliação e evolução de um marketplace de NFTs. Antes de publicar ou comercializar, revise direitos das imagens e conteúdos utilizados, termos dos provedores, privacidade, segurança, regras de pagamento e requisitos legais aplicáveis.
