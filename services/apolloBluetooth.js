
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { PermissionsAndroid, Platform } from 'react-native';

import {
  salvarMedicaoApollo,
  salvarEpisodioMovimento,
} from '../database/database.js';

import {
  processarAmostraApollo,
  reiniciarProcessamentoApollo,
} from './processamentoApollo.js';

// ==========================================
// CONFIGURAÇÕES BLUETOOTH
// ==========================================

const UUID_SERVICO =
  '12345678-1234-1234-1234-1234567890ab';

const UUID_DADOS =
  '12345678-1234-1234-1234-1234567890ac';

const NOME_PULSEIRA = 'Apollo';

const manager = new BleManager();

// ==========================================
// VARIÁVEIS DA CONEXÃO
// ==========================================

let dispositivo = null;

let monitorDados = null;
let monitorDesconexao = null;

let ultimaGravacao = 0;
let gravacaoEmAndamento = false;

let episodioEmGravacao = false;

// ==========================================
// ESTADO COMPARTILHADO
// ==========================================

let estado = {
  status: 'idle',
  mensagem: 'Pulseira ainda não conectada.',
  dados: null,
  indicadores: null,
  nomeDispositivo: NOME_PULSEIRA,
};

const ouvintes = new Set();

// ==========================================
// GERENCIAMENTO DO ESTADO
// ==========================================

function notificar() {
  ouvintes.forEach((ouvinte) => {
    ouvinte({ ...estado });
  });
}

function atualizarEstado(novosDados) {
  estado = {
    ...estado,
    ...novosDados,
  };

  notificar();
}

export function obterEstadoApollo() {
  return { ...estado };
}

export function assinarApollo(ouvinte) {
  ouvintes.add(ouvinte);

  ouvinte({ ...estado });

  return () => {
    ouvintes.delete(ouvinte);
  };
}

// ==========================================
// PERMISSÕES BLUETOOTH
// ==========================================

async function solicitarPermissoes() {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Number(Platform.Version) >= 31) {
    const resultado =
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);

    return (
      resultado[
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      ] === PermissionsAndroid.RESULTS.GRANTED &&
      resultado[
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      ] === PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const resultado = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return resultado === PermissionsAndroid.RESULTS.GRANTED;
}

// ==========================================
// INTERPRETAÇÃO DOS DADOS DOS SENSORES
// ==========================================

function interpretarDados(valorBase64) {
  const bytes = Buffer.from(valorBase64, 'base64');

  if (bytes.length < 14) {
    throw new Error('Pacote de dados incompleto.');
  }

  // Lê valores de 16 bits com sinal em little-endian.
  const lerInt16 = (posicao) => {
    let valor =
      bytes[posicao] |
      (bytes[posicao + 1] << 8);

    if (valor & 0x8000) {
      valor -= 0x10000;
    }

    return valor;
  };

  const timestamp = Date.now();

  return {
    aceleracao_x: lerInt16(0) / 1000,
    aceleracao_y: lerInt16(2) / 1000,
    aceleracao_z: lerInt16(4) / 1000,

    giroscopio_x: lerInt16(6) / 10,
    giroscopio_y: lerInt16(8) / 10,
    giroscopio_z: lerInt16(10) / 10,

    intensidade_sonora: lerInt16(12) / 10000,

    recebido_em: new Date(timestamp).toLocaleTimeString('pt-BR'),

    recebido_em_timestamp: timestamp,
  };
}

// ==========================================
// REMOÇÃO DOS MONITORES
// ==========================================

function limparMonitores() {
  monitorDados?.remove();
  monitorDados = null;

  monitorDesconexao?.remove();
  monitorDesconexao = null;
}

// ==========================================
// SALVAMENTO DAS MEDIÇÕES NO SQLITE
// ==========================================

