# Coding Standards

- Use TypeScript strict.
- Preferir imports absolutos com alias `@/` dentro de `src`.
- Manter regras de dominio puras em `src/lib` e cobertas por testes.
- Server actions ficam em arquivos com `'use server'`.
- Nao expor credenciais no cliente; usar `.env` e `.env.example`.
- Validar entradas de formulario com `zod`.
- Atualizar story em `docs/stories/` ao concluir mudancas.
