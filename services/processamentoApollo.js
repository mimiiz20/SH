
/*
 * SUNNY HEALTH - PROCESSAMENTO APOLLO
 *
 * Responsabilidades:
 * 1. Receber amostras do acelerômetro e giroscópio.
 * 2. Estimar e remover a influência da gravidade.
 * 3. Calcular intensidade do movimento.
 * 4. Identificar oscilações e estimar sua frequência.
 * 5. Calcular regularidade dos intervalos.
 * 6. Detectar e finalizar episódios experimentais.
 * 7. Receber e repassar a frequencia cardiaca do MAX30102.
 *
 * Os limites são experimentais e precisam ser
 * calibrados com dados reais do dispositivo.
 */

// ==========================================
// 1. CONFIGURAÇÕES
// ==========================================

const CONFIG = {
  janelaMs: 5000,

  tempoGravidade: 0.8,

  // Limites experimentais de movimento.
  limiteInicioMovimento: 0.06,
  limiteFimMovimento: 0.04,

  limiteInicioGiroscopio: 8,
  limiteFimGiroscopio: 5,

  // Duração mínima para registrar um episódio.
  tempoMinimoEpisodio: 1000,

  // Tempo de inatividade para encerrar um episódio.
  tempoEncerramento: 1500,

  // Distância mínima entre picos.
  distanciaMinimaPicos: 0.15,

  // Faixa de frequência analisada.
  frequenciaMinima: 0.5,
  frequenciaMaxima: 8,

  // Quantidade máxima de amostras guardadas no episódio.
  maximoAmostrasEpisodio: 2000,
};

// ==========================================
// 2. ESTADO DO PROCESSAMENTO
// ==========================================

let amostras = [];

let gravidade = {
  x: null,
  y: null,
  z: null,
};

let ultimaAmostraEm = null;

let episodioAtual = null;

// ==========================================
// 3. FUNÇÕES MATEMÁTICAS
// ==========================================

function limitar(valor, minimo, maximo) {
  return Math.max(minimo, Math.min(maximo, valor));
}

function calcularMagnitude(x, y, z) {
  return Math.sqrt(
    x * x + y * y + z * z
  );
}

function calcularMedia(valores) {
  if (!valores.length) return 0;

  return valores.reduce(
    (total, valor) => total + valor,
    0
  ) / valores.length;
}

function calcularDesvioPadrao(valores) {
  if (valores.length < 2) return 0;

  const media = calcularMedia(valores);

  const variancia = calcularMedia(
    valores.map(valor => (valor - media) ** 2)
  );

  return Math.sqrt(variancia);
}

// ==========================================
// 4. VALIDAÇÃO E PREPARAÇÃO DA AMOSTRA
// ==========================================

function validarAmostra(dados) {
  const campos = [
    'aceleracao_x',
    'aceleracao_y',
    'aceleracao_z',
    'giroscopio_x',
    'giroscopio_y',
    'giroscopio_z',
  ];

  return (
    dados &&
    campos.every(campo =>
      Number.isFinite(Number(dados[campo]))
    )
  );
}

// NOVO: validação da frequência cardíaca.
// Não calcula BPM a partir dos movimentos.
function obterFrequenciaCardiaca(dados) {
  const bpm = Number(dados?.frequencia_cardiaca);

  if (
    dados?.frequencia_cardiaca === null ||
    dados?.frequencia_cardiaca === undefined ||
    dados?.frequencia_cardiaca === ''
  ) {
    return null;
  }

  if (
    !Number.isFinite(bpm) ||
    bpm <= 0 ||
    bpm > 255
  ) {
    return null;
  }

  return Math.round(bpm);
}

