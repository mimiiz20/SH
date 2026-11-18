
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
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  obterEstadoApollo,
  assinarApollo,
  conectarApollo,
  desconectarApollo,
} from '../services/apolloBluetooth';

// ==========================================
// CORES
// ==========================================

const C = {
  branco: '#FFFFFF',
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  rosa: '#C65B69',
  rosaClaro: '#FBECEF',
  verde: '#4B8B76',
  roxo: '#7A6BB5',
};

// ==========================================
// INDICADOR DE CONEXÃO
// ==========================================

function IndicadorConexao({ status }) {
  const conectado = status === 'connected';
  const conectando = status === 'connecting';
  const erro = status === 'error';

  const cor = conectado
    ? C.verde
    : conectando
      ? '#C69B35'
      : erro
        ? C.rosa
        : C.secundario;

  const texto = conectado
    ? 'Relógio conectado'
    : conectando
      ? 'Procurando dispositivo...'
      : erro
        ? 'Falha na conexão'
        : 'Relógio desconectado';

  const icone = conectado
    ? 'checkmark-circle'
    : conectando
      ? 'time-outline'
      : erro
        ? 'alert-circle'
        : 'bluetooth-outline';

  return (
    <View style={styles.statusConexao}>
      <Ionicons name={icone} size={21} color={cor} />

      <Text style={[styles.statusTexto, { color: cor }]}>
        {texto}
      </Text>
    </View>
  );
}

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Bluetooth() {
  const insets = useSafeAreaInsets();

  const [status, setStatus] = useState('idle');
  const [mensagem, setMensagem] = useState('');
  const [nomeDispositivo, setNomeDispositivo] = useState('Apollo');

  const pulso = useRef(new Animated.Value(1)).current;
  const tentativaRef = useRef(false);

  // ==========================================
  // SINCRONIZAÇÃO COM O SERVIÇO APOLLO
  // ==========================================

  useEffect(() => {
    let telaAtiva = true;
    let cancelarAssinatura;

    const atualizarTela = novoEstado => {
      if (!telaAtiva || !novoEstado) return;

      setStatus(novoEstado.status || 'idle');
      setMensagem(novoEstado.mensagem || '');

      setNomeDispositivo(
        novoEstado.nomeDispositivo || 'Apollo'
      );

      if (novoEstado.status !== 'connecting') {
        tentativaRef.current = false;
      }
    };

    try {
      atualizarTela(obterEstadoApollo());

      cancelarAssinatura = assinarApollo(atualizarTela);
    } catch (erro) {
      console.error('Erro ao carregar estado Apollo:', erro);

      setStatus('error');
      setMensagem(
        'Não foi possível consultar o serviço Bluetooth.'
      );
    }

    return () => {
      telaAtiva = false;

      if (typeof cancelarAssinatura === 'function') {
        cancelarAssinatura();
      }

      pulso.stopAnimation();
    };
  }, [pulso]);

  // ==========================================
  // ANIMAÇÃO DA PULSEIRA
  // ==========================================

  useEffect(() => {
    if (status !== 'connecting') {
      pulso.stopAnimation();
      pulso.setValue(1);
      return;
    }

    const animacao = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(pulso, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animacao.start();

    return () => animacao.stop();
  }, [status, pulso]);

  // ==========================================
  // CONECTAR
  // ==========================================

  const conectar = async () => {
    if (
      tentativaRef.current ||
      status === 'connecting' ||
      status === 'connected'
    ) {
      return;
    }

    tentativaRef.current = true;

    setMensagem('');
    setStatus('connecting');

    try {
      await conectarApollo();
    } catch (erro) {
      console.error('Erro ao conectar Apollo:', erro);

      setStatus('error');

      setMensagem(
        erro?.message || 'Não foi possível conectar à Apollo.'
      );

      tentativaRef.current = false;
    }
  };

  // ==========================================
  // DESCONECTAR
  // ==========================================

  const desconectar = async () => {
    try {
      await desconectarApollo();

      setMensagem('');
    } catch (erro) {
      console.error('Erro ao desconectar Apollo:', erro);

      setMensagem(
        erro?.message || 'Não foi possível desconectar a pulseira.'
      );
    }
  };

  // ==========================================
  // ESTADOS
  // ==========================================

  const conectado = status === 'connected';
  const conectando = status === 'connecting';

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>

        {/* ELEMENTOS DECORATIVOS */}

        <View pointerEvents="none" style={styles.glowOne} />
        <View pointerEvents="none" style={styles.glowTwo} />

        {/* ================================== */}
        {/* NAVBAR SUPERIOR — IGUAL AO BATISONO */}
        {/* ================================== */}

        <View
          style={[
            styles.topSafeArea,
            { paddingTop: insets.top },
          ]}
        >
          <View style={styles.navbar}>

            <TouchableOpacity
              style={styles.botaoPerfil}
              onPress={() => router.push('/config')}
              activeOpacity={0.7}
              accessibilityLabel="Abrir configurações"
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={C.texto}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoPerfil}
              onPress={() => router.push('/perfil')}
              activeOpacity={0.7}
              accessibilityLabel="Abrir perfil"
            >
              <Ionicons
                name="person-outline"
                size={24}
                color={C.texto}
              />
            </TouchableOpacity>

          </View>
        </View>

        {/* ================================== */}
        {/* CONTEÚDO ROLÁVEL */}
        {/* ================================== */}

        <View style={styles.conteudoPrincipal}>
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* TÍTULO */}

            <View style={styles.tituloPagina}>
              <Text style={styles.titulo}>
                Conecte sua Apollo
              </Text>

              <Text style={styles.subtitulo}>
                Estabeleça uma conexão Bluetooth com sua pulseira
                para utilizar os recursos de monitoramento do
                Sunny Health.
              </Text>
            </View>

            {/* CARTÃO DA PULSEIRA */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>

                <View style={styles.iconeCard}>
                  <Ionicons
                    name="bluetooth-outline"
                    size={26}
                    color={C.azul}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Conexão Bluetooth
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Dispositivo Apollo
                  </Text>
                </View>

              </View>

              {/* REPRESENTAÇÃO DA PULSEIRA */}

              <View style={styles.relogioArea}>
                <Animated.View
                  style={[
                    styles.relogioCirculo,
                    conectado && styles.relogioConectado,
                    status === 'error' && styles.relogioErro,
                    {
                      transform: [
                        { scale: conectando ? pulso : 1 },
                      ],
                    },
                  ]}
                >
                  {conectando ? (
                    <ActivityIndicator
                      size="large"
                      color={C.azul}
                    />
                  ) : (
                    <Ionicons
                      name="watch-outline"
                      size={85}
                      color={conectado ? C.branco : C.texto}
                    />
                  )}
                </Animated.View>

                {conectado && (
                  <View style={styles.seloConectado}>
                    <Ionicons
                      name="checkmark"
                      size={23}
                      color={C.branco}
                    />
                  </View>
                )}
              </View>

              <Text style={styles.nomeDispositivo}>
                {nomeDispositivo}
              </Text>

              <Text style={styles.descricaoRelogio}>
                {conectado
                  ? 'Sua pulseira está conectada ao aplicativo.'
                  : conectando
                    ? 'Estamos procurando sua pulseira. Aguarde alguns instantes.'
                    : 'Mantenha sua pulseira ligada e próxima ao celular.'}
              </Text>

              <IndicadorConexao status={status} />

              {!!mensagem && (
                <View style={styles.mensagemErro}>
                  <Ionicons
                    name="information-circle-outline"
                    size={19}
                    color={C.rosa}
                  />

                  <Text style={styles.mensagemErroTexto}>
                    {mensagem}
                  </Text>
                </View>
              )}

              {!conectado ? (
                <TouchableOpacity
                  style={[
                    styles.botaoPrincipal,
                    conectando && styles.botaoDesativado,
                  ]}
                  onPress={conectar}
                  disabled={conectando}
                  activeOpacity={0.85}
                >
                  {conectando ? (
                    <ActivityIndicator color={C.branco} />
                  ) : (
                    <Ionicons
                      name="bluetooth"
                      size={22}
                      color={C.branco}
                    />
                  )}

                  <Text style={styles.botaoPrincipalTexto}>
                    {conectando
                      ? 'CONECTANDO...'
                      : status === 'error'
                        ? 'TENTAR NOVAMENTE'
                        : 'CONECTAR PULSEIRA'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.botaoDesconectar}
                  onPress={desconectar}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="bluetooth-outline"
                    size={21}
                    color={C.rosa}
                  />

                  <Text style={styles.botaoDesconectarTexto}>
                    DESCONECTAR PULSEIRA
                  </Text>
                </TouchableOpacity>
              )}

            </View>

            {/* INSTRUÇÕES */}

            {!conectado && (
              <View style={styles.card}>

                <View style={styles.cardCabecalho}>
                  <View style={styles.iconeInstrucoes}>
                    <Ionicons
                      name="information-circle-outline"
                      size={25}
                      color={C.roxo}
                    />
                  </View>

                  <View style={styles.cardTituloArea}>
                    <Text style={styles.cardTitulo}>
                      Como conectar?
                    </Text>

                    <Text style={styles.cardDescricao}>
                      Siga os passos para iniciar a conexão.
                    </Text>
                  </View>
                </View>

                {[
                  {
                    titulo: 'Ligue a pulseira Apollo',
                    descricao: 'Verifique se o dispositivo está ligado.',
                    icone: 'power-outline',
                  },
                  {
                    titulo: 'Aproxime do celular',
                    descricao: 'Mantenha os dispositivos próximos.',
                    icone: 'phone-portrait-outline',
                  },
                  {
                    titulo: 'Ative o Bluetooth',
                    descricao: 'Permita o acesso solicitado pelo aplicativo.',
                    icone: 'bluetooth-outline',
                  },
                  {
                    titulo: 'Inicie a conexão',
                    descricao: 'Toque no botão para procurar a Apollo.',
                    icone: 'link-outline',
                  },
                ].map((passo, index) => (
                  <View key={passo.titulo} style={styles.passo}>

                    <View style={styles.numeroPasso}>
                      <Text style={styles.numeroPassoTexto}>
                        {index + 1}
                      </Text>
                    </View>

                    <View style={styles.passoIcone}>
                      <Ionicons
                        name={passo.icone}
                        size={20}
                        color={C.azul}
                      />
                    </View>

                    <View style={styles.passoConteudo}>
                      <Text style={styles.passoTitulo}>
                        {passo.titulo}
                      </Text>

                      <Text style={styles.passoDescricao}>
                        {passo.descricao}
                      </Text>
                    </View>

                  </View>
                ))}

              </View>
            )}

            {/* AVISO INFERIOR */}

            <View style={styles.avisoGeral}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={C.azul}
              />

              <Text style={styles.avisoGeralTexto}>
                O Sunny Health utiliza a conexão com a Apollo
                para disponibilizar os recursos de monitoramento
                experimental.
              </Text>
            </View>

          </ScrollView>
        </View>

        {/* ================================== */}
        {/* NAVBAR INFERIOR — IGUAL AO BATISONO */}
        {/* ================================== */}

        <View
          style={[
            styles.bottomSafeArea,
            { paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.bottomBar}>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/batisono')}
              activeOpacity={0.7}
            >
              <View style={styles.navIcon}>
                <Ionicons
                  name="heart-outline"
                  size={23}
                  color={C.azul}
                />
              </View>

              <Text style={styles.navTexto}>
                Monitorar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/questionario')}
              activeOpacity={0.7}
            >
              <View style={styles.navIcon}>
                <Ionicons
                  name="clipboard-outline"
                  size={23}
                  color={C.azul}
                />
              </View>

              <Text style={styles.navTexto}>
                Questionário
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/bluetooth')}
              activeOpacity={0.7}
            >
              <View style={[styles.navIcon, styles.navIconAtivo]}>
                <Ionicons
                  name="bluetooth-outline"
                  size={23}
                  color={C.texto}
                />
              </View>

              <Text style={[styles.navTexto, styles.navTextoAtivo]}>
                Relógio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => router.push('/dicas')}
              activeOpacity={0.7}
            >
              <View style={styles.navIcon}>
                <Ionicons
                  name="book-outline"
                  size={23}
                  color={C.azul}
                />
              </View>

              <Text style={styles.navTexto}>
                Dicas
              </Text>
            </TouchableOpacity>

          </View>
        </View>

      </View>
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  // ESTRUTURA PRINCIPAL

  safeArea: {
    flex: 1,
    backgroundColor: '#30364D',
  },

  container: {
    flex: 1,
    backgroundColor: '#B8C5E8',
    overflow: 'hidden',
  },

  glowOne: {
    position: 'absolute',
    top: 120,
    right: -55,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#E5E1F5',
    opacity: 0.7,
  },

  glowTwo: {
    position: 'absolute',
    bottom: 115,
    left: -75,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#C9C3E6',
    opacity: 0.5,
  },

  // NAVBAR SUPERIOR — MESMOS ESTILOS DO BATISONO.JS

  topSafeArea: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    zIndex: 2,
    marginHorizontal: -17,
  },

  navbar: {
    minHeight: 75,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  botaoPerfil: {
    width: 55,
    height: 55,
    borderRadius: 21,
    backgroundColor: '#C9C3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },

  // CONTEÚDO

  conteudoPrincipal: {
    flex: 1,
    minHeight: 0,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 14,
  },

  tituloPagina: {
    marginBottom: 18,
    paddingHorizontal: 3,
  },

  titulo: {
    color: C.texto,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  subtitulo: {
    color: C.texto,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  // CARTÕES

  card: {
    backgroundColor: C.branco,
    borderRadius: 22,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  cardCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  iconeCard: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: C.azulClaro,
  },

  iconeInstrucoes: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F0EDFA',
  },

  cardTituloArea: {
    flex: 1,
  },

  cardTitulo: {
    color: C.texto,
    fontSize: 16,
    fontWeight: '800',
  },

  cardDescricao: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  // PULSEIRA

  relogioArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 17,
  },

  relogioCirculo: {
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: C.azulClaro,
    borderWidth: 8,
    borderColor: '#F4F5FC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  relogioConectado: {
    backgroundColor: C.verde,
    borderColor: '#EAF4EF',
  },

  relogioErro: {
    borderColor: C.rosaClaro,
  },

  seloConectado: {
    position: 'absolute',
    right: 3,
    bottom: 2,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: C.verde,
    borderWidth: 4,
    borderColor: C.branco,
    alignItems: 'center',
    justifyContent: 'center',
  },

  nomeDispositivo: {
    color: C.texto,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },

  descricaoRelogio: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 15,
  },

  // STATUS

  statusConexao: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FD',
    marginBottom: 18,
  },

  statusTexto: {
    fontSize: 12,
    fontWeight: '800',
  },

  mensagemErro: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: C.rosaClaro,
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  mensagemErroTexto: {
    flex: 1,
    color: C.rosa,
    fontSize: 12,
    lineHeight: 18,
  },

  // BOTÕES

  botaoPrincipal: {
    minHeight: 55,
    borderRadius: 15,
    backgroundColor: C.azul,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 4,
    shadowColor: C.azul,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },

  botaoDesativado: {
    opacity: 0.7,
  },

  botaoPrincipalTexto: {
    color: C.branco,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  botaoDesconectar: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: C.rosaClaro,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  botaoDesconectarTexto: {
    color: C.rosa,
    fontSize: 12,
    fontWeight: '900',
  },

  // INSTRUÇÕES

  passo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF5',
    gap: 10,
  },

  numeroPasso: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: C.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroPassoTexto: {
    color: C.branco,
    fontSize: 12,
    fontWeight: '900',
  },

  passoIcone: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },

  passoConteudo: {
    flex: 1,
  },

  passoTitulo: {
    color: C.texto,
    fontSize: 12,
    fontWeight: '800',
  },

  passoDescricao: {
    color: C.secundario,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 3,
  },

  // AVISO

  avisoGeral: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.azulClaro,
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
  },

  avisoGeralTexto: {
    flex: 1,
    color: C.texto,
    fontSize: 11,
    lineHeight: 18,
  },

  // NAVBAR INFERIOR — MESMOS ESTILOS DO BATISONO.JS

  bottomSafeArea: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 8,
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: -17,
  },

  bottomBar: {
    minHeight: 59,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 5,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },

  navIcon: {
    width: 37,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconAtivo: {
    backgroundColor: C.azulClaro,
  },

  navTexto: {
    color: C.secundario,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },

  navTextoAtivo: {
    color: C.texto,
    fontWeight: '800',
  },

});
