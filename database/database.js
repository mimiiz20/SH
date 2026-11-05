
import * as SQLite from 'expo-sqlite';

// ==========================================
// ESTADO DO BANCO
// ==========================================

let db = null;
let dbPromise = null;
let inicializacaoPromise = null;

// ==========================================
// ABRIR BANCO DE DADOS
// ==========================================

export async function getDatabase() {
  if (db) {
    return db;
  }

  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('sunny_health.db')
      .then(database => {
        db = database;
        return database;
      })
      .catch(error => {
        dbPromise = null;
        console.error('Erro ao abrir banco:', error);
        throw error;
      });
  }

  return dbPromise;
}

// ==========================================
// ADICIONAR COLUNA SE NÃO EXISTIR
// ==========================================

async function adicionarColunaSeNecessario(
  database,
  tabela,
  coluna,
  tipo
) {
  // Evita nomes inválidos em comandos SQL.
  const identificadorValido = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  if (
    !identificadorValido.test(tabela) ||
    !identificadorValido.test(coluna) ||
    !/^[A-Z ]+$/i.test(tipo)
  ) {
    throw new Error('Identificador inválido na migração SQLite.');
  }

  const colunas = await database.getAllAsync(
    `PRAGMA table_info(${tabela})`
  );

  const existe = colunas.some(
    item => item.name === coluna
  );

  if (!existe) {
    await database.execAsync(
      `ALTER TABLE ${tabela} ADD COLUMN ${coluna} ${tipo}`
    );

    console.log(`Coluna adicionada: ${tabela}.${coluna}`);
  }
}

// ==========================================
// MIGRAÇÕES DOS QUESTIONÁRIOS
// ==========================================

async function migrarQuestionarios(database) {
  const colunas = [
    ['horas_sono', 'INTEGER'],
    ['qualidade_sono', 'INTEGER'],
    ['despertares', 'INTEGER'],
    ['dificuldade_dormir', 'INTEGER'],
    ['descanso', 'INTEGER'],

    ['refeicoes_dia', 'INTEGER'],
    ['frutas', 'INTEGER'],
    ['verduras', 'INTEGER'],
    ['ultraprocessados', 'INTEGER'],
    ['agua', 'INTEGER'],

    ['humor', 'INTEGER'],
    ['estresse', 'INTEGER'],
    ['relaxamento', 'INTEGER'],
    ['disposicao', 'INTEGER'],

    ['atividade_minutos', 'INTEGER'],
    ['atividade_frequencia', 'INTEGER'],

    ['tipo_sanguineo', 'TEXT'],
    ['fator_rh', 'TEXT'],
    ['tipagem_confirmada', 'TEXT'],

    ['dificuldade_atividades', 'INTEGER'],
    ['criado_em', 'TEXT'],
  ];

  for (const [coluna, tipo] of colunas) {
    await adicionarColunaSeNecessario(
      database,
      'questionarios',
      coluna,
      tipo
    );
  }
}

// ==========================================
// MIGRAÇÕES APOLLO
// ==========================================

async function prepararTabelaApolloInterno(database) {
  // Criar tabela de medições.
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS medicoes_apollo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,

      aceleracao_x REAL,
      aceleracao_y REAL,
      aceleracao_z REAL,

      giroscopio_x REAL,
      giroscopio_y REAL,
      giroscopio_z REAL,

      intensidade_sonora REAL,
      frequencia_cardiaca INTEGER,

      recebido_em TEXT,

      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  // Criar tabela de episódios.
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS episodios_movimento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      usuario_id INTEGER,

      inicio_em TEXT,
      fim_em TEXT,

      duracao_ms INTEGER,

      frequencia_hz REAL,
      amplitude REAL,
      regularidade REAL,

      quantidade_amostras INTEGER,

      classificacao TEXT DEFAULT 'experimental',

      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    );
  `);

  // Garantir colunas da tabela de medições.
  const colunasMedicoes = [
    ['usuario_id', 'INTEGER'],
    ['aceleracao_x', 'REAL'],
    ['aceleracao_y', 'REAL'],
    ['aceleracao_z', 'REAL'],
    ['giroscopio_x', 'REAL'],
    ['giroscopio_y', 'REAL'],
    ['giroscopio_z', 'REAL'],
    ['intensidade_sonora', 'REAL'],
    ['frequencia_cardiaca', 'INTEGER'],
    ['recebido_em', 'TEXT'],
  ];

  for (const [coluna, tipo] of colunasMedicoes) {
    await adicionarColunaSeNecessario(
      database,
      'medicoes_apollo',
      coluna,
      tipo
    );
  }

  // Garantir colunas dos episódios.
  const colunasEpisodios = [
    ['usuario_id', 'INTEGER'],
    ['inicio_em', 'TEXT'],
    ['fim_em', 'TEXT'],
    ['duracao_ms', 'INTEGER'],
    ['frequencia_hz', 'REAL'],
    ['amplitude', 'REAL'],
    ['regularidade', 'REAL'],
    ['quantidade_amostras', 'INTEGER'],
    ['classificacao', 'TEXT'],
    ['criado_em', 'TEXT'],
  ];

  for (const [coluna, tipo] of colunasEpisodios) {
    await adicionarColunaSeNecessario(
      database,
      'episodios_movimento',
      coluna,
      tipo
    );
  }

  // Criar índices depois das migrações.
  await database.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_medicoes_usuario
    ON medicoes_apollo(usuario_id);

    CREATE INDEX IF NOT EXISTS idx_medicoes_recebido
    ON medicoes_apollo(recebido_em);

    CREATE INDEX IF NOT EXISTS idx_episodios_usuario
    ON episodios_movimento(usuario_id);

    CREATE INDEX IF NOT EXISTS idx_episodios_inicio
    ON episodios_movimento(inicio_em);
  `);
}

