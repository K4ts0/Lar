const db = require('../../database');

const relatorioController = {
  // Listar relatórios com filtros
  async listar(req, res) {
    try {
      const { data_inicio, data_fim, tipo } = req.query;
      
      let sql = `
        SELECT r.*, u.nome as criado_por_nome 
        FROM relatorios r
        LEFT JOIN usuarios u ON r.criado_por = u.id
        WHERE 1=1
      `;
      const params = [];

      if (data_inicio) {
        sql += ' AND r.data_plantao >= ?';
        params.push(data_inicio);
      }

      if (data_fim) {
        sql += ' AND r.data_plantao <= ?';
        params.push(data_fim);
      }

      if (tipo) {
        sql += ' AND r.tipo = ?';
        params.push(tipo);
      }

      // Se não for admin, mostrar apenas próprios relatórios
      if (req.usuario.nivel !== 'ADMIN') {
        sql += ' AND r.criado_por = ?';
        params.push(req.usuario.id);
      }

      sql += ' ORDER BY r.data_plantao DESC, r.created_at DESC';

      const relatorios = await db.all(sql, params);
      
      res.json(relatorios);
    } catch (error) {
      console.error('Erro ao listar relatórios:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao listar relatórios' 
      });
    }
  },

  // Buscar relatório por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const relatorio = await db.get(
        `SELECT r.*, u.nome as criado_por_nome 
         FROM relatorios r
         LEFT JOIN usuarios u ON r.criado_por = u.id
         WHERE r.id = ?`,
        [id]
      );

      if (!relatorio) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Relatório não encontrado' 
        });
      }

      // Verificar permissão
      if (req.usuario.nivel !== 'ADMIN' && relatorio.criado_por !== req.usuario.id) {
        return res.status(403).json({ 
          sucesso: false, 
          erro: 'Acesso negado a este relatório' 
        });
      }

      res.json(relatorio);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar relatório' 
      });
    }
  },

  // Buscar relatório completo com todos os detalhes
  async buscarCompleto(req, res) {
    try {
      const { id } = req.params;
      
      const relatorio = await db.get(
        `SELECT r.*, u.nome as criado_por_nome 
         FROM relatorios r
         LEFT JOIN usuarios u ON r.criado_por = u.id
         WHERE r.id = ?`,
        [id]
      );

      if (!relatorio) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Relatório não encontrado' 
        });
      }

      // Verificar permissão
      if (req.usuario.nivel !== 'ADMIN' && relatorio.criado_por !== req.usuario.id) {
        return res.status(403).json({ 
          sucesso: false, 
          erro: 'Acesso negado a este relatório' 
        });
      }

      // Buscar dados relacionados
      const curativos = await db.all(
        'SELECT * FROM curativos WHERE relatorio_id = ?',
        [id]
      );

      const remocoes = await db.all(
        'SELECT * FROM remocoes WHERE relatorio_id = ?',
        [id]
      );

      const hgt = await db.all(
        'SELECT * FROM hgt WHERE relatorio_id = ?',
        [id]
      );

      const tricotomias = await db.all(
        'SELECT * FROM tricotomias WHERE relatorio_id = ?',
        [id]
      );

      const ingesta = await db.all(
        'SELECT * FROM ingesta_hidrica WHERE relatorio_id = ?',
        [id]
      );

      // Processar campos JSON
      if (relatorio.plantonistas) {
        try {
          relatorio.plantonistas = JSON.parse(relatorio.plantonistas);
        } catch {
          relatorio.plantonistas = relatorio.plantonistas.split(',').map(s => s.trim());
        }
      }

      if (relatorio.particulares) {
        try {
          relatorio.particulares = JSON.parse(relatorio.particulares);
        } catch {
          relatorio.particulares = relatorio.particulares.split(',').map(s => s.trim());
        }
      }

      if (relatorio.procedimentos) {
        try {
          relatorio.procedimentos = JSON.parse(relatorio.procedimentos);
        } catch {
          relatorio.procedimentos = relatorio.procedimentos.split(',').map(s => s.trim());
        }
      }

      if (relatorio.observacoes) {
        try {
          relatorio.observacoes = JSON.parse(relatorio.observacoes);
        } catch {
          relatorio.observacoes = relatorio.observacoes.split('\n').filter(s => s.trim());
        }
      }

      res.json({
        ...relatorio,
        curativos,
        remocoes,
        hgt,
        tricotomias,
        ingesta
      });

    } catch (error) {
      console.error('Erro ao buscar relatório completo:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao buscar relatório' 
      });
    }
  },

  // Criar novo relatório
  async criar(req, res) {
    try {
      const {
        data_plantao, tipo, plantonistas, particulares, procedimentos,
        observacoes, hospitalizados, evacuacao, banhos, insulinas,
        saida, passagem_plantao, enfermagem, farmacia,
        curativos, remocoes, hgt, tricotomias, ingesta
      } = req.body;

      // Validações
      if (!data_plantao || !tipo || !passagem_plantao) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Data, tipo e passagem de plantão são obrigatórios' 
        });
      }

      if (!['noturno', 'diurno'].includes(tipo)) {
        return res.status(400).json({ 
          sucesso: false, 
          erro: 'Tipo de relatório inválido' 
        });
      }

      // Iniciar transação
      await db.run('BEGIN TRANSACTION');

      try {
        // Inserir relatório principal
        const result = await db.run(
          `INSERT INTO relatorios (
            data_plantao, tipo, plantonistas, particulares, procedimentos,
            observacoes, hospitalizados, evacuacao, banhos, insulinas,
            saida, passagem_plantao, enfermagem, farmacia, criado_por
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            data_plantao,
            tipo,
            plantonistas ? JSON.stringify(plantonistas) : null,
            particulares ? JSON.stringify(particulares) : null,
            procedimentos ? JSON.stringify(procedimentos) : null,
            observacoes ? JSON.stringify(observacoes) : null,
            hospitalizados ? JSON.stringify(hospitalizados) : null,
            evacuacao ? JSON.stringify(evacuacao) : null,
            banhos ? JSON.stringify(banhos) : null,
            insulinas ? JSON.stringify(insulinas) : null,
            saida ? JSON.stringify(saida) : null,
            passagem_plantao,
            enfermagem || null,
            farmacia || null,
            req.usuario.id
          ]
        );

        const relatorioId = result.id;

        // Inserir curativos
        if (curativos && Array.isArray(curativos)) {
          for (const cur of curativos) {
            if (cur.residente) {
              await db.run(
                `INSERT INTO curativos (relatorio_id, residente, profissional, tipo_local, observacoes)
                 VALUES (?, ?, ?, ?, ?)`,
                [relatorioId, cur.residente, cur.profissional, cur.tipo_local, cur.observacoes || null]
              );
            }
          }
        }

        // Inserir remoções
        if (remocoes && Array.isArray(remocoes)) {
          for (const rem of remocoes) {
            if (rem.residente) {
              await db.run(
                `INSERT INTO remocoes (relatorio_id, residente, cuidador, data_remocao, hora_remocao, destino, observacoes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [relatorioId, rem.residente, rem.cuidador || null, rem.data_remocao || null, rem.hora_remocao || null, rem.destino, rem.observacoes || null]
              );
            }
          }
        }

        // Inserir HGT
        if (hgt && Array.isArray(hgt)) {
          for (const h of hgt) {
            if (h.residente) {
              await db.run(
                `INSERT INTO hgt (relatorio_id, residente, valor, almoco, jantar, observacoes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [relatorioId, h.residente, h.valor || null, h.almoco || null, h.jantar || null, h.observacoes || null]
              );
            }
          }
        }

        // Inserir tricotomias
        if (tricotomias && Array.isArray(tricotomias)) {
          for (const tric of tricotomias) {
            if (tric.paciente) {
              await db.run(
                `INSERT INTO tricotomias (relatorio_id, paciente, profissional, quantidade)
                 VALUES (?, ?, ?, ?)`,
                [relatorioId, tric.paciente, tric.profissional, tric.quantidade || null]
              );
            }
          }
        }

        // Inserir ingesta hídrica
        if (ingesta && Array.isArray(ingesta)) {
          for (const ing of ingesta) {
            if (ing.horario && ing.valor) {
              await db.run(
                `INSERT INTO ingesta_hidrica (relatorio_id, horario, valor)
                 VALUES (?, ?, ?)`,
                [relatorioId, ing.horario, ing.valor]
              );
            }
          }
        }

        await db.run('COMMIT');

        res.status(201).json({
          sucesso: true,
          mensagem: 'Relatório salvo com sucesso',
          id: relatorioId
        });

      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Erro ao criar relatório:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao salvar relatório' 
      });
    }
  },

  // Atualizar relatório
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar permissão
      const relatorio = await db.get(
        'SELECT criado_por FROM relatorios WHERE id = ?',
        [id]
      );

      if (!relatorio) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Relatório não encontrado' 
        });
      }

      if (req.usuario.nivel !== 'ADMIN' && relatorio.criado_por !== req.usuario.id) {
        return res.status(403).json({ 
          sucesso: false, 
          erro: 'Acesso negado a este relatório' 
        });
      }

      // Aqui você pode implementar a atualização
      // Por enquanto, apenas retornamos erro
      res.status(501).json({ 
        sucesso: false, 
        erro: 'Funcionalidade em desenvolvimento' 
      });

    } catch (error) {
      console.error('Erro ao atualizar relatório:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao atualizar relatório' 
      });
    }
  },

  // Deletar relatório
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const relatorio = await db.get(
        'SELECT id FROM relatorios WHERE id = ?',
        [id]
      );

      if (!relatorio) {
        return res.status(404).json({ 
          sucesso: false, 
          erro: 'Relatório não encontrado' 
        });
      }

      // Deletar (as relações serão deletadas em cascata)
      await db.run('DELETE FROM relatorios WHERE id = ?', [id]);

      res.json({
        sucesso: true,
        mensagem: 'Relatório deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      res.status(500).json({ 
        sucesso: false, 
        erro: 'Erro ao deletar relatório' 
      });
    }
  }
};

module.exports = relatorioController;