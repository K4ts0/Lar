# 🏥 Sistema para geriátricos
## Sistema de Relatórios de Enfermagem para Geriatria

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-3-blue?style=for-the-badge&logo=sqlite" alt="SQLite">
  <img src="https://img.shields.io/badge/Express-4.x-lightgrey?style=for-the-badge&logo=express" alt="Express">
  <img src="https://img.shields.io/badge/JWT-Auth-orange?style=for-the-badge" alt="JWT">
</p>

<p align="center">
  <b>Sistema completo para gestão de relatórios de enfermagem em lares geriátricos</b>
</p>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Níveis de Acesso](#-níveis-de-acesso)
- [Screenshots](#-screenshots)
- [Licença](#-licença)

---

## 🏠 Sobre o Projeto

O é um sistema web desenvolvido especificamente para **lares geriátricos e residenciais de idosos**, focado no gerenciamento de relatórios de enfermagem por turno (noturno e diurno).

O sistema permite que equipes de enfermagem registrem de forma organizada e segura todas as atividades, procedimentos, observações e cuidados realizados durante cada plantão, garantindo a continuidade do atendimento e a rastreabilidade das informações dos residentes.

### 🎯 Objetivos

- ✅ Digitalizar e padronizar relatórios de enfermagem
- ✅ Garantir a passagem de plantão organizada e completa
- ✅ Controlar acesso por níveis de permissão
- ✅ Gerar PDFs dos relatórios para arquivo físico
- ✅ Gerenciar pacientes/residentes do lar
- ✅ Controlar usuários e permissões da equipe

---

## ✨ Funcionalidades

### 📊 Relatórios de Plantão
- **Plantão Noturno**: Registro completo de atividades noturnas
- **Plantão Diurno**: Registro de atividades diurnas
- Geração de **PDF** dos relatórios
- Salvamento **temporário** (localStorage) para não perder dados
- Salvamento **permanente** no banco de dados

### 👤 Gestão de Pacientes/Residentes
- Cadastro completo com dados pessoais e médicos
- Controle de alergias e medicamentos contínuos
- Localização (quarto e leito)
- Status ativo/inativo
- Busca e filtros avançados

### 👥 Gestão de Usuários
- Cadastro de usuários com diferentes níveis de acesso
- Autenticação com senha criptografada (bcrypt)
- Ativação/desativação de usuários
- Proteção do administrador principal

### 🔐 Segurança
- Autenticação JWT (JSON Web Token)
- Controle de acesso por níveis (RBAC)
- Verificação de senha do administrador para ações críticas
- Sessão segura com sessionStorage

---

## 🛠 Tecnologias

### Backend
| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Node.js** | 18+ | Ambiente de execução JavaScript |
| **Express.js** | 4.18+ | Framework web |
| **SQLite3** | 5.1+ | Banco de dados relacional |
| **JWT** | 9.0+ | Autenticação via tokens |
| **bcryptjs** | 2.4+ | Criptografia de senhas |
| **CORS** | 2.8+ | Cross-Origin Resource Sharing |
| **dotenv** | 16.3+ | Variáveis de ambiente |

### Frontend
| Tecnologia | Descrição |
|------------|-----------|
| **HTML5** | Estrutura semântica |
| **CSS3** | Estilização customizada com variáveis CSS |
| **JavaScript Vanilla** | Interatividade sem frameworks |
| **Font Awesome** | Ícones vetoriais |
| **Google Fonts** | Tipografia (Inter, Poppins) |
| **jsPDF** | Geração de PDFs |
| **html2canvas** | Captura de elementos para PDF |

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18 ou superior
- npm ou yarn

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/lar-aconchego.git
cd lar-aconchego

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 4. Inicie o servidor
npm start

# Ou em modo desenvolvimento (com auto-reload)
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

---

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
PORT=3000                           # Porta do servidor
JWT_SECRET=sua_chave_secreta_aqui   # Chave secreta para JWT
JWT_EXPIRES_IN=7d                   # Tempo de expiração do token
NODE_ENV=development                # Ambiente (development/production)
```

> ⚠️ **Importante**: Em produção, altere o `JWT_SECRET` para uma chave forte e única!

---

## 🚀 Uso

### Acesso Inicial

1. Acesse **http://localhost:3000**
2. Faça login com as credenciais padrão:

| Usuário | Senha | Nível |
|---------|-------|-------|
| `admin` | `admin123` | Administrador |
| `enfermeiro` | `enf123` | Enfermeiro |
| `tecnico` | `tec123` | Técnico de Enfermagem |
| `estagiario` | `est123` | Estagiário |

### Fluxo de Trabalho

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│   Home      │────▶│  Relatório  │
│             │     │  (Painel)   │     │  (Noturno/  │
└─────────────┘     └─────────────┘     │   Diurno)   │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Salvar/    │
                                        │  Gerar PDF  │
                                        └─────────────┘
```

### Telas do Sistema

| Tela | Descrição | Acesso |
|------|-----------|--------|
| **Login** | Autenticação de usuários | Todos |
| **Home** | Painel principal com menu | Todos |
| **Relatório Noturno** | Formulário de plantão noturno | Admin, Enfermeiro, Técnico |
| **Relatório Diurno** | Formulário de plantão diurno | Admin, Enfermeiro, Técnico |
| **Gerenciar Usuários** | CRUD de usuários | Apenas Admin |
| **Gerenciar Pacientes** | CRUD de residentes | Apenas Admin |

---

## 📁 Estrutura do Projeto

```
lar-aconchego/
├── 📄 .env                          # Variáveis de ambiente
├── 📄 package.json                  # Dependências e scripts
├── 📄 server.js                     # Servidor Express principal
│
├── 📂 api/
│   ├── 📂 middleware/
│   │   └── auth.js                  # Middleware de autenticação JWT
│   │
│   ├── 📂 routes/
│   │   ├── auth.js                  # Rotas de autenticação
│   │   ├── usuarios.js              # Rotas de usuários
│   │   ├── relatorios.js            # Rotas de relatórios
│   │   └── pacientes.js             # Rotas de pacientes
│   │
│   └── 📂 controllers/
│       ├── authController.js        # Lógica de autenticação
│       ├── usuarioController.js     # Lógica de usuários
│       ├── relatorioController.js   # Lógica de relatórios
│       └── pacienteController.js    # Lógica de pacientes
│
├── 📂 database/
│   └── database.js                  # Conexão e inicialização SQLite
│
├── 📄 login.html                    # Página de login
├── 📄 home.html                     # Painel principal
├── 📄 relatorio.html                # Formulário de relatórios
├── 📄 404.html                      # Página de erro
└── 📄 teste-sessao.html             # Ferramenta de diagnóstico
```

---

## 🔌 API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login de usuário |
| `POST` | `/api/auth/verificar-senha-admin` | Verifica senha do admin |
| `GET`  | `/api/auth/verificar` | Verifica validade do token |

### Usuários (Admin apenas)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET`  | `/api/usuarios` | Listar todos os usuários |
| `GET`  | `/api/usuarios/:id` | Buscar usuário por ID |
| `POST` | `/api/usuarios` | Criar novo usuário |
| `PUT`  | `/api/usuarios/:id` | Atualizar usuário |
| `PATCH`| `/api/usuarios/:id/toggle-status` | Ativar/desativar usuário |
| `DELETE`| `/api/usuarios/:id` | Deletar usuário |

### Relatórios
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| `GET`  | `/api/relatorios` | Listar relatórios | Todos |
| `GET`  | `/api/relatorios/:id` | Buscar relatório | Todos |
| `GET`  | `/api/relatorios/:id/completo` | Buscar com detalhes | Todos |
| `POST` | `/api/relatorios` | Criar relatório | Todos (exceto Estagiário) |
| `PUT`  | `/api/relatorios/:id` | Atualizar relatório | Admin, Enfermeiro |
| `DELETE`| `/api/relatorios/:id` | Deletar relatório | Admin |

### Pacientes
| Método | Endpoint | Descrição | Acesso |
|--------|----------|-----------|--------|
| `GET`  | `/api/pacientes` | Listar pacientes | Todos |
| `GET`  | `/api/pacientes/:id` | Buscar paciente | Todos |
| `POST` | `/api/pacientes` | Criar paciente | Admin |
| `PUT`  | `/api/pacientes/:id` | Atualizar paciente | Admin |
| `PATCH`| `/api/pacientes/:id/toggle-status` | Ativar/desativar | Admin |
| `DELETE`| `/api/pacientes/:id` | Deletar paciente | Admin |

---

## 🔐 Níveis de Acesso

```
┌─────────────────────────────────────────────────────────────┐
│                    HIERARQUIA DE ACESSO                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👑 ADMINISTRADOR                                          │
│  ├── Acesso total ao sistema                               │
│  ├── Gerenciamento de usuários                             │
│  ├── Gerenciamento de pacientes                            │
│  ├── Criar/editar/deletar relatórios                      │
│  └── Visualizar estatísticas                               │
│                                                             │
│  👩‍⚕️ ENFERMEIRO                                             │
│  ├── Criar relatórios (noturno e diurno)                   │
│  ├── Editar próprios relatórios                            │
│  └── Visualizar todos os relatórios                        │
│                                                             │
│  🧑‍⚕️ TÉCNICO DE ENFERMAGEM                                  │
│  ├── Criar relatórios (noturno e diurno)                   │
│  └── Visualizar relatórios                                 │
│                                                             │
│  🎓 ESTAGIÁRIO                                               │
│  └── Visualização apenas (modo somente leitura)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Screenshots

> *Adicione aqui screenshots das principais telas do sistema*

| Login | Painel Principal | Relatório |
|-------|-----------------|-----------|
| ![Login](screenshots/login.png) | ![Home](screenshots/home.png) | ![Relatório](screenshots/relatorio.png) |

---

## 🗄️ Modelo do Banco de Dados

### Tabelas Principais

```sql
-- Usuários
usuarios (id, nome, idade, sexo, telefone, usuario, senha, nivel, ativo, created_at, updated_at)

-- Pacientes/Residentes
pacientes (id, nome_completo, data_nascimento, idade, sexo, telefone_responsavel, 
           nome_responsavel, quarto, leito, data_internacao, diagnostico_principal, 
           alergias, medicamentos_continuos, observacoes, ativo, created_at, updated_at)

-- Relatórios
relatorios (id, data_plantao, tipo, plantonistas, particulares, procedimentos, 
            observacoes, hospitalizados, evacuacao, banhos, insulinas, saida, 
            passagem_plantao, enfermagem, farmacia, criado_por, created_at, updated_at)

-- Curativos (relacionado a relatórios)
curativos (id, relatorio_id, residente, profissional, tipo_local, observacoes)

-- Remoções (relacionado a relatórios)
remocoes (id, relatorio_id, residente, cuidador, data_remocao, hora_remocao, destino, observacoes)

-- HGT (relacionado a relatórios)
hgt (id, relatorio_id, residente, valor, almoco, jantar, observacoes)

-- Tricotomias (relacionado a relatórios)
tricotomias (id, relatorio_id, paciente, profissional, quantidade)

-- Ingesta Hídrica (relacionado a relatórios)
ingesta_hidrica (id, relatorio_id, horario, valor)
```

---

## 🧪 Testes

### Ferramenta de Diagnóstico
Acesse `/teste-sessao.html` para:
- Verificar status da sessão atual
- Simular logins de diferentes usuários
- Testar conexão com a API
- Diagnosticar problemas de autenticação

### Testes Manuais
```bash
# Verificar se a API está online
curl http://localhost:3000/api/status

# Login (Admin)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"admin","senha":"admin123"}'

# Listar usuários (requer token)
curl http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🚢 Deploy

### Requisitos para Produção
- Node.js 18+
- PM2 (gerenciador de processos) - opcional
- Nginx (proxy reverso) - opcional

### Deploy com PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name "lar-aconchego"

# Configurar inicialização automática
pm2 startup
pm2 save
```

### Configuração de Produção
```env
PORT=3000
JWT_SECRET=chave_super_secreta_e_aleatoria_aqui
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

---

## 🤝 Contribuição

Contribuições são bem-vindas! Siga os passos:

1. Faça um **fork** do projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/nova-feature`)
3. Faça **commit** das alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça **push** para a branch (`git push origin feature/nova-feature`)
5. Abra um **Pull Request**

---

## 📝 Licença

Este projeto está licenciado sob a licença **MIT**.

```
MIT License

Copyright (c) 2024 LAR RESIDENCIAL ACONCHEGO

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Autor

**LAR RESIDENCIAL ACONCHEGO** - *Sistema de Enfermagem*

📧 Email: contato@laraconchego.com.br
🌐 Website: www.laraconchego.com.br

---

<p align="center">
  <b>Feito com 💚 e dedicação para o cuidado de nossos idosos</b>
</p>

<p align="center">
  🏠 <i>"Cuidado e dedicação 24h"</i> 🏠
</p>
