# Bolao Rumo ao Hexa

Sistema web para gerenciar um bolao dos jogos do Brasil na Copa de 2026.

O projeto permite que participantes enviem palpites de placar, que o administrador cadastre jogos, registre resultados, valide pagamentos PIX e acompanhe ranking e premiacao.

## Stack

- Next.js 16
- React 19
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS
- Zod
- Vitest
- ESLint

## Funcionalidades

- Pagina inicial com valor de entrada, chave PIX, premiacao e jogos cadastrados.
- Envio publico de palpites em `/bet`.
- Ranking publico em `/ranking`.
- Login administrativo em `/admin/login`.
- Painel administrativo em `/admin`.
- Cadastro, edicao, exclusao e resultado de jogos em `/admin/matches`.
- Gestao de participantes e status de pagamento em `/admin/participants`.
- Ranking administrativo em `/admin/ranking`.
- Gestao de usuarios administradores em `/admin/users`.
- CLI de ranking com `npm run score`.

## Regras de Negocio

- O participante pode apostar em 1 ou mais jogos, sem precisar preencher todos.
- Cada jogo tem sua propria data limite de aposta.
- Depois da data limite de um jogo, novos palpites para ele nao sao aceitos.
- Um jogo escolhido precisa ter os dois placares preenchidos: Brasil e adversario.
- Palpites de jogos deixados totalmente em branco sao ignorados.
- Participantes sao identificados por email e telefone.
- Ao reenviar aposta com o mesmo email e telefone, os palpites dos jogos enviados sao atualizados.
- A premiacao considera apenas participantes com pagamento confirmado.

## Status

### Jogos

| Valor no banco | Label exibida | Uso |
| --- | --- | --- |
| `SCHEDULED` | Agendado | Jogo cadastrado e ainda disponivel conforme data limite |
| `CLOSED` | Fechado | Jogo fechado para novas apostas |
| `FINISHED` | Terminado | Jogo finalizado e pronto para pontuar ranking |

### Pagamentos

| Valor no banco | Label exibida | Uso |
| --- | --- | --- |
| `PENDING` | Pendente | Participante cadastrado, pagamento ainda nao validado |
| `PAID` | Pago | Pagamento confirmado pelo admin |
| `CANCELED` | Cancelado | Participacao cancelada |

## Pontuacao

- Placar exato: 10 pontos.
- Acerto de vencedor ou empate: 5 pontos.
- Acerto apenas dos gols do Brasil: 3 pontos.
- Acerto apenas dos gols do adversario: 3 pontos.

O ranking usa os seguintes criterios:

1. Maior pontuacao.
2. Mais placares exatos.
3. Mais acertos de vencedor ou empate.
4. Aposta mais antiga.

## Premiacao

A arrecadacao confirmada e calculada por:

```text
participantes pagos * valor de entrada
```

Distribuicao:

- 1o lugar: 70%.
- 2o lugar: 20%.
- 3o lugar: 10%.

## Estrutura do Projeto

```text
src/app/                 Rotas do App Router do Next.js
src/components/          Componentes compartilhados
src/lib/                 Regras de dominio, actions, sessao, prisma e formatadores
prisma/                  Schema e migrations do banco
scripts/                 Seeds e comandos CLI
tests/                   Testes unitarios
docs/stories/            Story principal e registro de desenvolvimento
```

## Requisitos Locais

- Node.js compativel com Next.js 16.
- npm.
- MySQL acessivel localmente ou via container/servico.
- Arquivo `.env` configurado a partir de `.env.example`.

## Configuracao de Ambiente

Crie um arquivo `.env` na raiz do projeto com os valores do seu ambiente:

```env
DATABASE_URL="mysql://root:password@localhost:3306/bolaocopa_2026"
SESSION_SECRET="change-me-to-a-long-random-secret"
ADMIN_SEED_NAME="Administrador"
ADMIN_SEED_EMAIL="admin@example.com"
ADMIN_SEED_PASSWORD="change-me"
POOL_TITLE="Bolao Rumo ao Hexa"
ENTRY_FEE_CENTS=1000
PIX_KEY="61993043994"
APP_TIMEZONE="America/Sao_Paulo"
```