function prepararAmostra(dados) {
  let instante;

  if (
    dados.recebido_em_timestamp !== undefined &&
    dados.recebido_em_timestamp !== null &&
    dados.recebido_em_timestamp !== ''
  ) {
    instante = Number(dados.recebido_em_timestamp);
  } else if (dados.recebido_em) {
    instante = new Date(dados.recebido_em).getTime();
  } else {
    instante = Date.now();
  }

  if (!Number.isFinite(instante)) {
    throw new Error('Horário da amostra inválido.');
  }

  return {
    instante,

    aceleracao: {
      x: Number(dados.aceleracao_x),
      y: Number(dados.aceleracao_y),
      z: Number(dados.aceleracao_z),
    },

    giroscopio: {
      x: Number(dados.giroscopio_x),
      y: Number(dados.giroscopio_y),
      z: Number(dados.giroscopio_z),
    },

    // NOVO: recebe o BPM calculado pelo Arduino.
    frequencia_cardiaca: obterFrequenciaCardiaca(dados),
  };
}

// ==========================================
// 5. ESTIMATIVA DA GRAVIDADE
// ==========================================

function calcularAceleracaoDinamica(amostra, dt) {
  const alpha = 1 - Math.exp(
    -dt / CONFIG.tempoGravidade
  );

  if (gravidade.x === null) {
    gravidade.x = amostra.aceleracao.x;
    gravidade.y = amostra.aceleracao.y;
    gravidade.z = amostra.aceleracao.z;
  } else {
    gravidade.x += alpha * (
      amostra.aceleracao.x - gravidade.x
    );

    gravidade.y += alpha * (
      amostra.aceleracao.y - gravidade.y
    );

    gravidade.z += alpha * (
      amostra.aceleracao.z - gravidade.z
    );
  }

  const x = amostra.aceleracao.x - gravidade.x;
  const y = amostra.aceleracao.y - gravidade.y;
  const z = amostra.aceleracao.z - gravidade.z;

  return {
    x,
    y,
    z,
    magnitude: calcularMagnitude(x, y, z),
  };
}

// ==========================================
// 6. DETECÇÃO DE PICOS
// ==========================================

function detectarPicos(lista) {
  const picos = [];

  if (lista.length < 3) {
    return picos;
  }

  for (let i = 1; i < lista.length - 1; i++) {
    const anterior = lista[i - 1];
    const atual = lista[i];
    const proximo = lista[i + 1];

    const ehPico =
      atual.aceleracaoDinamica > anterior.aceleracaoDinamica &&
      atual.aceleracaoDinamica >= proximo.aceleracaoDinamica &&
      atual.aceleracaoDinamica >= 0.04;

    if (!ehPico) continue;

    const ultimoPico = picos[picos.length - 1];

    const intervalo = ultimoPico
      ? (atual.instante - ultimoPico.instante) / 1000
      : Infinity;

    if (intervalo >= CONFIG.distanciaMinimaPicos) {
      picos.push({
        instante: atual.instante,
        amplitude: atual.aceleracaoDinamica,
      });
    }
  }

  return picos;
}

// ==========================================
// 7. FREQUÊNCIA E REGULARIDADE
// ==========================================

function calcularFrequencia(picos) {
  if (picos.length < 3) {
    return {
      frequencia_hz: null,
      regularidade: null,
    };
  }

  const intervalos = [];

  for (let i = 1; i < picos.length; i++) {
    const intervalo =
      (picos[i].instante - picos[i - 1].instante) / 1000;

    if (intervalo > 0) {
      intervalos.push(intervalo);
    }
  }

  if (intervalos.length < 2) {
    return {
      frequencia_hz: null,
      regularidade: null,
    };
  }

  const intervaloMedio = calcularMedia(intervalos);

  const desvio = calcularDesvioPadrao(intervalos);

  const frequencia = 1 / intervaloMedio;

  if (
    frequencia < CONFIG.frequenciaMinima ||
    frequencia > CONFIG.frequenciaMaxima
  ) {
    return {
      frequencia_hz: null,
      regularidade: null,
    };
  }

  const regularidade = limitar(
    1 - desvio / intervaloMedio,
    0,
    1
  );

  return {
    frequencia_hz: Number(frequencia.toFixed(2)),

    regularidade: Number(regularidade.toFixed(3)),
  };
}