async function salvarLeitura(leitura) {
  const agora = Date.now();

  // Salva somente uma leitura a cada 5 segundos.
  if (agora - ultimaGravacao < 5000) {
    return;
  }

  // Evita duas gravações simultâneas.
  if (gravacaoEmAndamento) {
    return;
  }

  gravacaoEmAndamento = true;

  try {
    await salvarMedicaoApollo(leitura);

    ultimaGravacao = agora;
  } catch (erro) {
    console.error(
      'Erro ao salvar medição da Apollo:',
      erro?.message || erro
    );
  } finally {
    gravacaoEmAndamento = false;
  }
}

// ==========================================
// SALVAMENTO DOS EPISÓDIOS
// ==========================================

async function salvarEpisodio(episodio) {
  if (!episodio || episodioEmGravacao) {
    return;
  }

  episodioEmGravacao = true;

  try {
    await salvarEpisodioMovimento(episodio);

    console.log(
      'Episódio Apollo salvo:',
      episodio
    );
  } catch (erro) {
    console.error(
      'Erro ao salvar episódio Apollo:',
      erro?.message || erro
    );
  } finally {
    episodioEmGravacao = false;
  }
}

// ==========================================
// PROCESSAMENTO DAS AMOSTRAS
// ==========================================

function processarLeitura(leitura) {
  try {
    const resultado = processarAmostraApollo(leitura);

    if (!resultado.sucesso) {
      console.warn(
        'Não foi possível processar a amostra:',
        resultado.erro
      );

      return null;
    }

    // Atualiza os indicadores calculados.
    atualizarEstado({
      indicadores: resultado.indicadores,
    });

    // Se um episódio terminou, salva no SQLite.
    if (resultado.episodioFinalizado) {
      salvarEpisodio(resultado.episodioFinalizado);
    }

    return resultado;

  } catch (erro) {
    console.error(
      'Erro no processamento Apollo:',
      erro?.message || erro
    );

    return null;
  }
}

// ==========================================
// CONEXÃO COM A PULSEIRA
// ==========================================

