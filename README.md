# Ouvidoria GDF

Sistema de ouvidoria digital do Governo do Distrito Federal, permitindo que cidadãos registrem manifestações, acompanhem respostas e participem da comunidade.

##  Sobre o Projeto

A Ouvidoria GDF é uma aplicação web progressiva (PWA) que permite aos cidadãos:
- Registrar manifestações (reclamações, sugestões, elogios)
- Optar por manifestações anônimas
- Anexar imagens e vídeos às manifestações
- Acompanhar o status e respostas das manifestações
- Participar da comunidade visualizando manifestações públicas
- Utilizar entrada de voz para ditar manifestações

##  Tecnologias Utilizadas

- **Frontend:**
  - [React](https://reactjs.org/) - Biblioteca JavaScript para interfaces
  - [TypeScript](https://www.typescriptlang.org/) - Superset tipado do JavaScript
  - [Vite](https://vitejs.dev/) - Build tool e dev server
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
  - [shadcn/ui](https://ui.shadcn.com/) - Componentes UI reutilizáveis
  - [Framer Motion](https://www.framer.com/motion/) - Animações
  - [React Router](https://reactrouter.com/) - Roteamento
  - [React Query](https://tanstack.com/query) - Gerenciamento de estado do servidor
  - [i18next](https://www.i18next.com/) - Internacionalização (PT, EN, ES, FR)

- **Backend:**
  - [Supabase](https://supabase.com/) - Backend as a Service
    - Autenticação
    - Banco de dados PostgreSQL
    - Storage para arquivos
    - Edge Functions

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
  - [Baixar Node.js](https://nodejs.org/)
  - Ou instalar via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
  
- **npm** (vem junto com o Node.js) ou **bun**
  - [Instalar Bun](https://bun.sh/) (opcional, mas recomendado)

- **Git** (para clonar o repositório)
  - [Baixar Git](https://git-scm.com/)

##  Instalação

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd ouvidoria-gdf
```

### 2. Instale as dependências

Usando npm:
```bash
npm install
```

Ou usando bun (mais rápido):
```bash
bun install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

> **Nota:** Se você estiver usando o Lovable Cloud, essas variáveis já estarão configuradas automaticamente.

### 4. Inicie o servidor de desenvolvimento

Usando npm:
```bash
npm run dev
```

Ou usando bun:
```bash
bun run dev
```

O aplicativo estará disponível em `http://localhost:5173`

##  Estrutura do Projeto

```
ouvidoria-gdf/
├── public/                 # Arquivos estáticos (ícones, imagens)
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── auth/           # Componentes de autenticação
│   │   ├── home/           # Componentes da página inicial
│   │   ├── layout/         # Componentes de layout (Header, Nav)
│   │   ├── manifestar/     # Componentes do fluxo de manifestação
│   │   ├── pwa/            # Componentes PWA (instalação)
│   │   ├── ui/             # Componentes UI base (shadcn)
│   │   └── voice/          # Componentes de entrada por voz
│   ├── hooks/              # Hooks customizados
│   ├── i18n/               # Arquivos de internacionalização
│   │   └── translations/   # Traduções (PT, EN, ES, FR)
│   ├── integrations/       # Integrações externas
│   │   └── supabase/       # Cliente e tipos do Supabase
│   ├── lib/                # Utilitários
│   ├── pages/              # Páginas da aplicação
│   ├── providers/          # Context providers (Auth)
│   ├── test/               # Configuração de testes
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Ponto de entrada
│   └── index.css           # Estilos globais
├── supabase/
│   ├── config.toml         # Configuração do Supabase
│   └── functions/          # Edge Functions
├── .env.example            # Exemplo de variáveis de ambiente
├── tailwind.config.ts      # Configuração do Tailwind
├── vite.config.ts          # Configuração do Vite
├── vitest.config.ts        # Configuração de testes
└── tsconfig.json           # Configuração do TypeScript
```

##  Testes

Para executar os testes:

```bash
npm run test
```

Ou com bun:
```bash
bun run test
```

##  PWA (Progressive Web App)

O aplicativo é uma PWA e pode ser instalado em dispositivos móveis e desktop:

1. Acesse o aplicativo no navegador
2. O popup de instalação aparecerá automaticamente
3. Clique em "Instalar" para adicionar à tela inicial

##  Idiomas Suportados

- Português (Brasil) - padrão
- English (US)
- Español
- Français

Para alterar o idioma, acesse: **Configurações > Idiomas**

##  Funcionalidades de Autenticação

- Cadastro com email e senha
- Login
- Manifestações vinculadas ao usuário
- Opção de manifestação anônima

##  Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run test` | Executa testes |
| `npm run lint` | Verifica código com ESLint |

##  Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

##  Licença

Este projeto está sob a licença MIT.

##  Links Úteis

- **Produção:** https://ouvidoria-gdf.lovable.app
- **Documentação Supabase:** https://supabase.com/docs
- **Documentação React:** https://react.dev
- **Documentação Tailwind:** https://tailwindcss.com/docs
