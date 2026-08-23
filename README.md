# Mural de Enquetes ao Vivo — Teste Técnico FantasyDraft

Aplicação full stack onde usuários criam enquetes e votam, com os resultados atualizando em tempo real na tela de todos os usuários conectados, sem necessidade de recarregar a página.

Desenvolvido como teste técnico para a vaga de Desenvolvedor(a) Full Stack Júnior na FantasyDraft.

## Stack

- **Backend:** Laravel 12 (PHP 8.3) + PostgreSQL
- **Frontend:** React 18 (Vite)
- **Tempo real:** Node.js + WebSocket (`ws`)
- **Autenticação:** Laravel Sanctum (sessão anônima)

## Arquitetura

React (localhost:5173)
│
├── HTTP/REST ──────────► Laravel API (backend.test)
│ │
│ ├──► PostgreSQL (Docker)
│ │
│ └──► HTTP interno ──► Node WS server (localhost:3001)
│ │
└── WebSocket ◄───────────────────────────────────────────┘


Fluxo de um voto:
1. O React envia o voto via REST para o Laravel.
2. O Laravel valida, salva no Postgres, e avisa o servidor Node via uma chamada HTTP interna.
3. O servidor Node retransmite a atualização via WebSocket para todos os clientes conectados naquela enquete.
4. Cada tela reage automaticamente, sem F5.

## Como rodar localmente

### Pré-requisitos

- PHP 8.3 (recomendo [Laravel Herd](https://herd.laravel.com), que já resolve PHP + Composer + servidor local)
- Node.js 20+
- Docker Desktop (para o PostgreSQL)

### 1. Clonar o repositório

```bash
git clone https://github.com/artursalesb/fantasydraft-teste-tecnico.git
cd fantasydraft-teste-tecnico
```

### 2. Subir o banco de dados

```bash
docker run --name enquetes-pg -e POSTGRES_USER=enquetes_user -e POSTGRES_PASSWORD=enquetes_pass -e POSTGRES_DB=enquetes -p 5432:5432 -d postgres:16
```

### 3. Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
```

Edita o `.env` e ajusta a seção de banco de dados:

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=enquetes
DB_USERNAME=enquetes_user
DB_PASSWORD=enquetes_pass

REALTIME_URL=http://localhost:3001


```bash
php artisan key:generate
php artisan migrate
herd link
```

Isso deixa o backend disponível em `http://backend.test`.

### 4. Servidor de tempo real (Node)

Em um novo terminal:

```bash
cd realtime
npm install
node index.js
```

Deve mostrar "Servidor realtime rodando na porta 3001".

### 5. Frontend (React)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acessa `http://localhost:5173`.

### Rodando os testes

```bash
cd backend
php artisan test
```

## Decisões de arquitetura

**Laravel 12 em vez de Laravel 11.** O enunciado pedia Laravel 11, mas o suporte a patches de segurança dessa versão encerrou em março de 2026. Como o Composer moderno bloqueia por padrão a instalação de pacotes com vulnerabilidades conhecidas sem correção disponível, optei por migrar para o Laravel 12 — mudança mínima de sintaxe, mesma stack, mas sem carregar uma dependência sem suporte de segurança para um repositório que fica público.

**Sessão anônima via Sanctum, token guardado no `localStorage`.** O teste não pede login/cadastro, mas exige rotas protegidas por `auth:sanctum`. A solução foi criar um usuário anônimo automaticamente na primeira visita e devolver um token, guardado no frontend. Sei que isso expõe o token a um risco de XSS (se um script malicioso for injetado na página, ele poderia ler o `localStorage`). Escolhi esse caminho por ser mais simples de implementar e depurar dentro do prazo, e porque os dados em jogo são de baixo risco (sessão anônima, sem senha ou dado sensível). Em um cenário de produção com dados sensíveis, eu usaria o modo SPA do Sanctum com cookies `httpOnly`, que não são acessíveis via JavaScript.

**Servidor Node separado para o WebSocket, em vez de Laravel Echo/Reverb.** Preferi um servidor Node simples e independente, que mantém as conexões WebSocket agrupadas por enquete e expõe um endpoint HTTP interno para o Laravel notificar. Isso evita depender de infraestrutura adicional (Redis, filas) para um escopo desse tamanho, mantendo o fluxo fácil de entender e depurar.

**Chamada ao servidor de tempo real protegida por try/catch com timeout.** Se o servidor Node estiver fora do ar, o voto ainda deve ser salvo com sucesso — o aviso em tempo real é um recurso complementar, não deve derrubar a funcionalidade principal.

**Todo o desenvolvimento em uma única branch (`main`).** Por ser um teste técnico de escopo pequeno, sem outros colaboradores trabalhando em paralelo, optei por commits sequenciais direto na branch principal. Em um projeto real, eu trabalharia com branches por feature (ex: `feature/votacao-tempo-real`), com Pull Requests para revisão antes do merge — inclusive quando a feature envolve mudanças em backend e frontend juntas, já que a divisão de branches costuma seguir a funcionalidade entregue, não a camada da arquitetura.

## Diferencial implementado

Escolhi **enquete encerrar automaticamente após um tempo definido pelo criador**. A validação real acontece no backend (comparando a hora atual do servidor com a data de expiração salva no banco), nunca confiando no relógio do navegador do cliente. O frontend mostra uma contagem regressiva e desabilita a votação automaticamente quando o tempo expira, via WebSocket, sem precisar de F5.

## O que eu faria diferente com mais tempo

- Migrar a autenticação para cookies `httpOnly` (Sanctum SPA mode), eliminando a exposição do token a XSS.
- Adicionar rate limiting nas rotas de criação de enquete e votação, hoje sem nenhuma proteção contra abuso.
- Implementar reconexão automática no hook de WebSocket — hoje, se o servidor Node cair e voltar, o cliente não tenta reconectar sozinho.
- Ampliar a cobertura de testes automatizados (hoje cobre só o cenário de voto duplicado; cobriria também criação de enquete e encerramento automático).

## Partes mais difíceis

- Vindo de um background majoritariamente Java/Spring Boot, o maior desafio foi me adaptar ao padrão Active Record do Eloquent (Models "sabem" se persistir sozinhos), diferente do Data Mapper do JPA/Hibernate, onde entidades são passivas e a persistência fica isolada em outra camada.
- Resolver o bloqueio do Composer 2.10 relacionado a advisories de segurança na instalação inicial do Laravel 11, que levou à decisão de migrar para o Laravel 12.

## Tempo gasto

Aproximadamente 10 horas.
