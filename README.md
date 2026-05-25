# Dashboard Protestos

SPA corporativa para análise de títulos em protesto/cartório a partir de planilhas Excel processadas localmente no navegador.

## Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Recharts
- XLSX
- Lucide React

## Funcionalidades

- Upload drag and drop de planilhas `.xlsx` e `.xls`.
- Parser client-side para datas seriais do Excel, valores monetários brasileiros e campos inconsistentes.
- Persistência local da última base importada via `localStorage`.
- Filtros por emissão, conta, status, sacado e documento.
- KPIs financeiros: valor total, total protestado, total em cartório, quantidade, ticket médio, maior título, vencidos e a vencer.
- Gráficos de evolução temporal, distribuição por status, top sacados, valores por conta e curva de vencimentos.
- Tabela com busca, ordenação, paginação e exportação CSV.

## Colunas esperadas

A planilha deve conter as seguintes colunas:

| Coluna | Descrição |
| --- | --- |
| Cart | Carteira ou origem do título |
| Conta | Conta/carteira analítica |
| Emissão | Data de emissão |
| Vencto. | Data de vencimento |
| Vcto Original. | Vencimento original |
| Doc. | Documento do título |
| Sacado | Sacado/devedor |
| Valor | Valor financeiro |
| Carimbo | Base para derivar o status |

O status é derivado do campo `Carimbo`:

- `Protestado` quando o campo contém referência a protesto.
- `Em Cartório` nos demais casos.

## Execução local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Para validar o build localmente:

```bash
npm run preview
```

## Deploy no GitHub Pages

O projeto está configurado para publicar em:

```ts
base: "/Dashboard-protestos/"
```

Deploy manual via `gh-pages`:

```bash
npm run deploy
```

Deploy automático:

- O workflow `.github/workflows/deploy.yml` executa build e publicação no GitHub Pages a cada push na branch `main`.
- Em `Settings > Pages`, selecione `GitHub Actions` como origem do deploy.

## Arquitetura

```text
src/
  components/
  context/
  data/
  hooks/
  layouts/
  pages/
  services/
  types/
  utils/
```

Todo processamento de dados é feito no front-end. O projeto não utiliza backend, banco de dados, APIs privadas ou funções serverless.