// ==========================================
// 8. ANÁLISE DA JANELA DE AMOSTRAS
// ==========================================

function analisarLista(lista) {
  if (!lista.length) return null;

  const intensidades = lista.map(
    item => item.aceleracaoDinamica
  );

  const giroscopios = lista.map(
    item => item.giroscopioMagnitude
  );

  const intensidadeMedia = calcularMedia(intensidades);

  const intensidadeRms = Math.sqrt(
    calcularMedia(
      intensidades.map(valor => valor * valor)
    )
  );

  const intensidadeMaxima = Math.max(...intensidades);

  const giroscopioMedio = calcularMedia(giroscopios);

  const picos = detectarPicos(lista);

  const frequencia = calcularFrequencia(picos);

  // NOVO: utiliza a leitura mais recente válida.
  const ultimaAmostra = lista[lista.length - 1];

  return {
    intensidade_movimento: Number(
      intensidadeRms.toFixed(4)
    ),

    intensidade_oscillacao: Number(
      intensidadeMedia.toFixed(4)
    ),

    intensidade_maxima: Number(
      intensidadeMaxima.toFixed(4)
    ),

    intensidade_giroscopio: Number(
      giroscopioMedio.toFixed(2)
    ),

    frequencia_hz: frequencia.frequencia_hz,

    regularidade: frequencia.regularidade,

    quantidade_picos: picos.length,

    quantidade_amostras: lista.length,

    // NOVO: BPM recebido do MAX30102.
    frequencia_cardiaca:
      ultimaAmostra.frequencia_cardiaca ?? null,
  };
}

function analisarJanela() {
  return analisarLista(amostras);
}

// ==========================================
// 9. CONTROLE DOS EPISÓDIOS
// ==========================================

function iniciarEpisodio(amostra) {
  episodioAtual = {
    inicio_em: new Date(
      amostra.instante
    ).toISOString(),

    inicio_timestamp: amostra.instante,

    ultima_atividade: amostra.instante,

    quantidade_amostras: 0,

    amplitude_maxima: 0,

    amostras: [],
  };
}

function atualizarEpisodio(amostra) {
  if (!episodioAtual) return;

  episodioAtual.ultima_atividade = amostra.instante;

  episodioAtual.quantidade_amostras++;

  episodioAtual.amplitude_maxima = Math.max(
    episodioAtual.amplitude_maxima,
    amostra.aceleracaoDinamica
  );

  episodioAtual.amostras.push(amostra);

  // Evita crescimento ilimitado da memória.
  if (
    episodioAtual.amostras.length >
    CONFIG.maximoAmostrasEpisodio
  ) {
    episodioAtual.amostras.shift();
  }
}

// ==========================================
// 10. FINALIZAÇÃO DO EPISÓDIO
// ==========================================

function finalizarEpisodio() {
  if (!episodioAtual) return null;

  const episodio = episodioAtual;

  const duracao =
    episodio.ultima_atividade -
    episodio.inicio_timestamp;

  const analise = analisarLista(episodio.amostras);

  const resultado = {
    inicio_em: episodio.inicio_em,

    fim_em: new Date(
      episodio.ultima_atividade
    ).toISOString(),

    duracao_ms: Math.max(0, duracao),

    frequencia_hz:
      analise?.frequencia_hz ?? null,

    amplitude: Number(
      episodio.amplitude_maxima.toFixed(4)
    ),

    regularidade:
      analise?.regularidade ?? null,

    quantidade_amostras:
      episodio.quantidade_amostras,

    classificacao: 'experimental',
  };

  // Libera a memória do episódio.
  episodioAtual = null;

  if (duracao < CONFIG.tempoMinimoEpisodio) {
    return null;
  }

  return resultado;
}

