# Meu Painel Financeiro

Painel financeiro pessoal para cadastrar receitas (uma ou várias fontes de renda mensal) e despesas
(fixas e variáveis), com gráficos automáticos de receitas x despesas, evolução do saldo, despesas por
categoria e mais.

Todos os dados ficam salvos **apenas no seu navegador** (localStorage) — nada é enviado para servidores.
Você pode exportar/importar um backup em JSON a qualquer momento na tela de Configurações.

Suporta **múltiplos perfis** no mesmo navegador (ex.: um aparelho compartilhado entre duas pessoas
da família) — cada perfil tem suas próprias receitas, despesas e configurações, totalmente isoladas.
Um perfil pode opcionalmente ter um **PIN**: os dados desse perfil ficam criptografados (AES-GCM) no
localStorage, ilegíveis sem o PIN — inclusive por quem abrir as ferramentas de desenvolvedor do
navegador. Não existe recuperação de PIN esquecido, já que não há servidor guardando isso em lugar
nenhum; a única saída é apagar o perfil e recomeçar.

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

O app é um PWA: pode ser instalado ("Adicionar à tela inicial") e continua abrindo offline depois da
primeira visita, já que tanto a interface quanto os dados (localStorage) são 100% locais.

## Qualidade de código

```bash
npm run typecheck   # checagem de tipos (TypeScript)
npm run lint        # ESLint (inclui regras de acessibilidade)
npm run test        # testes unitários (Vitest)
npm run format      # formata o código com Prettier
```

Um workflow em `.github/workflows/ci.yml` roda essas quatro checagens + o build a cada push/PR.

## Estrutura do projeto

```
src/
  components/
    layout/      # Barra lateral, cabeçalho e estrutura da página
    ui/           # Botões, campos, modais e outros elementos reutilizáveis
    dashboard/    # Cartões de indicadores e gráficos do painel
    income/       # Formulário e lista de receitas
    expenses/     # Formulário e lista de despesas
    profile/      # Troca de perfil, tela de bloqueio por PIN, gerenciamento de perfis
  pages/          # As 4 telas: Painel, Receitas, Despesas, Configurações
  store/          # Estado global da aplicação (Zustand) com persistência automática
  types/          # Modelos de dados (receita, despesa fixa, despesa variável...)
  utils/          # Cálculos financeiros, formatação de moeda/data, backup, criptografia de PIN
  hooks/          # Hooks de tema (claro/escuro) e seleção de mês
```

## Conceitos usados no app

- **Receita (fonte de renda)**: um valor mensal recorrente, com data de início e, opcionalmente, de
  término. Você pode cadastrar quantas quiser (salário, freelances, aluguéis recebidos, etc.).
- **Despesa fixa**: se repete todo mês com valor parecido (aluguel, internet, plano de saúde).
- **Despesa variável**: um lançamento pontual, em uma data específica (mercado, lazer, imprevistos).
- **Taxa de poupança**: percentual da renda que sobrou no mês (saldo ÷ receitas).
