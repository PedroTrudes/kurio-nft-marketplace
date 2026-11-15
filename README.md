# Kurio — NFT Marketplace

Marketplace de NFTs desenvolvido para o desafio técnico de Frontend da Jungle Gaming. Permite explorar NFTs, pesquisar, filtrar, consultar detalhes, gerenciar o carrinho e simular compras.

**Demo:** https://kurio-nft-marketplace-five-delta.vercel.app/  
**Desafio:** https://github.com/junglegaming/frontend-challenge

> Demonstração técnica: APIs, autenticação, estoque e pedidos são simulados com MSW e armazenamento local. Não há pagamentos, blockchain ou backend reais.

## Stack

React 19, TypeScript 6, Vite 8, TanStack Router, TanStack Query, Axios, Tailwind CSS 4, shadcn/ui, Lucide React, Embla Carousel, MSW 3 e Playwright.

## Funcionalidades implementadas

- Catálogo de NFTs com busca, filtros por categoria e coleção, ordenação, abas e paginação; parâmetros de busca validados na URL.
- Página de detalhes dos NFTs.
- Cadastro, login, logout e recuperação de sessão simulada.
- Hashes de senha com PBKDF2/SHA-256 e salt individual; migração de cadastros legados.
- Carrinho com adição, remoção e alteração de quantidades.
- Checkout, criação de pedidos, chave de idempotência, validação de disponibilidade e confirmação da compra simulada.
- Verificação de autenticação e propriedade dos pedidos na API simulada.
- Interface responsiva e testes end-to-end dos fluxos principais.

## Como executar

**Pré-requisitos:** Node.js compatível com Vite 8 (20.19+ ou 22.12+) e npm.

```bash
git clone <URL_DO_REPOSITORIO>
cd kurio-nft-marketplace
npm ci
```

Crie `.env.local` na raiz:

```env
VITE_ENABLE_MOCKS=true
```

Inicie a aplicação:

```bash
npm run dev
```

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | TypeScript + build Vite |
| `npm run preview` | Visualização do build |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Testes Playwright |
| `npm run test:e2e:ui` | Interface Playwright |
| `npm run test:e2e:report` | Relatório Playwright |

Para instalar os navegadores de teste, caso necessário: `npx playwright install`.

## API simulada e persistência

O MSW intercepta as requisições HTTP do Axios. Os handlers são divididos em `auth.handlers.ts`, `nft.handlers.ts`, `cart.handlers.ts` e `order.handlers.ts`, dentro de `src/mocks/handlers/`.

O arquivo `public/mockServiceWorker.js` é servido com a aplicação. A variável `VITE_ENABLE_MOCKS=true` precisa estar definida **durante o build**, inclusive na Vercel.

Os dados simulados persistem no `localStorage`: **não são compartilhados entre navegadores ou dispositivos**. Limpar os dados do site pode remover contas, sessões, carrinhos e pedidos. A autenticação ocorre no cliente e **não é adequada para produção**. Utilize apenas credenciais fictícias.

## Rotas

| Caminho | Tela |
|---|---|
| `/` | Home e catálogo |
| `/nft/$nftId` | Detalhes de NFT |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/order/$orderId` | Confirmação |

## Testes

Os testes E2E estão organizados em `tests/e2e/catalog.spec.ts`, `cart.spec.ts` e `checkout.spec.ts`.

```bash
npm run lint
npm run build
npm run test:e2e
```

## Lighthouse

Auditoria realizada em **15/11/2026** na **página inicial publicada na Vercel**.

| Categoria | Desktop | Mobile |
|---|---:|---:|
| Performance | **100** | **96** |
| Accessibility | **96** | **96** |
| Best Practices | **100** | **100** |
| SEO | **83** | **83** |

As notas correspondem às execuções registradas, podem variar conforme o ambiente e **não representam auditoria de todas as rotas**. SEO permanece como oportunidade de melhoria.

## Deploy

Aplicação publicada na Vercel: https://kurio-nft-marketplace-five-delta.vercel.app/. O deploy utiliza build Vite (`dist/`), MSW habilitado e fallback para rotas SPA.

## Limitações e pendências

- **Socket.IO não implementado:** sem eventos `nft.updated`/`order.updated`, sincronização ou reconexão em tempo real. Foi identificado conflito de dependências entre MSW 3 e a versão avaliada de `@mswjs/socket.io-binding`.
- **Perfil e carteiras:** edição de perfil e gerenciamento de carteiras não concluídos.
- **Figma:** utilizado como referência; nem todos os detalhes visuais foram reproduzidos.
- **Testes:** cobertura E2E parcial dos cenários do enunciado.
- **Persistência:** simulação local sem backend, banco compartilhado ou controle real de concorrência.

## Arquitetura

Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para conhecer o fluxo de dados, decisões técnicas, trade-offs e limitações.
