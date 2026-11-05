import React, { useCallback, useEffect, useRef, useState } from 'react';
import {Alert,PermissionsAndroid,Platform,ScrollView,StyleSheet,Text,TouchableOpacity,View,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import {
  salvarMedicaoApollo,
  buscarUltimaMedicaoApollo,
} from '../../database/database';

const SERVICE_UUID = '12345678-1234-1234-1234-1234567890ab';
const DATA_UUID = '12345678-1234-1234-1234-1234567890ac';
const TAMANHO_PACOTE_ATUAL = 14;
const TAMANHO_PACOTE_COM_BATIMENTO = 16;
const manager = new BleManager();

const C = {
  fundo: '#F7F8FC',
  azul: '#5574B8',
  texto: '#30364D',
  branco: '#FFFFFF',
  verde: '#55B878',
  vermelho: '#D9534F',
  cinza: '#65708F',
};

function interpretarPacoteApollo(base64) {
  const bytes = Buffer.from(base64, 'base64');

  if (
    bytes.length !== TAMANHO_PACOTE_ATUAL &&
    bytes.length !== TAMANHO_PACOTE_COM_BATIMENTO
  ) {
    throw new Error(
      `Pacote inválido: recebidos ${bytes.length} bytes.`
    );
  }

  const lerInt16 = (posicao) =>
    bytes.readInt16LE(posicao * 2);

  const possuiBatimento =
    bytes.length === TAMANHO_PACOTE_COM_BATIMENTO;

  const bpmBruto = possuiBatimento
    ? bytes.readUInt16LE(14)
    : null;

  const frequenciaCardiaca =
    bpmBruto !== null && bpmBruto > 0
      ? bpmBruto
      : null;

  return {
    aceleracao_x: lerInt16(0) / 1000,
    aceleracao_y: lerInt16(1) / 1000,
    aceleracao_z: lerInt16(2) / 1000,
    giroscopio_x: lerInt16(3) / 10,
    giroscopio_y: lerInt16(4) / 10,
    giroscopio_z: lerInt16(5) / 10,
    intensidade_sonora: lerInt16(6) / 10000,
    frequencia_cardiaca: frequenciaCardiaca,
    recebido_em: new Date().toISOString(),
  };
}

async function solicitarPermissoes() {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Number(Platform.Version) >= 31) {
    const resultado = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return (
      resultado[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      resultado[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  const resultado = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
  );

  return resultado === PermissionsAndroid.RESULTS.GRANTED;
}

export default function Bluetooth() {
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivo, setDispositivo] = useState(null);
  const [procurando, setProcurando] = useState(false);
  const [conectando, setConectando] = useState(false);
  const [mensagem, setMensagem] = useState('Desconectado');
  const [medicao, setMedicao] = useState(null);

  const dispositivoAtualRef = useRef(null);
  const assinaturaDadosRef = useRef(null);
  const assinaturaEstadoRef = useRef(null);
  const timeoutBuscaRef = useRef(null);
  const ativoRef = useRef(true);
  const ultimaAtualizacaoRef = useRef(0);
  const ultimaGravacaoRef = useRef(0);
  const gravandoRef = useRef(false);
  const dadosPendentesRef = useRef(null);

  useEffect(() => {
    ativoRef.current = true;

    buscarUltimaMedicaoApollo()
      .then((dados) => {
        if (ativoRef.current && dados) {
          setMedicao(dados);
        }
      })
      .catch((erro) => {
        console.error('Erro ao carregar medição Apollo:', erro);
      });

    assinaturaEstadoRef.current = manager.onStateChange(
      (estado) => {
        if (!ativoRef.current) return;

        if (estado !== 'PoweredOn') {
          setMensagem('Ative o Bluetooth do celular.');
        } else if (!dispositivoAtualRef.current) {
          setMensagem('Bluetooth ativado. Pronto para conectar.');
        }
      },
      true
    );

    return () => {
      ativoRef.current = false;
      manager.stopDeviceScan();

      if (timeoutBuscaRef.current) {
        clearTimeout(timeoutBuscaRef.current);
      }

      assinaturaEstadoRef.current?.remove();
      assinaturaDadosRef.current?.remove();

      const dispositivoAtual = dispositivoAtualRef.current;
      dispositivoAtualRef.current = null;

      dispositivoAtual?.cancelConnection().catch(() => {});
    };
  }, []);

  const gravarMedicao = useCallback(async (dados) => {
    dadosPendentesRef.current = dados;

    if (gravandoRef.current) return;

    gravandoRef.current = true;

    try {
      while (dadosPendentesRef.current) {
        const dadosParaSalvar = dadosPendentesRef.current;
        dadosPendentesRef.current = null;

        await salvarMedicaoApollo(dadosParaSalvar);

        ultimaGravacaoRef.current = Date.now();
      }
    } catch (erro) {
      console.error('Erro ao salvar medição Apollo:', erro);
    } finally {
      gravandoRef.current = false;
    }
  }, []);

  const receberDados = useCallback(
    (erro, caracteristica) => {
      if (!ativoRef.current) return;

      if (erro) {
        console.error('Erro ao receber dados Apollo:', erro);
        setMensagem('Erro ao receber medições.');
        return;
      }

      if (!caracteristica?.value) return;

      try {
        const dados = interpretarPacoteApollo(
          caracteristica.value
        );

        const agora = Date.now();

        if (agora - ultimaAtualizacaoRef.current >= 250) {
          setMedicao(dados);
          ultimaAtualizacaoRef.current = agora;
        }

        if (agora - ultimaGravacaoRef.current >= 5000) {
          gravarMedicao(dados);
        }

        setMensagem('Conectado. Recebendo medições...');
      } catch (erroPacote) {
        console.error('Pacote Apollo inválido:', erroPacote);
        setMensagem('Não foi possível interpretar os dados.');
      }
    },
    [gravarMedicao]
  );

  const conectar = useCallback(
    async (item) => {
      let conectado = null;

      try {
        manager.stopDeviceScan();

        if (timeoutBuscaRef.current) {
          clearTimeout(timeoutBuscaRef.current);
        }

        setProcurando(false);
        setConectando(true);
        setMensagem('Conectando ao Apollo...');

        const estado = await manager.state();

        if (estado !== 'PoweredOn') {
          throw new Error('Ative o Bluetooth do celular.');
        }

        conectado = await item.device.connect();

        await conectado.discoverAllServicesAndCharacteristics();

        const servicos = await conectado.services();

        const servicoExiste = servicos.some(
          (servico) =>
            servico.uuid.toLowerCase() === SERVICE_UUID
        );

        if (!servicoExiste) {
          throw new Error(
            'Serviço Apollo não encontrado. Confira os UUIDs do Arduino.'
          );
        }

        if (!ativoRef.current) {
          await conectado.cancelConnection();
          return;
        }

        assinaturaDadosRef.current?.remove();

        dispositivoAtualRef.current = conectado;

        setDispositivo({
          id: conectado.id,
          name: item.name || 'Apollo',
        });

        setMensagem('Conectado. Recebendo medições...');

        ultimaGravacaoRef.current = 0;
        ultimaAtualizacaoRef.current = 0;

        assinaturaDadosRef.current =
          conectado.monitorCharacteristicForService(
            SERVICE_UUID,
            DATA_UUID,
            receberDados
          );
      } catch (erro) {
        console.error('Falha na conexão Apollo:', erro);

        setDispositivo(null);
        setMensagem(erro.message || 'Falha na conexão.');

        Alert.alert(
          'Erro de conexão',
          erro.message || 'Não foi possível conectar ao Apollo.'
        );

        try {
          await conectado?.cancelConnection();
        } catch {}

        dispositivoAtualRef.current = null;
      } finally {
        if (ativoRef.current) {
          setConectando(false);
        }
      }
    },
    [receberDados]
  );

  const procurar = async () => {
    try {
      const permitido = await solicitarPermissoes();

      if (!permitido) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso ao Bluetooth para procurar a pulseira.'
        );
        return;
      }

      const estado = await manager.state();

      if (estado !== 'PoweredOn') {
        Alert.alert(
          'Bluetooth desligado',
          'Ative o Bluetooth do celular para continuar.'
        );
        return;
      }

      manager.stopDeviceScan();

      if (timeoutBuscaRef.current) {
        clearTimeout(timeoutBuscaRef.current);
      }

      setDispositivos([]);
      setProcurando(true);
      setMensagem('Procurando Apollo...');

      manager.startDeviceScan(
        [SERVICE_UUID],
        { allowDuplicates: false },
        (erro, encontrado) => {
          if (!ativoRef.current) return;

          if (erro) {
            manager.stopDeviceScan();
            setProcurando(false);
            setMensagem('Erro durante a busca.');
            console.error('Erro na busca BLE:', erro);
            return;
          }

          if (!encontrado) return;

          const nome =
            encontrado.name ||
            encontrado.localName ||
            '';

          const possuiServico =
            encontrado.serviceUUIDs?.some(
              (uuid) =>
                uuid.toLowerCase() === SERVICE_UUID
            );

          if (
            nome.toLowerCase().includes('apollo') ||
            possuiServico
          ) {
            setDispositivos((anteriores) => {
              const jaExiste = anteriores.some(
                (item) => item.id === encontrado.id
              );

              if (jaExiste) return anteriores;

              return [
                ...anteriores,
                {
                  id: encontrado.id,
                  name: nome || 'Apollo',
                  device: encontrado,
                },
              ];
            });
          }
        }
      );

      timeoutBuscaRef.current = setTimeout(() => {
        manager.stopDeviceScan();

        if (ativoRef.current) {
          setProcurando(false);
          setMensagem('Busca finalizada.');
        }
      }, 12000);
    } catch (erro) {
      console.error('Erro ao procurar Apollo:', erro);

      setProcurando(false);

      Alert.alert(
        'Erro',
        'Não foi possível procurar dispositivos Bluetooth.'
      );
    }
  };

  const desconectar = async () => {
    try {
      manager.stopDeviceScan();

      if (timeoutBuscaRef.current) {
        clearTimeout(timeoutBuscaRef.current);
      }

      assinaturaDadosRef.current?.remove();
      assinaturaDadosRef.current = null;

      const id = dispositivoAtualRef.current?.id;

      if (id) {
        await manager.cancelDeviceConnection(id);
      }

      dispositivoAtualRef.current = null;

      setDispositivo(null);
      setMensagem('Desconectado.');
    } catch (erro) {
      console.error('Erro ao desconectar Apollo:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível desconectar a pulseira.'
      );
    }
  };

  const Cartao = ({ titulo, valor, unidade = '' }) => (
    <View style={styles.cartaoMedicao}>
      <Text style={styles.rotulo}>{titulo}</Text>
      <Text style={styles.valor}>
        {valor === null || valor === undefined
          ? '--'
          : `${valor}${unidade}`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <View style={styles.cabecalho}>
          <Ionicons
            name="bluetooth"
            size={42}
            color={C.branco}
          />

          <Text style={styles.titulo}>
            CONEXÃO BLUETOOTH
          </Text>

          <Text style={styles.subtitulo}>
            Monitoramento da pulseira Apollo
          </Text>
        </View>

        <View style={styles.status}>
          <View
            style={[
              styles.ponto,
              dispositivo
                ? styles.pontoVerde
                : styles.pontoCinza,
            ]}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitulo}>
              {dispositivo?.name ||
                'Nenhum dispositivo conectado'}
            </Text>

            <Text style={styles.statusTexto}>
              {mensagem}
            </Text>
          </View>
        </View>

        {!dispositivo ? (
          <TouchableOpacity
            style={[
              styles.botao,
              (procurando || conectando) &&
                styles.botaoDesabilitado,
            ]}
            onPress={procurar}
            disabled={procurando || conectando}
          >
            <Text style={styles.botaoTexto}>
              {procurando
                ? 'PROCURANDO...'
                : conectando
                  ? 'CONECTANDO...'
                  : 'PROCURAR APOLLO'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.botao,
              styles.botaoDesconectar,
            ]}
            onPress={desconectar}
          >
            <Text style={styles.botaoTexto}>
              DESCONECTAR
            </Text>
          </TouchableOpacity>
        )}

        {dispositivos.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemDispositivo}
            onPress={() => conectar(item)}
            disabled={conectando || Boolean(dispositivo)}
          >
            <Ionicons
              name="watch-outline"
              size={25}
              color={C.azul}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.nomeDispositivo}>
                {item.name}
              </Text>

              <Text style={styles.idDispositivo}>
                {item.id}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color={C.azul}
            />
          </TouchableOpacity>
        ))}

        <Text style={styles.secao}>
          BATIMENTOS CARDÍACOS
        </Text>

        <View style={styles.cartaoCardiaco}>
          <View style={styles.cardiacoCabecalho}>
            <View style={styles.iconeCardiaco}>
              <Ionicons
                name="heart"
                size={25}
                color={C.vermelho}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardiacoTitulo}>
                Frequência cardíaca
              </Text>

              <Text style={styles.cardiacoDescricao}>
                Dados recebidos do sensor cardíaco
              </Text>
            </View>
          </View>

          <View style={styles.cardiacoValorArea}>
            <Text style={styles.cardiacoValor}>
              {medicao?.frequencia_cardiaca ?? '--'}
            </Text>

            <Text style={styles.cardiacoUnidade}>
              BPM
            </Text>
          </View>

          <Text style={styles.cardiacoRodape}>
            A leitura ficará disponível quando o sensor
            cardíaco estiver integrado e enviando dados.
          </Text>
        </View>

        <Text style={styles.secao}>
          DADOS DOS SENSORES
        </Text>

        <View style={styles.grade}>
          <Cartao
            titulo="Aceleração X"
            valor={medicao?.aceleracao_x}
          />

          <Cartao
            titulo="Aceleração Y"
            valor={medicao?.aceleracao_y}
          />

          <Cartao
            titulo="Aceleração Z"
            valor={medicao?.aceleracao_z}
          />

          <Cartao
            titulo="Giroscópio X"
            valor={medicao?.giroscopio_x}
          />

          <Cartao
            titulo="Giroscópio Y"
            valor={medicao?.giroscopio_y}
          />

          <Cartao
            titulo="Giroscópio Z"
            valor={medicao?.giroscopio_z}
          />

          <Cartao
            titulo="Intensidade sonora"
            valor={medicao?.intensidade_sonora}
          />
        </View>

        <Text style={styles.rodape}>
          Os dados são provenientes dos sensores da pulseira.
          A intensidade sonora representa o nível do sinal
          captado, não uma gravação de voz. Os valores de
          frequência cardíaca dependem da integração do sensor
          correspondente.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.fundo,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },
  cabecalho: {
    alignItems: 'center',
    backgroundColor: C.azul,
    borderRadius: 22,
    padding: 24,
    marginBottom: 18,
  },
  titulo: {
    color: C.branco,
    fontSize: 19,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitulo: {
    color: C.branco,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.branco,
    borderRadius: 15,
    padding: 15,
    marginBottom: 14,
    gap: 12,
  },
  ponto: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pontoVerde: {
    backgroundColor: C.verde,
  },
  pontoCinza: {
    backgroundColor: C.cinza,
  },
  statusTitulo: {
    color: C.texto,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusTexto: {
    color: C.cinza,
    marginTop: 4,
    fontSize: 12,
  },
  botao: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: C.azul,
    padding: 16,
    borderRadius: 14,
    marginBottom: 18,
  },
  botaoDesabilitado: {
    opacity: 0.65,
  },
  botaoDesconectar: {
    backgroundColor: C.vermelho,
  },
  botaoTexto: {
    color: C.branco,
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemDispositivo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.branco,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },
  nomeDispositivo: {
    color: C.texto,
    fontWeight: 'bold',
  },
  idDispositivo: {
    color: C.cinza,
    fontSize: 10,
    marginTop: 4,
  },
  secao: {
    color: C.texto,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 12,
  },
  cartaoCardiaco: {
    backgroundColor: C.branco,
    borderRadius: 18,
    padding: 18,
    marginBottom: 10,
  },
  cardiacoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconeCardiaco: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: '#FBECEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardiacoTitulo: {
    color: C.texto,
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardiacoDescricao: {
    color: C.cinza,
    fontSize: 11,
    marginTop: 4,
  },
  cardiacoValorArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 18,
  },
  cardiacoValor: {
    color: C.texto,
    fontSize: 38,
    fontWeight: 'bold',
  },
  cardiacoUnidade: {
    color: C.cinza,
    fontSize: 14,
    fontWeight: 'bold',
  },
  cardiacoRodape: {
    color: C.cinza,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cartaoMedicao: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: C.branco,
    borderRadius: 15,
    padding: 14,
    minHeight: 85,
  },
  rotulo: {
    color: C.cinza,
    fontSize: 12,
  },
  valor: {
    color: C.texto,
    fontWeight: 'bold',
    fontSize: 19,
    marginTop: 8,
  },
  rodape: {
    color: C.cinza,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
  },
});
