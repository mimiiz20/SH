
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  assinarApollo,
  conectarApollo,
  desconectarApollo,
  obterEstadoApollo,
} from '../services/apolloBluetooth';

// ============================================================
// CORES
// ============================================================

const C = {
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  roxo: '#899EEB',
  verde: '#55B878',
  amarelo: '#F0D060',
  branco: '#FFFFFF',
  vermelho: '#C65B69',
};

const GRADIENTE = [
  '#899EEB',
  '#AAB9EF',
  '#C8CFED',
  '#E3E1D2',
  '#FFF5B8',
];

const NOME_PULSEIRA = 'Apollo';

// ============================================================
// DECORAÇÕES ANIMADAS
// ============================================================

function Decoracoes({ arc1, arc2, arc3 }) {
  const moveArc1 = arc1.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 25],
  });

  const moveArc2 = arc2.interpolate({
    inputRange: [0, 1],
    outputRange: [25, -30],
  });

  const moveArc3 = arc3.interpolate({
    inputRange: [0, 1],
    outputRange: [-15, 35],
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>

      <Animated.View
        style={[
          styles.arc,
          styles.arc1,
          {
            transform: [{ translateX: moveArc1 }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.arc,
          styles.arc2,
          {
            transform: [{ translateX: moveArc2 }],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.arc,
          styles.arc3,
          {
            transform: [{ translateX: moveArc3 }],
          },
        ]}
      />

      <View style={styles.brilho1} />
      <View style={styles.brilho2} />

    </View>
  );
}

// ============================================================
// TELA PRINCIPAL
// ============================================================

export default function Relogio() {

  // ==========================================================
  // DIMENSÕES
  // ==========================================================

  const insets = useSafeAreaInsets();

  const { width, height } = useWindowDimensions();

  const pequeno = width < 360;
  const telaBaixa = height < 700;

  const tamanho = pequeno ? 130 : 150;

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const estadoInicial = obterEstadoApollo();

  const [status, setStatus] = useState(
    estadoInicial.status
  );

  const [mensagem, setMensagem] = useState(
    estadoInicial.mensagem
  );

  const [nomeDispositivo, setNomeDispositivo] = useState(
    estadoInicial.nomeDispositivo || NOME_PULSEIRA
  );

  // ==========================================================
  // ANIMAÇÕES
  // ==========================================================

  const pulse = useRef(new Animated.Value(1)).current;

  const arc1 = useRef(new Animated.Value(0)).current;

  const arc2 = useRef(new Animated.Value(0)).current;

  const arc3 = useRef(new Animated.Value(0)).current;

  // ==========================================================
  // ASSINATURA DO SERVIÇO BLUETOOTH
  // ==========================================================

  useEffect(() => {

    const cancelarAssinatura = assinarApollo((novoEstado) => {

      setStatus(novoEstado.status);

      setMensagem(novoEstado.mensagem);

      setNomeDispositivo(
        novoEstado.nomeDispositivo || NOME_PULSEIRA
      );

    });

    // Ao sair da tela, removemos somente a assinatura.
    // A conexão Bluetooth continua no serviço compartilhado.

    return () => {
      cancelarAssinatura();
    };

  }, []);

  // ==========================================================
  // ANIMAÇÃO DAS ONDAS
  // ==========================================================

  useEffect(() => {

    const animateArc = (
      animation,
      delay,
      duration = 6500
    ) => {
      return Animated.loop(
        Animated.sequence([

          Animated.delay(delay),

          Animated.timing(animation, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(animation, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

        ])
      );
    };

    const animation1 = animateArc(arc1, 0);
    const animation2 = animateArc(arc2, 1200);
    const animation3 = animateArc(arc3, 2400);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };

  }, [arc1, arc2, arc3]);

  // ==========================================================
  // ANIMAÇÃO DA PULSEIRA
  // ==========================================================

  useEffect(() => {

    if (status !== 'connecting') {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const animacao = Animated.loop(
      Animated.sequence([

        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

      ])
    );

    animacao.start();

    return () => {
      animacao.stop();
    };

  }, [status, pulse]);

  // ==========================================================
  // CONECTAR PULSEIRA
  // ==========================================================

  const conectar = async () => {
    await conectarApollo();
  };

  // ==========================================================
  // DESCONECTAR PULSEIRA
  // ==========================================================

  const desconectar = async () => {
    await desconectarApollo();
  };

  // ==========================================================
  // NAVEGAÇÃO
  // ==========================================================

  const irParaMonitoramento = () => {
    router.replace('/batisono');
  };

  // ==========================================================
  // TELA
  // ==========================================================

  return (

    <View style={styles.container}>

      {/* FUNDO */}

      <LinearGradient
        colors={GRADIENTE}
        locations={[0, 0.25, 0.52, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ONDAS */}

      <Decoracoes
        arc1={arc1}
        arc2={arc2}
        arc3={arc3}
      />

      {/* CONTEÚDO ROLÁVEL */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 20, 35),
            paddingBottom: Math.max(insets.bottom + 30, 40),
            paddingHorizontal: pequeno ? 18 : 25,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.conteudo}>

          {/* TÍTULO */}

          <Text
            style={[
              styles.titulo,
              pequeno && styles.tituloPequeno,
            ]}
          >
            VAMOS CONECTAR
          </Text>

          <Text
            style={[
              styles.titulo,
              pequeno && styles.tituloPequeno,
            ]}
          >
            SUA PULSEIRA
          </Text>

          {/* PULSEIRA */}

          <Animated.View
            style={[
              styles.relogioContainer,
              {
                marginTop: telaBaixa ? 18 : 25,
                marginBottom: telaBaixa ? 16 : 20,
                transform: [{ scale: pulse }],
              },
            ]}
          >

            <View
              style={[
                styles.relogio,
                {
                  width: tamanho,
                  height: tamanho,
                  borderRadius: tamanho / 2,
                },
                status === 'connected' &&
                  styles.relogioConectado,
                status === 'error' &&
                  styles.relogioErro,
              ]}
            >

              {status === 'connecting' ? (

                <ActivityIndicator
                  size="large"
                  color={C.texto}
                />

              ) : (

                <Ionicons
                  name="watch-outline"
                  size={pequeno ? 76 : 90}
                  color={
                    status === 'connected'
                      ? C.branco
                      : C.texto
                  }
                />

              )}

            </View>

            {status === 'connected' && (

              <View style={styles.confirmacao}>
                <Ionicons
                  name="checkmark"
                  size={28}
                  color={C.branco}
                />
              </View>

            )}

          </Animated.View>

          {/* INSTRUÇÃO */}

          <Text
            style={[
              styles.instrucao,
              pequeno && styles.instrucaoPequena,
            ]}
          >

            {status === 'idle' &&
              'Agora vamos conectar sua pulseira ao Sunny Health.'}

            {status === 'connecting' &&
              'Procurando e conectando à pulseira...'}

            {status === 'connected' &&
              `${nomeDispositivo} está conectada.`}

            {status === 'error' &&
              'Não foi possível conectar sua pulseira.'}

          </Text>

          {/* PASSOS */}

          {status !== 'connected' && (

            <View style={styles.passos}>

              {[
                'Ligue a pulseira e mantenha-a perto do celular.',
                'Ative o Bluetooth do celular.',
                'Toque em "Conectar pulseira" e aguarde.',
              ].map((texto, index) => (

                <View key={texto} style={styles.passo}>

                  <View style={styles.numero}>
                    <Text style={styles.numeroTexto}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.passoTexto}>
                    {texto}
                  </Text>

                </View>

              ))}

            </View>

          )}

          {/* STATUS */}

          <View style={styles.statusContainer}>

            <View
              style={[
                styles.ponto,
                status === 'connecting' &&
                  styles.pontoConectando,
                status === 'connected' &&
                  styles.pontoConectado,
                status === 'error' &&
                  styles.pontoErro,
              ]}
            />

            <Text style={styles.statusTexto}>

              {status === 'idle' &&
                'Bluetooth ainda não configurado'}

              {status === 'connecting' &&
                'Procurando / conectando...'}

              {status === 'connected' &&
                'Bluetooth conectado'}

              {status === 'error' &&
                'Falha na conexão'}

            </Text>

          </View>

          {/* MENSAGEM */}

          {!!mensagem && status !== 'connected' && (
            <Text style={styles.mensagem}>
              {mensagem}
            </Text>
          )}

          {/* BOTÃO CONECTAR */}

          {status !== 'connected' ? (

            <TouchableOpacity
              style={[
                styles.botaoConectar,
                status === 'connecting' &&
                  styles.botaoConectando,
              ]}
              onPress={conectar}
              disabled={status === 'connecting'}
              activeOpacity={0.85}
            >

              <Ionicons
                name="bluetooth-outline"
                size={27}
                color={C.branco}
              />

              <Text
                style={[
                  styles.botaoTexto,
                  pequeno && styles.botaoTextoPequeno,
                ]}
              >

                {status === 'connecting'
                  ? 'CONECTANDO...'
                  : status === 'error'
                    ? 'TENTAR NOVAMENTE'
                    : 'CONECTAR PULSEIRA'}

              </Text>

            </TouchableOpacity>

          ) : (

            <>

              {/* CONFIRMAÇÃO DA CONEXÃO */}

              <View style={styles.conexaoSucesso}>

                <View style={styles.sucessoIcone}>
                  <Ionicons
                    name="checkmark-circle"
                    size={48}
                    color={C.verde}
                  />
                </View>

                <Text style={styles.sucessoTitulo}>
                  Conexão concluída!
                </Text>

                <Text style={styles.sucessoDescricao}>
                  Sua pulseira Apollo está conectada ao Sunny Health.
                  Os dados dos sensores serão recebidos e armazenados
                  automaticamente para acompanhamento.
                </Text>

                <View style={styles.sucessoStatus}>

                  <View
                    style={[
                      styles.ponto,
                      styles.pontoConectado,
                    ]}
                  />

                  <Text style={styles.sucessoStatusTexto}>
                    {nomeDispositivo} conectado
                  </Text>

                </View>

              </View>

              {/* IR PARA MONITORAMENTO */}

              <TouchableOpacity
                style={styles.botaoMonitorar}
                onPress={irParaMonitoramento}
                activeOpacity={0.85}
              >

                <Ionicons
                  name="pulse-outline"
                  size={23}
                  color={C.branco}
                />

                <Text style={styles.botaoTexto}>
                  IR PARA MONITORAMENTO
                </Text>

              </TouchableOpacity>

              {/* DESCONECTAR */}

              <TouchableOpacity
                style={styles.botaoDesconectar}
                onPress={desconectar}
                activeOpacity={0.85}
              >

                <Ionicons
                  name="bluetooth-outline"
                  size={20}
                  color={C.vermelho}
                />

                <Text style={styles.textoDesconectar}>
                  Desconectar pulseira
                </Text>

              </TouchableOpacity>

            </>

          )}

        </View>

      </ScrollView>

    </View>

  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  conteudo: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
  },

  // ONDAS

  arc: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 300,
  },

  arc1: {
    width: 480,
    height: 480,
    top: -210,
    right: -180,
  },

  arc2: {
    width: 390,
    height: 390,
    top: 180,
    left: -230,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  arc3: {
    width: 600,
    height: 600,
    bottom: -350,
    right: -280,
    borderColor: 'rgba(255,255,255,0.17)',
  },

  brilho1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 70,
    right: -80,
  },

  brilho2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,245,184,0.12)',
    bottom: 180,
    left: -70,
  },

  // TÍTULO

  titulo: {
    fontSize: 34,
    fontWeight: '800',
    color: C.branco,
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 42,
  },

  tituloPequeno: {
    fontSize: 29,
    lineHeight: 36,
  },

  // PULSEIRA

  relogioContainer: {
    position: 'relative',
  },

  relogio: {
    backgroundColor: 'rgba(255,255,255,0.82)',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: C.texto,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },

  relogioConectado: {
    backgroundColor: C.verde,
  },

  relogioErro: {
    backgroundColor: '#FBECEF',
  },

  confirmacao: {
    position: 'absolute',
    right: -5,
    bottom: 0,

    width: 48,
    height: 48,
    borderRadius: 24,

    backgroundColor: C.verde,

    justifyContent: 'center',
    alignItems: 'center',

    borderWidth: 4,
    borderColor: C.branco,
  },

  // INSTRUÇÃO

  instrucao: {
    width: '100%',
    maxWidth: 400,
    fontSize: 19,
    lineHeight: 27,
    color: C.texto,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 20,
  },

  instrucaoPequena: {
    fontSize: 17,
    lineHeight: 24,
  },

  // PASSOS

  passos: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.70)',
    borderRadius: 18,
    padding: 17,
    marginBottom: 17,
  },

  passo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  numero: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 17,
    backgroundColor: C.roxo,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  numeroTexto: {
    color: C.branco,
    fontSize: 17,
    fontWeight: '800',
  },

  passoTexto: {
    flex: 1,
    color: C.texto,
    fontSize: 16,
    lineHeight: 21,
  },

  // STATUS

  statusContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  ponto: {
    width: 13,
    height: 13,
    flexShrink: 0,
    borderRadius: 7,
    backgroundColor: C.amarelo,
    marginRight: 9,
  },

  pontoConectando: {
    backgroundColor: C.roxo,
  },

  pontoConectado: {
    backgroundColor: C.verde,
  },

  pontoErro: {
    backgroundColor: C.vermelho,
  },

  statusTexto: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: C.texto,
    textAlign: 'center',
  },

  mensagem: {
    width: '100%',
    color: C.texto,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 15,
  },

  // BOTÃO CONECTAR

  botaoConectar: {
    width: '100%',
    minHeight: 67,
    borderRadius: 18,
    backgroundColor: C.azul,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 18,
    gap: 10,

    shadowColor: C.texto,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  botaoConectando: {
    backgroundColor: C.roxo,
  },

  botaoTexto: {
    flexShrink: 1,
    color: C.branco,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    textAlign: 'center',
  },

  botaoTextoPequeno: {
    fontSize: 14,
  },

  // CONFIRMAÇÃO DA CONEXÃO

  conexaoSucesso: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 18,
  },

  sucessoIcone: {
    marginBottom: 10,
  },

  sucessoTitulo: {
    color: C.texto,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },

  sucessoDescricao: {
    color: C.secundario,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
  },

  sucessoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sucessoStatusTexto: {
    color: C.verde,
    fontSize: 15,
    fontWeight: '700',
  },

  // MONITORAMENTO

  botaoMonitorar: {
    width: '100%',
    minHeight: 60,
    borderRadius: 18,
    backgroundColor: C.azul,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    paddingHorizontal: 15,
    gap: 9,
    marginBottom: 12,
  },

  // DESCONECTAR

  botaoDesconectar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },

  textoDesconectar: {
    color: C.vermelho,
    fontWeight: '700',
    fontSize: 14,
  },

});
