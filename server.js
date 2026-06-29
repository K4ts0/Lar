require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Importar banco de dados (corrigido para usar o módulo correto)
const db = require('./database'); // Importa a conexão com o banco

// Importar rotas
const authRoutes = require('./api/routes/auth');
const usuarioRoutes = require('./api/routes/usuarios');
const relatorioRoutes = require('./api/routes/relatorios');
const pacienteRoutes = require('./api/routes/pacientes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CORREÇÕES APLICADAS =====

// 1. Redirecionar raiz para login.html
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// 2. Servir arquivos estáticos com configuração adequada
app.use(express.static(path.join(__dirname), {
    index: false, // Desabilita index automático
    dotfiles: 'ignore',
    extensions: ['html', 'htm']
}));

// 3. Rota da API raiz (para informação)
app.get('/api', (req, res) => {
    res.json({
        nome: 'LAR Aconchego API',
        versao: '1.0.0',
        status: 'online',
        endpoints: [
            '/api/status',
            '/api/auth/login',
            '/api/auth/verificar',
            '/api/auth/verificar-senha-admin',
            '/api/usuarios',
            '/api/relatorios',
            '/api/pacientes'
        ],
        paginas: [
            '/login.html',
            '/home.html',
            '/relatorio.html'
        ],
        documentacao: 'Acesse as páginas HTML para utilizar o sistema'
    });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/pacientes', pacienteRoutes);

// Rota para verificar status da API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    ambiente: process.env.NODE_ENV || 'development'
  });
});

// 4. Middleware para páginas não encontradas (404)
app.use((req, res, next) => {
    // Se for requisição de API, retorna JSON
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            sucesso: false,
            erro: 'Endpoint não encontrado'
        });
    }
    
    // Para páginas HTML, redireciona para login
    if (req.path.endsWith('.html')) {
        return res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Página não encontrada</title>
                <meta http-equiv="refresh" content="3;url=/login.html">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 50px;
                        background: linear-gradient(145deg, #E8F5E9 0%, #FCE4EC 100%);
                    }
                    .container {
                        background: white;
                        padding: 30px;
                        border-radius: 15px;
                        max-width: 500px;
                        margin: 0 auto;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    }
                    h1 { color: #2E7D32; }
                    p { color: #666; }
                    a { color: #C2185B; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>404 - Página não encontrada</h1>
                    <p>A página que você está procurando não existe.</p>
                    <p>Você será redirecionado para o login em 3 segundos...</p>
                    <p><a href="/login.html">Clique aqui</a> se não for redirecionado.</p>
                </div>
            </body>
            </html>
        `);
    }
    
    next();
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  
  const status = err.status || 500;
  const mensagem = err.message || 'Erro interno do servidor';
  
  // Se for requisição de API, retorna JSON
  if (req.path.startsWith('/api/')) {
    return res.status(status).json({
      sucesso: false,
      erro: mensagem
    });
  }
  
  // Para páginas HTML, mostra página de erro
  res.status(status).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Erro no servidor</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(145deg, #E8F5E9 0%, #FCE4EC 100%);
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 500px;
                margin: 0 auto;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            h1 { color: #C2185B; }
            p { color: #666; }
            a { color: #2E7D32; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Ops! Algo deu errado</h1>
            <p>Ocorreu um erro no servidor. Tente novamente mais tarde.</p>
            <p><a href="/login.html">Voltar para o login</a></p>
        </div>
    </body>
    </html>
  `);
});

// Função para inicializar banco de dados (se necessário)
async function inicializarBanco() {
  return new Promise((resolve, reject) => {
    // Criar tabelas se não existirem (opcional - já devem existir)
    const queries = [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        idade INTEGER,
        sexo TEXT,
        telefone TEXT,
        usuario TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        nivel TEXT NOT NULL CHECK(nivel IN ('ADMIN', 'ENFERMEIRO', 'TECNICO', 'ESTAGIARIO')),
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        data_nascimento TEXT NOT NULL,
        idade INTEGER,
        sexo TEXT NOT NULL CHECK(sexo IN ('M', 'F')),
        telefone_responsavel TEXT,
        nome_responsavel TEXT,
        quarto TEXT,
        leito TEXT,
        data_internacao TEXT,
        diagnostico_principal TEXT,
        alergias TEXT,
        medicamentos_continuos TEXT,
        observacoes TEXT,
        ativo INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES usuarios(id),
        FOREIGN KEY (updated_by) REFERENCES usuarios(id)
      )`,
      `CREATE TABLE IF NOT EXISTS relatorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_plantao DATE NOT NULL,
        tipo TEXT NOT NULL CHECK(tipo IN ('noturno', 'diurno')),
        plantonistas TEXT,
        particulares TEXT,
        procedimentos TEXT,
        observacoes TEXT,
        hospitalizados TEXT,
        evacuacao TEXT,
        banhos TEXT,
        insulinas TEXT,
        saida TEXT,
        passagem_plantao TEXT,
        enfermagem TEXT,
        farmacia TEXT,
        criado_por INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (criado_por) REFERENCES usuarios(id)
      )`
    ];

    let completed = 0;
    queries.forEach((sql, index) => {
      db.run(sql, function(err) {
        if (err) {
          console.error(`❌ Erro ao criar tabela ${index + 1}:`, err);
          reject(err);
        } else {
          completed++;
          if (completed === queries.length) {
            console.log('✅ Tabelas verificadas/criadas com sucesso');
            resolve();
          }
        }
      });
    });
  });
}

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    // Verificar conexão com o banco
    db.get('SELECT 1', (err) => {
      if (err) {
        console.error('❌ Erro na conexão com o banco:', err);
        process.exit(1);
      } else {
        console.log('✅ Conexão com o banco de dados estabelecida');
      }
    });

    // Inicializar tabelas (opcional - comentar se já existirem)
    // await inicializarBanco();
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📚 API disponível em http://localhost:${PORT}/api`);
      console.log(`🔐 Página de login: http://localhost:${PORT}/login.html`);
      console.log(`🏠 Página principal: http://localhost:${PORT}/home.html`);
      console.log(`📝 Página de relatório: http://localhost:${PORT}/relatorio.html`);
      console.log('='.repeat(50) + '\n');
      
      // Mostrar credenciais de teste apenas em desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        console.log('👤 Credenciais de teste:');
        console.log('   Admin: admin / admin123');
        console.log('   Enfermeiro: enfermeiro / enf123');
        console.log('   Técnico: tecnico / tec123');
        console.log('   Estagiário: estagiario / est123');
        console.log('='.repeat(50) + '\n');
      }
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();