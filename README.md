# Meu Painel Financeiro

Painel financeiro pessoal para cadastrar receitas (uma ou várias fontes de renda mensal) e despesas
(fixas e variáveis), com gráficos automáticos de receitas x despesas, evolução do saldo, despesas por
categoria e mais.

Todos os dados ficam salvos **apenas no seu navegador** (localStorage) — nada é enviado para servidores.
Você pode exportar/importar um backup em JSON a qualquer momento na tela de Configurações.

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) 18 ou mais recente instalado.

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado no terminal (geralmente `http://localhost:5173`) no navegador.

## Gerar uma versão para publicar (build)

```bash
npm run build
npm run preview   # para testar a versão de produção localmente
```

Os arquivos finais ficam na pasta `dist/` e podem ser publicados em qualquer serviço de hospedagem
estática (Netlify, Vercel, GitHub Pages, etc.) — não é necessário nenhum backend/servidor.

## Estrutura do projeto

```
src/
  components/
    layout/      # Barra lateral, cabeçalho e estrutura da página
    ui/           # Botões, campos, modais e outros elementos reutilizáveis
    dashboard/    # Cartões de indicadores e gráficos do painel
    income/       # Formulário e lista de receitas
    expenses/     # Formulário e lista de despesas
  pages/          # As 4 telas: Painel, Receitas, Despesas, Configurações
  store/          # Estado global da aplicação (Zustand) com persistência automática
  types/          # Modelos de dados (receita, despesa fixa, despesa variável...)
  utils/          # Cálculos financeiros, formatação de moeda/data, backup
  hooks/          # Hooks de tema (claro/escuro) e seleção de mês
```

## Conceitos usados no app

- **Receita (fonte de renda)**: um valor mensal recorrente, com data de início e, opcionalmente, de
  término. Você pode cadastrar quantas quiser (salário, freelances, aluguéis recebidos, etc.).
- **Despesa fixa**: se repete todo mês com valor parecido (aluguel, internet, plano de saúde).
- **Despesa variável**: um lançamento pontual, em uma data específica (mercado, lazer, imprevistos).
- **Taxa de poupança**: percentual da renda que sobrou no mês (saldo ÷ receitas).
