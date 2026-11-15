# Arquitetura — Kurio NFT Marketplace

## 1. Visão geral

O Kurio é uma aplicação frontend de marketplace de NFTs construída com React, TypeScript e Vite. A entrega prioriza os fluxos de catálogo, autenticação, carrinho, checkout e pedidos, com comunicação REST simulada pelo **Mock Service Worker (MSW)**.

Não há backend real, banco de dados compartilhado, pagamentos ou integração blockchain.

## 2. Tecnologias e responsabilidades

| Tecnologia | Responsabilidade |
|---|---|
| React 19 + TypeScript 6 | Interface e contratos tipados |
| Vite 8 | Desenvolvimento e build |
| TanStack Router | Rotas e parâmetros de busca |
| TanStack Query | Cache, consultas e mutations |
| Axios | Comunicação HTTP |
| MSW 3 | API REST simulada |
| Tailwind CSS 4 + shadcn/ui | Interface responsiva |
| Playwright | Testes end-to-end |

A organização é **feature-based**, separando os domínios de autenticação, NFTs, carrinho e pedidos.

## 3. Fluxo de dados

```text
Usuário → Componente React → Hook / TanStack Query
                                 ↓
                           API / Axios
                                 ↓
                         Requisição HTTP
                                 ↓
                           Handler MSW
                                 ↓
                      Store / localStorage
                                 ↓
                Resposta HTTP → Cache → UI
```

Componentes apresentam dados e interações; hooks coordenam estado assíncrono; funções de API isolam HTTP; handlers e stores simulam validações e persistência.

## 4. Organização por domínio

```text
src/
├── features/
│   ├── auth/
│   ├── cart/
│   ├── nft/
│   └── order/
├── mocks/
│   ├── handlers/
│   │   ├── auth.handlers.ts
│   │   ├── cart.handlers.ts
│   │   ├── nft.handlers.ts
│   │   └── order.handlers.ts
│   ├── store/
│   └── utils/
└── pages/
```

A árvore acima representa os principais domínios e responsabilidades, não uma listagem exaustiva de arquivos. O registro central reúne `authHandlers`, `nftHandlers`, `cartHandlers` e `orderHandlers`.

## 5. Roteamento

O TanStack Router usa **configuração manual** (`createRootRoute`, `createRoute`, `createRouter`).