// ==========================================
// 11. DETECÇÃO DE ATIVIDADE
// ==========================================

function detectarAtividade(amostra) {
  const intensidade = amostra.aceleracaoDinamica;

  const giroscopio = amostra.giroscopioMagnitude;

  const movimentoDetectado =
    intensidade >= CONFIG.limiteInicioMovimento ||
    giroscopio >= CONFIG.limiteInicioGiroscopio;

  const movimentoFinalizado =
    intensidade < CONFIG.limiteFimMovimento &&
    giroscopio < CONFIG.limiteFimGiroscopio;

  // Inicia um episódio quando o movimento aparece.
  if (!episodioAtual && movimentoDetectado) {
    iniciarEpisodio(amostra);
  }

  if (!episodioAtual) {
    return null;
  }

  if (!movimentoFinalizado) {
    // Atualiza o último instante de atividade.
    atualizarEpisodio(amostra);

    return null;
  }

  // Verifica quanto tempo passou desde a última atividade.
  const tempoInativo =
    amostra.instante - episodioAtual.ultima_atividade;

  if (tempoInativo >= CONFIG.tempoEncerramento) {
    return finalizarEpisodio();
  }

  return null;
}

// ==========================================
// 12. FUNÇÃO PRINCIPAL
// ==========================================

export function processarAmostraApollo(dados) {
  if (!validarAmostra(dados)) {
    return {
      sucesso: false,
      erro: 'Amostra inválida ou incompleta.',
      indicadores: null,
      episodioFinalizado: null,
    };
  }

  try {
    const amostra = prepararAmostra(dados);

    let dt = ultimaAmostraEm === null
      ? 0.02
      : (amostra.instante - ultimaAmostraEm) / 1000;

    // Evita intervalos inválidos.
    if (!Number.isFinite(dt) || dt <= 0) {
      dt = 0.02;
    }

    // Evita atualizações excessivas da estimativa de gravidade.
    dt = limitar(dt, 0.001, 1);

    ultimaAmostraEm = amostra.instante;

    // Remove aproximadamente a influência da gravidade.
    const dinamica = calcularAceleracaoDinamica(
      amostra,
      dt
    );

    const giroscopioMagnitude = calcularMagnitude(
      amostra.giroscopio.x,
      amostra.giroscopio.y,
      amostra.giroscopio.z
    );

    const amostraProcessada = {
      instante: amostra.instante,

      aceleracaoDinamica: dinamica.magnitude,

      giroscopioMagnitude,

      // NOVO: preserva o BPM recebido.
      frequencia_cardiaca: amostra.frequencia_cardiaca,
    };

    // Guarda a amostra na janela de análise.
    amostras.push(amostraProcessada);

    amostras = amostras.filter(
      item =>
        amostra.instante - item.instante <= CONFIG.janelaMs
    );

    // Calcula os indicadores atuais.
    const indicadores = analisarJanela();

    // Atualiza ou finaliza um episódio.
    const episodioFinalizado = detectarAtividade(
      amostraProcessada
    );

    return {
      sucesso: true,

      indicadores,

      episodioFinalizado,

      aceleracaoDinamica: dinamica,

      giroscopioMagnitude: Number(
        giroscopioMagnitude.toFixed(2)
      ),

      // NOVO: também disponível diretamente no resultado.
      frequencia_cardiaca: amostra.frequencia_cardiaca,
    };

  } catch (erro) {
    console.error(
      'Erro no processamento Apollo:',
      erro?.message || erro
    );

    return {
      sucesso: false,
      erro: erro.message,
      indicadores: null,
      episodioFinalizado: null,
    };
  }
}

// ==========================================
// 13. REINICIALIZAÇÃO
// ==========================================

export function reiniciarProcessamentoApollo() {
  amostras = [];

  gravidade = {
    x: null,
    y: null,
    z: null,
  };

  ultimaAmostraEm = null;

  episodioAtual = null;
}