export async function conectarApollo() {
  // Verifica se já existe uma conexão ativa.
  if (dispositivo) {
    try {
      const conectado = await dispositivo.isConnected();

      if (conectado) {
        atualizarEstado({
          status: 'connected',
          mensagem: 'Apollo já está conectada.',
          nomeDispositivo:
            dispositivo.name || NOME_PULSEIRA,
        });

        return true;
      }
    } catch (erro) {
      dispositivo = null;
    }
  }

  atualizarEstado({
    status: 'connecting',
    mensagem: 'Verificando Bluetooth e procurando a Apollo...',
    dados: null,
    indicadores: null,
  });

  let encontrado = null;

  try {
    // 1. Solicita permissões.
    const permissao = await solicitarPermissoes();

    if (!permissao) {
      throw new Error(
        'Permissão Bluetooth não concedida.'
      );
    }

    // 2. Verifica se o Bluetooth está ligado.
    const bluetooth = await manager.state();

    if (bluetooth !== 'PoweredOn') {
      throw new Error(
        'Ative o Bluetooth do celular.'
      );
    }

    // 3. Procura a pulseira.
    encontrado = await new Promise((resolve, reject) => {
      let finalizado = false;

      const encerrar = () => {
        if (finalizado) return;

        finalizado = true;

        clearTimeout(temporizador);

        manager.stopDeviceScan();
      };

      const temporizador = setTimeout(() => {
        encerrar();

        reject(
          new Error(
            'Apollo não encontrada. Verifique se está ligada e próxima do celular.'
          )
        );
      }, 15000);

      manager.startDeviceScan(
        null,
        { allowDuplicates: false },
        (erro, encontradoScan) => {
          if (erro) {
            encerrar();
            reject(erro);
            return;
          }

          const nome =
            encontradoScan?.name ||
            encontradoScan?.localName ||
            '';

          if (
            nome.toLowerCase() ===
            NOME_PULSEIRA.toLowerCase()
          ) {
            encerrar();
            resolve(encontradoScan);
          }
        }
      );
    });

    atualizarEstado({
      mensagem: 'Apollo encontrada. Estabelecendo conexão...',
      nomeDispositivo:
        encontrado.name || NOME_PULSEIRA,
    });

    // 4. Conecta ao dispositivo.
    const conectado = await encontrado.connect({
      timeout: 12000,
    });

    // 5. Descobre serviços e características.
    await conectado.discoverAllServicesAndCharacteristics();

    const servicos = await conectado.services();

    const servicoExiste = servicos.some(
      (item) =>
        item.uuid.toLowerCase() ===
        UUID_SERVICO.toLowerCase()
    );

    if (!servicoExiste) {
      throw new Error(
        'Serviço Bluetooth da Apollo não encontrado.'
      );
    }

    const caracteristicas =
      await conectado.characteristicsForService(
        UUID_SERVICO
      );

    const dadosExiste = caracteristicas.some(
      (item) =>
        item.uuid.toLowerCase() ===
        UUID_DADOS.toLowerCase()
    );

    if (!dadosExiste) {
      throw new Error(
        'Característica de dados da Apollo não encontrada.'
      );
    }

    // 6. Guarda a conexão no serviço compartilhado.
    dispositivo = conectado;

    ultimaGravacao = 0;

    // Reinicia os cálculos para uma nova sessão.
    reiniciarProcessamentoApollo();

    atualizarEstado({
      status: 'connected',
      mensagem: 'Apollo conectada. Aguardando leituras...',
      nomeDispositivo:
        conectado.name || NOME_PULSEIRA,
      dados: null,
      indicadores: null,
    });

    // 7. Monitora a desconexão.
    monitorDesconexao = conectado.onDisconnected(
      (erro) => {
        limparMonitores();

        dispositivo = null;

        reiniciarProcessamentoApollo();

        atualizarEstado({
          status: 'idle',
          mensagem: erro
            ? `Conexão encerrada: ${erro.message}`
            : 'Apollo desconectada.',
          dados: null,
          indicadores: null,
        });
      }
    );

    // 8. Recebe os dados dos sensores.
    monitorDados =
      manager.monitorCharacteristicForDevice(
        conectado.id,
        UUID_SERVICO,
        UUID_DADOS,
        (erro, caracteristica) => {
          if (erro) {
            atualizarEstado({
              mensagem:
                `Erro ao receber dados: ${erro.message}`,
            });

            return;
          }

          if (!caracteristica?.value) {
            return;
          }

          let leitura;

          // Interpreta o pacote recebido.
          try {
            leitura = interpretarDados(
              caracteristica.value
            );
          } catch (erroInterpretacao) {
            console.error(
              'Erro ao interpretar dados da Apollo:',
              erroInterpretacao
            );

            return;
          }

          // 9. Processa a amostra recebida.
          const resultado = processarLeitura(leitura);

          // 10. Atualiza os dados exibidos nas telas.
          atualizarEstado({
            status: 'connected',
            mensagem: 'Apollo conectada e recebendo dados.',
            dados: leitura,
            indicadores:
              resultado?.indicadores ?? estado.indicadores,
            nomeDispositivo:
              conectado.name || NOME_PULSEIRA,
          });

          // 11. Salva a leitura no SQLite.
          salvarLeitura(leitura);
        }
      );

    return true;

  } catch (erro) {
    manager.stopDeviceScan();

    limparMonitores();

    if (encontrado) {
      try {
        await manager.cancelDeviceConnection(
          encontrado.id
        );
      } catch {
        // A conexão pode já ter sido encerrada.
      }
    }

    dispositivo = null;

    reiniciarProcessamentoApollo();

    atualizarEstado({
      status: 'error',
      mensagem:
        erro?.message ||
        'Não foi possível conectar à Apollo.',
      dados: null,
      indicadores: null,
    });

    return false;
  }
}

// ==========================================
// DESCONECTAR A PULSEIRA
// ==========================================

export async function desconectarApollo() {
  const atual = dispositivo;

  limparMonitores();

  dispositivo = null;

  reiniciarProcessamentoApollo();

  if (atual) {
    try {
      await manager.cancelDeviceConnection(
        atual.id
      );
    } catch {
      // A conexão pode já ter sido encerrada.
    }
  }

  atualizarEstado({
    status: 'idle',
    mensagem: 'Apollo desconectada.',
    dados: null,
    indicadores: null,
  });
}
