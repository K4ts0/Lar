const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, 'lar_aconchego.db');
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
      } else {
        console.log('✅ Conectado ao SQLite');
      }
    });
  }

  async inicializarBanco() {
    const queries = [
      // Tabela de usuários
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

      // Tabela de pacientes
      `CREATE TABLE IF NOT EXISTS pacientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        idade INTEGER,
        sexo TEXT,
        quarto TEXT,
        diagnostico TEXT,
        observacoes TEXT,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabela de relatórios
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
      )`,

      // Tabela de curativos
      `CREATE TABLE IF NOT EXISTS curativos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        relatorio_id INTEGER NOT NULL,
        residente TEXT NOT NULL,
        profissional TEXT NOT NULL,
        tipo_local TEXT NOT NULL,
        observacoes TEXT,
        FOREIGN KEY (relatorio_id) REFERENCES relatorios(id) ON DELETE CASCADE
      )`,

      // Tabela de remoções
      `CREATE TABLE IF NOT EXISTS remocoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        relatorio_id INTEGER NOT NULL,
        residente TEXT NOT NULL,
        cuidador TEXT,
        data_remocao DATE,
        hora_remocao TEXT,
        destino TEXT NOT NULL,
        observacoes TEXT,
        FOREIGN KEY (relatorio_id) REFERENCES relatorios(id) ON DELETE CASCADE
      )`,

      // Tabela de HGT
      `CREATE TABLE IF NOT EXISTS hgt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        relatorio_id INTEGER NOT NULL,
        residente TEXT NOT NULL,
        valor TEXT,
        almoco TEXT,
        jantar TEXT,
        observacoes TEXT,
        FOREIGN KEY (relatorio_id) REFERENCES relatorios(id) ON DELETE CASCADE
      )`,

      // Tabela de tricotomias
      `CREATE TABLE IF NOT EXISTS tricotomias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        relatorio_id INTEGER NOT NULL,
        paciente TEXT NOT NULL,
        profissional TEXT NOT NULL,
        quantidade TEXT,
        FOREIGN KEY (relatorio_id) REFERENCES relatorios(id) ON DELETE CASCADE
      )`,

      // Tabela de ingesta hídrica
      `CREATE TABLE IF NOT EXISTS ingesta_hidrica (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        relatorio_id INTEGER NOT NULL,
        horario TEXT NOT NULL,
        valor TEXT,
        FOREIGN KEY (relatorio_id) REFERENCES relatorios(id) ON DELETE CASCADE
      )`,

      // Trigger para updated_at
      `CREATE TRIGGER IF NOT EXISTS update_usuarios_timestamp 
       AFTER UPDATE ON usuarios
       BEGIN
         UPDATE usuarios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS update_relatorios_timestamp 
       AFTER UPDATE ON relatorios
       BEGIN
         UPDATE relatorios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`,

      `CREATE TRIGGER IF NOT EXISTS update_pacientes_timestamp 
       AFTER UPDATE ON pacientes
       BEGIN
         UPDATE pacientes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
       END`
    ];

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        try {
          queries.forEach(query => {
            this.db.run(query);
          });
          
          this.db.run('COMMIT', async (err) => {
            if (err) {
              console.error('Erro ao criar tabelas:', err);
              reject(err);
            } else {
              await this.criarUsuarioAdmin();
              await this.criarPacientesIniciais();
              resolve();
            }
          });
        } catch (error) {
          this.db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  }

  async criarUsuarioAdmin() {
    const admin = await this.get('SELECT id FROM usuarios WHERE usuario = ?', ['admin']);
    
    if (!admin) {
      const senhaHash = bcrypt.hashSync('admin123', 10);
      await this.run(
        `INSERT INTO usuarios (nome, usuario, senha, nivel, idade, sexo, telefone) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ['Administrador', 'admin', senhaHash, 'ADMIN', 30, 'M', '(11) 99999-9999']
      );
      
      // Criar outros usuários de teste
      const usuarios = [
        ['Enfermeiro', 'enfermeiro', bcrypt.hashSync('enf123', 10), 'ENFERMEIRO', 28, 'F', '(11) 98888-8888'],
        ['Técnico', 'tecnico', bcrypt.hashSync('tec123', 10), 'TECNICO', 25, 'M', '(11) 97777-7777'],
        ['Estagiário', 'estagiario', bcrypt.hashSync('est123', 10), 'ESTAGIARIO', 22, 'F', '(11) 96666-6666']
      ];

      for (const user of usuarios) {
        await this.run(
          `INSERT INTO usuarios (nome, usuario, senha, nivel, idade, sexo, telefone) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          user
        );
      }
      
      console.log('👥 Usuários padrão criados');
    }
  }

  async criarPacientesIniciais() {
    const count = await this.get('SELECT COUNT(*) as total FROM pacientes');
    
    if (count.total === 0) {
      const pacientes = [
        ['Maria da Silva', 75, 'F', '101', 'Alzheimer', 'Acompanhante 24h'],
        ['João Santos', 82, 'M', '102', 'DPOC', 'Oxigênio contínuo'],
        ['Ana Oliveira', 68, 'F', '103', 'Diabetes', 'Insulina NPH'],
        ['Carlos Souza', 71, 'M', '104', 'Parkinson', 'Dificuldade de locomoção']
      ];

      for (const pac of pacientes) {
        await this.run(
          `INSERT INTO pacientes (nome, idade, sexo, quarto, diagnostico, observacoes) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          pac
        );
      }
      
      console.log('👤 Pacientes iniciais criados');
    }
  }

  // Métodos utilitários
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new Database();