// ==========================================
// INICIALIZAR BANCO DE DADOS
// ==========================================

export async function initializeDatabase() {
  if (!inicializacaoPromise) {
    inicializacaoPromise = (async () => {
      const database = await getDatabase();

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL,
          criado_em TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessao (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          usuario_id INTEGER,
          onboarding_concluido INTEGER DEFAULT 0,
          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );

        CREATE TABLE IF NOT EXISTS questionarios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          usuario_id INTEGER NOT NULL,

          horas_sono INTEGER,
          qualidade_sono INTEGER,
          despertares INTEGER,
          dificuldade_dormir INTEGER,
          descanso INTEGER,

          refeicoes_dia INTEGER,
          frutas INTEGER,
          verduras INTEGER,
          ultraprocessados INTEGER,
          agua INTEGER,

          humor INTEGER,
          estresse INTEGER,
          relaxamento INTEGER,
          disposicao INTEGER,

          atividade_minutos INTEGER,
          atividade_frequencia INTEGER,

          tipo_sanguineo TEXT,
          fator_rh TEXT,
          tipagem_confirmada TEXT,

          dificuldade_atividades INTEGER,

          criado_em TEXT DEFAULT CURRENT_TIMESTAMP,

          FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        );
      `);

      // Migrar questionários antigos.
      await migrarQuestionarios(database);

      // Preparar as tabelas Apollo.
      await prepararTabelaApolloInterno(database);

      console.log('Banco Sunny Health inicializado.');

      return database;
    })().catch(error => {
      inicializacaoPromise = null;

      console.error(
        'Erro na inicialização do banco:',
        error
      );

      throw error;
    });
  }

  return inicializacaoPromise;
}

// ==========================================
// PREPARAR APOLLO
// ==========================================

export async function prepararTabelaApollo() {
  return await initializeDatabase();
}

// ==========================================
// PEGAR USUÁRIO LOGADO
// ==========================================

export async function getUsuarioLogado() {
  const database = await initializeDatabase();

  const sessao = await database.getFirstAsync(`
    SELECT usuario_id
    FROM sessao
    WHERE id = 1
    LIMIT 1
  `);

  return sessao?.usuario_id ?? null;
}

// ==========================================
// CONVERTER VALORES NUMÉRICOS
// ==========================================

function numeroOuNull(valor) {
  if (
    valor === null ||
    valor === undefined ||
    valor === ''
  ) {
    return null;
  }

  const numero = Number(valor);

  return Number.isFinite(numero) ? numero : null;
}

function obterDataValida(dados) {
  let data = null;

  if (dados?.recebido_em_timestamp != null) {
    const timestamp = Number(dados.recebido_em_timestamp);

    if (Number.isFinite(timestamp)) {
      data = new Date(timestamp);
    }
  }

  if (
    (!data || Number.isNaN(data.getTime())) &&
    dados?.recebido_em
  ) {
    const tentativa = new Date(dados.recebido_em);

    if (!Number.isNaN(tentativa.getTime())) {
      data = tentativa;
    }
  }

  if (!data || Number.isNaN(data.getTime())) {
    data = new Date();
  }

  return data.toISOString();
}

// ==========================================
// SALVAR MEDIÇÃO APOLLO
// ==========================================

export async function salvarMedicaoApollo(dados = {}) {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  if (usuarioId == null) {
    throw new Error(
      'Não existe usuário logado para salvar a medição Apollo.'
    );
  }

  const bpm = numeroOuNull(
    dados.frequencia_cardiaca
  );

  const frequenciaCardiaca =
    bpm !== null && bpm > 0
      ? Math.round(bpm)
      : null;

  const recebidoEm = obterDataValida(dados);

  const resultado = await database.runAsync(
    `INSERT INTO medicoes_apollo (
      usuario_id,
      aceleracao_x,
      aceleracao_y,
      aceleracao_z,
      giroscopio_x,
      giroscopio_y,
      giroscopio_z,
      intensidade_sonora,
      frequencia_cardiaca,
      recebido_em
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    usuarioId,
    numeroOuNull(dados.aceleracao_x),
    numeroOuNull(dados.aceleracao_y),
    numeroOuNull(dados.aceleracao_z),
    numeroOuNull(dados.giroscopio_x),
    numeroOuNull(dados.giroscopio_y),
    numeroOuNull(dados.giroscopio_z),
    numeroOuNull(dados.intensidade_sonora),
    frequenciaCardiaca,
    recebidoEm
  );

  return resultado.lastInsertRowId;
}

// ==========================================
// BUSCAR ÚLTIMA MEDIÇÃO
// ==========================================

export async function buscarUltimaMedicaoApollo() {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  if (usuarioId == null) {
    return null;
  }

  return await database.getFirstAsync(
    `SELECT *
     FROM medicoes_apollo
     WHERE usuario_id = ?
     ORDER BY id DESC
     LIMIT 1`,
    usuarioId
  );
}

// ==========================================
// BUSCAR HISTÓRICO DE MEDIÇÕES
// ==========================================

export async function buscarHistoricoApollo(limite = 100) {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  if (usuarioId == null) {
    return [];
  }

  const quantidade = Math.max(
    1,
    Math.min(1000, Math.floor(Number(limite) || 100))
  );

  return await database.getAllAsync(
    `SELECT *
     FROM medicoes_apollo
     WHERE usuario_id = ?
     ORDER BY id DESC
     LIMIT ?`,
    usuarioId,
    quantidade
  );
}

// ==========================================
// SALVAR EPISÓDIO DE MOVIMENTO
// ==========================================

export async function salvarEpisodioMovimento(dados = {}) {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  if (usuarioId == null) {
    throw new Error(
      'Não existe usuário logado para salvar o episódio.'
    );
  }

  const inicio = dados.inicio_em;
  const fim = dados.fim_em;
  const duracao = Number(dados.duracao_ms);

  if (
    !inicio ||
    !fim ||
    !Number.isFinite(duracao) ||
    duracao < 0
  ) {
    throw new Error(
      'Dados inválidos para registrar o episódio.'
    );
  }

  const resultado = await database.runAsync(
    `INSERT INTO episodios_movimento (
      usuario_id,
      inicio_em,
      fim_em,
      duracao_ms,
      frequencia_hz,
      amplitude,
      regularidade,
      quantidade_amostras,
      classificacao
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    usuarioId,
    String(inicio),
    String(fim),
    duracao,
    numeroOuNull(dados.frequencia_hz),
    numeroOuNull(dados.amplitude),
    numeroOuNull(dados.regularidade),
    numeroOuNull(dados.quantidade_amostras),
    dados.classificacao || 'experimental'
  );

  return resultado.lastInsertRowId;
}

// ==========================================
// BUSCAR EPISÓDIOS
// ==========================================

export async function buscarEpisodiosMovimento(limite = 100) {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  if (usuarioId == null) {
    return [];
  }

  const quantidade = Math.max(
    1,
    Math.min(1000, Math.floor(Number(limite) || 100))
  );

  return await database.getAllAsync(
    `SELECT *
     FROM episodios_movimento
     WHERE usuario_id = ?
     ORDER BY inicio_em DESC
     LIMIT ?`,
    usuarioId,
    quantidade
  );
}

// ==========================================
// RESUMO DOS EPISÓDIOS
// ==========================================

export async function buscarResumoEpisodiosMovimento() {
  const database = await initializeDatabase();

  const usuarioId = await getUsuarioLogado();

  const resumoVazio = {
    quantidade: 0,
    duracao_total_ms: 0,
    frequencia_media: null,
    amplitude_media: null,
    ultimo_episodio: null,
  };

  if (usuarioId == null) {
    return resumoVazio;
  }

  const resumo = await database.getFirstAsync(
    `SELECT
       COUNT(*) AS quantidade,
       COALESCE(SUM(duracao_ms), 0) AS duracao_total_ms,
       AVG(frequencia_hz) AS frequencia_media,
       AVG(amplitude) AS amplitude_media
     FROM episodios_movimento
     WHERE usuario_id = ?`,
    usuarioId
  );

  const ultimoEpisodio = await database.getFirstAsync(
    `SELECT *
     FROM episodios_movimento
     WHERE usuario_id = ?
     ORDER BY inicio_em DESC
     LIMIT 1`,
    usuarioId
  );

  return {
    quantidade: resumo?.quantidade ?? 0,
    duracao_total_ms: resumo?.duracao_total_ms ?? 0,
    frequencia_media: resumo?.frequencia_media ?? null,
    amplitude_media: resumo?.amplitude_media ?? null,
    ultimo_episodio: ultimoEpisodio ?? null,
  };
}
