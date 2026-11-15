# Kurio — NFT Marketplace

Marketplace de NFTs desenvolvido para o desafio técnico de Frontend da **Jungle Gaming**. A aplicação permite explorar NFTs, pesquisar e filtrar itens, consultar seus detalhes, gerenciar um carrinho e simular compras.

**Aplicação publicada:** https://kurio-nft-marketplace-five-delta.vercel.app/  
**Repositório:** https://github.com/PedroTrudes/kurio-nft-marketplace  
**Desafio original:** https://github.com/junglegaming/frontend-challenge

> **Projeto demonstrativo:** as APIs, a autenticação, o estoque e os pedidos são simulados com Mock Service Worker (MSW) e armazenamento local. Não há integração com blockchain, processamento de pagamentos ou backend real.

## Tecnologias

| Tecnologia | Utilização |
| --- | --- |
| React 19 e TypeScript 6 | Interface e tipagem |
| Vite 8 | Desenvolvimento e build |
| TanStack Router | Navegação e parâmetros de URL |
| TanStack Query | Consultas, mutations e cache |
| Axios | Comunicação HTTP |
| Tailwind CSS 4 e shadcn/ui | Estilização e componentes |
| Lucide React e Embla Carousel | Ícones e carrosséis |
| MSW 3 | API REST simulada |
| Playwright | Testes end-to-end |
| Docker e Nginx | Execução opcional do build em container |

## Funcionalidades implementadas

- **Catálogo de NFTs:** listagem, busca, filtros por categoria e coleção, ordenação, abas e paginação, com parâmetros validados na URL.
- **Detalhes:** página específica para cada NFT.
- **Autenticação simulada:** cadastro, login, logout e recuperação de sessão.
- **Proteção de senhas:** PBKDF2/SHA-256 com salt individual e migração de cadastros legados.
- **Carrinho:** adição, remoção e alteração de quantidades.
- **Checkout e pedidos:** validação simulada de disponibilidade, criação de pedidos com chave de idempotência e confirmação de compra.
- **Isolamento de dados:** verificação de autenticação e propriedade dos pedidos nos handlers simulados.
- **Interface responsiva** e **testes E2E** dos fluxos principais.

## Como executar

Você pode executar a aplicação com **Node.js** ou com **Docker**.

### Opção 1 — Node.js

**Pré-requisitos:** Node.js compatível com Vite 8 (20.19+ ou 22.12+) e npm.

Clone o projeto e instale as dependências:

```bash
git clone https://github.com/PedroTrudes/kurio-nft-marketplace.git
cd kurio-nft-marketplace
npm ci
```

Crie o arquivo `.env.local` na raiz do projeto:

```env
VITE_ENABLE_MOCKS=true
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra o endereço exibido pelo Vite no terminal.

### Opção 2 — Docker

**Pré-requisito:** Docker instalado e em execução. Não é necessário instalar Node.js localmente.

> Esta opção requer os arquivos `Dockerfile`, `nginx.conf` e `.dockerignore` na raiz do repositório. Ela deve ser utilizada depois de adicionados e validados esses arquivos.

Clone o repositório e acesse a pasta:

```bash
git clone https://github.com/PedroTrudes/kurio-nft-marketplace.git
cd kurio-nft-marketplace
```

Construa a imagem:

```bash
docker build -t kurio-marketplace .
```

Execute o container:

```bash
docker run --rm -p 8080:80 --name kurio kurio-marketplace
```

Acesse **http://localhost:8080**.

A imagem utiliza um **build multi-stage**: o Node.js compila a aplicação Vite, e o Nginx serve os arquivos estáticos gerados. O MSW é habilitado durante o build da imagem, permitindo executar os fluxos REST simulados sem backend externo.

Para encerrar o container em primeiro plano, pressione `Ctrl+C`. O parâmetro `--rm` remove o container quando ele é encerrado.

### Scripts disponíveis

| Comando | Função |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Verificação TypeScript e build Vite |
| `npm run preview` | Pré-visualização do build |
| `npm run lint` | Análise de código com ESLint |
| `npm run test:e2e` | Testes Playwright |
| `npm run test:e2e:ui` | Interface visual do Playwright |
| `npm run test:e2e:report` | Relatório dos testes |

Para instalar os navegadores utilizados pelo Playwright, se necessário:

```bash
npx playwright install
```

## API simulada e persistência

O MSW intercepta as requisições HTTP realizadas pelo Axios. Os handlers estão organizados em:

```text
src/mocks/handlers/
├── auth.handlers.ts
├── nft.handlers.ts
├── cart.handlers.ts
└── order.handlers.ts
```

O arquivo `public/mockServiceWorker.js` é distribuído com a aplicação. A variável `VITE_ENABLE_MOCKS=true` deve estar definida **durante o build** nas execuções de produção, inclusive na Vercel e na imagem Docker.

Os dados simulados utilizam `localStorage`, portanto **não são compartilhados entre navegadores ou dispositivos**. A limpeza dos dados do site pode remover contas, sessões, carrinhos e pedidos.

**Segurança:** toda a autenticação ocorre no cliente e não é adequada para produção. Utilize somente credenciais fictícias.

## Rotas

| Caminho | Tela |
| --- | --- |
| `/` | Página inicial e catálogo |
| `/nft/$nftId` | Detalhes de NFT |
| `/cart` | Carrinho |
| `/checkout` | Checkout |
| `/order/$orderId` | Confirmação do pedido |

A configuração do Nginx deve oferecer fallback para `index.html` nas rotas internas da aplicação SPA.

## Testes

Os testes end-to-end utilizam Playwright e estão organizados em:

```text
tests/e2e/
├── catalog.spec.ts
├── cart.spec.ts
└── checkout.spec.ts
```

Execute as verificações antes de publicar alterações:

```bash
npm run lint
npm run build
npm run test:e2e
```

A suíte cobre os fluxos principais, mas não todos os cenários previstos no desafio.

## Lighthouse

Auditoria realizada em **15/11/2026**, na **página inicial publicada na Vercel**.

| Categoria | Desktop | Mobile |
| --- | ---: | ---: |
| Performance | **100** | **96** |
| Accessibility | **96** | **96** |
| Best Practices | **100** | **100** |
| SEO | **83** | **83** |

As notas correspondem às execuções registradas, podem variar conforme as condições da auditoria e **não representam a avaliação de todas as rotas**. O SEO permanece como oportunidade de melhoria.

## Deploy

A aplicação está publicada na **Vercel**:

https://kurio-nft-marketplace-five-delta.vercel.app/

O deploy utiliza o build estático do Vite (`dist/`), MSW habilitado e fallback para rotas SPA. A opção Docker é independente do deploy da Vercel.

## Limitações e pendências

- **Socket.IO não implementado:** não há eventos `nft.updated` ou `order.updated`, sincronização ou reconexão em tempo real. Durante o desenvolvimento, foi identificado um conflito entre MSW 3 e a versão avaliada de `@mswjs/socket.io-binding`.
- **Perfil e carteiras:** edição do perfil e gerenciamento de carteiras não foram concluídos.
- **Figma:** utilizado como referência; nem todos os detalhes visuais foram reproduzidos integralmente.
- **Testes:** cobertura E2E parcial dos cenários do enunciado.
- **Persistência:** simulação local, sem backend, banco de dados compartilhado ou controle real de concorrência.

## Arquitetura

Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para conhecer os fluxos de dados, as decisões técnicas, os trade-offs e as limitações do projeto.