| Rota | Tela |
|---|---|
| `/` | Home e catálogo |
| `/nft/$nftId` | Detalhes de NFT |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/order/$orderId` | Confirmação |

A home valida `search`, `category`, `collection`, `sort`, `tab`, `page` e `limit`. Ordenações aceitas: `newest`, `price-asc`, `price-desc`, `name-asc`; abas: `all`, `new`, `trending`. Valores inválidos recebem defaults, `page` deve ser inteiro positivo e `limit` é 6.

**Decisão:** manter filtros na URL facilita compartilhamento, histórico e consistência da navegação.

## 6. Gerenciamento de estado

A aplicação separa:

- **Estado visual:** formulários, modais e controles locais, gerenciados com React.
- **Estado de navegação:** rotas e filtros, gerenciados pelo TanStack Router.
- **Estado assíncrono:** dados carregados, cache e mutations, gerenciados pelo TanStack Query.

O hook de autenticação usa `queryKey: ["auth", "me"]`, `staleTime: 60_000` e `retry: false`. O TanStack Query reduz a necessidade de implementar manualmente loading, cache e atualização em cada componente.

## 7. Axios e MSW

O Axios envia requisições HTTP e o MSW as intercepta no navegador, retornando respostas produzidas por handlers de domínio. Isso permite testar estados assíncronos e erros sem serviço externo, mantendo a interface desacoplada da implementação da API.

O service worker é disponibilizado em `public/mockServiceWorker.js`. `VITE_ENABLE_MOCKS=true` deve estar presente **durante o build** para ativar os mocks no deploy.

## 8. Persistência local

A demonstração utiliza `localStorage` para manter usuários, sessão e dados associados aos fluxos simulados de carrinho e pedidos.

**Trade-offs:** os dados ficam restritos ao navegador, não são sincronizados entre dispositivos, podem ser manipulados ou apagados e não possuem garantias transacionais. A solução não substitui backend e banco de dados.

## 9. Autenticação simulada

O `auth.store.ts` implementa cadastro, login, recuperação de usuário e logout. O cadastro valida username, e-mail, senha e confirmação; também impede duplicidade de e-mail e nome de usuário.

### Proteção das senhas

A Web Crypto API deriva hashes usando:

| Parâmetro | Valor |
|---|---|
| Algoritmo | PBKDF2 |
| Hash | SHA-256 |
| Iterações | 120.000 |
| Salt | 16 bytes aleatórios por usuário |
| Comprimento derivado | 256 bits |

O login recalcula o hash utilizando o salt salvo. Há migração de registros legados com senha em texto puro para `passwordHash` e `passwordSalt`.

### Sessão e autorização

A sessão simulada guarda usuário público e token aleatório. Endpoints privados validam a sessão e os pedidos possuem verificação de propriedade por usuário.

**Limitação de segurança:** a verificação acontece no cliente, cujo armazenamento pode ser manipulado. PBKDF2 evita persistir senhas em texto puro, mas não transforma a implementação em autenticação segura de produção. Use credenciais fictícias.

## 10. Carrinho, checkout e pedidos

```text
Catálogo → Detalhes → Carrinho → Checkout → Pedido → Confirmação
```

Os fluxos contemplam seleção de itens, alteração de quantidades, verificações simuladas de disponibilidade, autenticação, criação e consulta de pedidos e atualização simulada de estoque.

A criação de pedidos utiliza **chave de idempotência** para reduzir duplicidade em requisições repetidas. As consultas verificam se o pedido pertence ao usuário autenticado. Essas garantias são demonstrativas, pois executadas no navegador.

## 11. Interface e responsividade

O Figma orientou a hierarquia visual, a navegação e a apresentação dos NFTs. A interface utiliza Tailwind CSS, shadcn/ui e componentes reutilizáveis. Foram priorizados os fluxos funcionais; a fidelidade visual integral e telas secundárias ficaram pendentes.

## 12. Testes automatizados

A suíte Playwright inclui:

```text
tests/e2e/
├── catalog.spec.ts
├── cart.spec.ts
└── checkout.spec.ts
```

Comandos de verificação:

```bash
npm run lint
npm run build
npm run test:e2e
```

A cobertura contempla fluxos principais, não todos os cenários do enunciado.

## 13. Lighthouse

Auditoria da **home publicada na Vercel**, realizada em **15/11/2026**:

| Categoria | Desktop | Mobile |
|---|---:|---:|
| Performance | **100** | **96** |
| Accessibility | **96** | **96** |
| Best Practices | **100** | **100** |
| SEO | **83** | **83** |

Os resultados representam as execuções registradas, podem variar e não abrangem todas as rotas. O SEO permanece como oportunidade de melhoria.

## 14. Build e deploy

`npm run build` executa `tsc -b && vite build` e gera `dist/`. A aplicação está publicada na Vercel:

https://kurio-nft-marketplace-five-delta.vercel.app/

O deploy utiliza os mocks REST e fallback de navegação para as rotas SPA.

## 15. Decisões e trade-offs

| Decisão | Benefício | Limitação |
|---|---|---|
| Arquitetura por funcionalidades | Separação de responsabilidades | Mais módulos |
| TanStack Query | Cache e estado assíncrono centralizados | Requer invalidação consistente |
| TanStack Router | Navegação e buscas tipadas | Configuração explícita |
| MSW | Fluxos HTTP sem backend | Regras executadas no cliente |
| `localStorage` | Persistência simples para demo | Sem sincronização ou segurança real |
| Priorizar fluxos de compra | Entrega funcional integrada | Telas secundárias incompletas |

### Socket.IO

A integração em tempo real **não foi implementada**. Foi identificado conflito entre MSW 3 e a versão avaliada de `@mswjs/socket.io-binding`, e a decisão foi preservar os fluxos REST concluídos no prazo. Não há eventos `nft.updated` ou `order.updated`, sincronização ou reconexão WebSocket. Isso representa uma limitação relevante em relação ao desafio.

## 16. Pendências e evolução

| Funcionalidade | Estado |
|---|---|
| Perfil editável | Não implementado |
| Gerenciamento de carteiras | Não implementado |
| Socket.IO e eventos em tempo real | Não implementados |
| Reconexão WebSocket | Não implementada |
| Fidelidade integral ao Figma | Pendente |
| Cobertura E2E completa | Pendente |
| Auditoria Lighthouse da home | **Concluída** |
| Melhorias de SEO | Pendentes |

Evoluções possíveis: backend real, banco de dados, autenticação no servidor, Socket.IO, perfil/carteiras e ampliação dos testes.

## 17. Conclusão

O Kurio demonstra integração entre interface React, roteamento tipado, gerenciamento de estado assíncrono, cliente HTTP e APIs REST simuladas. A implementação priorizou lógica de negócio e fluxos completos de descoberta e compra, com transparência sobre as funcionalidades não concluídas.
