# RU App

Aplicação web desenvolvida com Next.js, React e Supabase para gerenciamento de refeições universitárias.

## 🚀 Tecnologias Utilizadas

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Radix UI
- Framer Motion
- Zod (validação)
- React Hook Form

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- pnpm (gerenciador de pacotes)
- Conta no Supabase (para configuração do banco de dados)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd ru-app
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento
```bash
pnpm dev
```
O projeto estará disponível em `http://localhost:3000`

### Produção
```bash
pnpm build
pnpm start
```

## 📦 Scripts Disponíveis

- `pnpm dev`: Inicia o servidor de desenvolvimento
- `pnpm build`: Cria a versão de produção
- `pnpm start`: Inicia o servidor de produção
- `pnpm lint`: Executa o linter para verificar erros de código

## 🏗️ Estrutura do Projeto

```
ru-app/
├── app/              # Rotas e páginas da aplicação
├── components/       # Componentes reutilizáveis
├── contexts/         # Contextos React
├── hooks/            # Hooks personalizados
├── lib/              # Utilitários e configurações
├── public/           # Arquivos estáticos
├── services/         # Serviços e integrações
├── styles/           # Estilos globais
└── supabase/         # Configurações e tipos do Supabase
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 