Variaveis principais:

- `DATABASE_URL`: conexao MySQL usada pelo Prisma.
- `SESSION_SECRET`: segredo para assinatura da sessao administrativa.
- `ADMIN_SEED_NAME`: nome do admin criado pelo seed.
- `ADMIN_SEED_EMAIL`: email de login do admin criado pelo seed.
- `ADMIN_SEED_PASSWORD`: senha do admin criado pelo seed.
- `POOL_TITLE`: nome exibido no app.
- `ENTRY_FEE_CENTS`: valor da entrada em centavos.
- `PIX_KEY`: chave PIX exibida aos participantes.
- `APP_TIMEZONE`: timezone usado na formatacao das datas.

## Passo a Passo Local

1. Instale as dependencias:

```bash
npm install
```

2. Gere o Prisma Client:

```bash
npm run db:generate
```

3. Execute as migrations:

```bash
npm run db:migrate
```

4. Crie o usuario administrador inicial:

```bash
npm run db:seed-admin
```

5. Cadastre os jogos iniciais:

```bash
npm run db:seed-matches
```

6. Inicie a aplicacao:

```bash
npm run dev
```

Depois disso, acesse:

- App publico: `http://localhost:3000`
- Admin: `http://localhost:3000/admin/login`

## Fluxo de Uso

### Participante

1. Acessa `/bet`.
2. Informa nome, email e telefone.
3. Preenche palpites para um ou mais jogos ainda abertos.
4. Envia a aposta.
5. Realiza pagamento via PIX.
6. Aguarda validacao do admin.

### Administrador

1. Acessa `/admin/login`.
2. Usa o email e senha configurados no seed.
3. Cadastra ou edita jogos em `/admin/matches`.
4. Registra resultados dos jogos finalizados.
5. Valida pagamentos em `/admin/participants`.
6. Acompanha ranking e premiacao.

## Comandos Disponiveis

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor local do Next.js |
| `npm run build` | Gera build de producao |
| `npm run lint` | Executa ESLint |
| `npm run typecheck` | Executa checagem TypeScript |
| `npm test` | Executa testes unitarios com Vitest |
| `npm run db:generate` | Gera Prisma Client |
| `npm run db:migrate` | Executa migrations em modo desenvolvimento |
| `npm run db:seed-admin` | Cria usuario admin inicial |
| `npm run db:seed-matches` | Cria jogos iniciais |
| `npm run score` | Exibe ranking e premiacao no terminal |

## Qualidade

Antes de concluir alteracoes no projeto, rode:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Modelo de Dados

Principais entidades:

- `AdminUser`: usuarios administrativos.
- `Participant`: participantes do bolao.
- `Match`: jogos do Brasil.
- `Bet`: palpites por participante e jogo.

Relacionamentos importantes:

- Um participante pode ter varias apostas.
- Um jogo pode ter varias apostas.
- Cada participante pode ter apenas uma aposta por jogo.
- Ao excluir um participante ou jogo, as apostas relacionadas sao removidas por cascade.

## Observacoes de Implementacao

- O projeto usa Server Actions para submissao de apostas e acoes administrativas.
- O ranking e calculado em `src/lib/scoring.ts`.
- Os dados de ranking e premiacao sao agregados em `src/lib/ranking-data.ts`.
- A sessao administrativa usa cookie HTTP-only assinado.
- Senhas de administradores sao armazenadas com hash.
- Datas sao formatadas considerando `APP_TIMEZONE`.

## Boas Praticas no Projeto

- Use imports absolutos com `@/`.
- Mantenha regras de dominio em `src/lib`.
- Evite duplicar regras de pontuacao fora de `src/lib/scoring.ts`.
- Ao alterar comportamento de ranking ou premiacao, atualize ou adicione testes em `tests/`.
- Ao concluir uma story, atualize o registro em `docs/stories/`.
