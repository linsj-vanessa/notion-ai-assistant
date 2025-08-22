# Notion AI Assistant - Alfred Digital

🤖 Um assistente digital completo baseado em IA integrado ao Notion para organizar sua vida e automatizar tarefas.

## 🚀 Funcionalidades

### Core Features
- ✅ Integração completa com Notion API
- 🧠 Processamento de linguagem natural com IA
- 🔄 Automação de tarefas e workflows
- 📊 Análise de produtividade e relatórios
- 🎯 Gerenciamento inteligente de tarefas
- 📝 Organização automática de notas
- 📅 Planejamento e agendamento inteligente

### Interfaces
- 💻 Interface de linha de comando (CLI)
- 🌐 Interface web responsiva
- 🔗 API REST para integrações

### Automações
- 📋 Revisão diária automática
- 📈 Planejamento semanal
- 🎯 Rastreamento de hábitos
- 🏷️ Categorização automática
- 💡 Sugestões inteligentes

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/notion-ai-assistant.git
cd notion-ai-assistant

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Execute o projeto
npm run dev
```

## 🐙 Criando o Repositório no GitHub

Para criar o repositório no GitHub e fazer o primeiro push:

```bash
# 1. Inicializar repositório Git local
git init
git add .
git commit -m "feat: estrutura inicial do projeto Notion AI Assistant"

# 2. Criar repositório no GitHub
# Acesse https://github.com/new
# Nome: notion-ai-assistant
# Descrição: 🤖 Assistente digital completo baseado em IA integrado ao Notion para organizar sua vida e automatizar tarefas
# Público/Privado: conforme sua preferência
# NÃO inicialize com README (já temos um)

# 3. Conectar repositório local ao GitHub
git remote add origin https://github.com/SEU-USUARIO/notion-ai-assistant.git
git branch -M main
git push -u origin main
```

## ⚙️ Configuração

### 1. Notion Integration
1. Acesse [Notion Developers](https://developers.notion.com/)
2. Crie uma nova integração
3. Copie o token de integração
4. Compartilhe suas páginas/databases com a integração

### 2. OpenAI API
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Gere uma API key
3. Configure no arquivo .env

## 🎯 Uso

### CLI
```bash
# Modo interativo
npm start

# Comandos diretos
npm start -- "Criar tarefa: Revisar relatório até amanhã"
npm start -- "Listar tarefas pendentes"
npm start -- "Agendar reunião para quinta-feira às 14h"
```

### Web Interface
```bash
npm start web
# Acesse http://localhost:3000
```

## 📋 Comandos Disponíveis

- **Tarefas**: "Criar tarefa", "Listar tarefas", "Marcar como concluída"
- **Notas**: "Criar nota", "Buscar notas", "Organizar notas"
- **Projetos**: "Novo projeto", "Status do projeto", "Atualizar progresso"
- **Agenda**: "Agendar", "Próximos eventos", "Disponibilidade"
- **Hábitos**: "Registrar hábito", "Progresso dos hábitos"
- **Relatórios**: "Relatório semanal", "Análise de produtividade"

## 🏗️ Arquitetura

```
src/
├── core/              # Lógica principal
├── services/          # Serviços (Notion, OpenAI, etc.)
├── interfaces/        # CLI e Web interfaces
├── automation/        # Sistema de automação
├── nlp/              # Processamento de linguagem natural
├── templates/        # Templates e configurações
├── utils/            # Utilitários
└── types/            # Definições de tipos
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.