import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getDatabase } from '../database/database';

// ============================================================
// COMPONENTE DE INFORMAÇÃO DO PERFIL
// ============================================================

function OpcaoPerfil({
  icone,
  titulo,
  subtitulo,
  corIcone = '#899EEB',
  ultimo = false,
}) {
  return (
    <View style={[styles.opcao, ultimo && styles.opcaoUltima]}>
      <View
        style={[
          styles.opcaoIcone,
          { backgroundColor: `${corIcone}22` },
        ]}
      >
        <Ionicons name={icone} size={22} color={corIcone} />
      </View>

      <View style={styles.opcaoTextoContainer}>
        <Text style={styles.opcaoTitulo}>{titulo}</Text>

        <Text style={styles.opcaoSubtitulo}>
          {subtitulo || 'Não informado'}
        </Text>
      </View>
    </View>
  );
}

// ============================================================
// FUNÇÃO PARA ENCONTRAR OS DADOS DO USUÁRIO
// ============================================================

function obterDado(usuario, nomes) {
  if (!usuario) return null;

  for (const nome of nomes) {
    const chave = Object.keys(usuario).find(
      (item) => item.toLowerCase() === nome.toLowerCase()
    );

    const valor = chave ? usuario[chave] : null;

    if (
      valor !== null &&
      valor !== undefined &&
      String(valor).trim() !== ''
    ) {
      return String(valor);
    }
  }

  return null;
}

// ============================================================
// TELA DE PERFIL PESSOAL
// ============================================================

export default function Perfil() {
  const insets = useSafeAreaInsets();

  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // ----------------------------------------------------------
  // BUSCAR OS DADOS DO USUÁRIO LOGADO
  // ----------------------------------------------------------

  const buscarUsuario = async () => {
    try {
      setCarregando(true);

      const db = await getDatabase();

      const sessao = await db.getFirstAsync(`
        SELECT usuario_id
        FROM sessao
        WHERE id = 1
        LIMIT 1
      `);

      if (!sessao?.usuario_id) {
        setUsuario(null);
        return;
      }

      const resultado = await db.getFirstAsync(
        `
        SELECT *
        FROM usuarios
        WHERE id = ?
        `,
        [sessao.usuario_id]
      );

      setUsuario(resultado || null);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Atualiza os dados quando a tela é aberta novamente.

  useFocusEffect(
    useCallback(() => {
      buscarUsuario();
    }, [])
  );

  // ----------------------------------------------------------
  // SAIR DA CONTA
  // Não consulta nem modifica o banco de dados nesta função.
  // ----------------------------------------------------------

  const sairDaConta = () => {
    Alert.alert(
      'Sair da conta',
      'Deseja realmente sair e voltar para o cadastro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            setUsuario(null);
            router.replace('/cadastro');
          },
        },
      ]
    );
  };

  // ----------------------------------------------------------
  // DADOS PESSOAIS E DE SAÚDE
  // ----------------------------------------------------------

  const nome = obterDado(usuario, ['nome', 'name']);
  const email = obterDado(usuario, ['email', 'e_mail']);

  const idade = obterDado(usuario, ['idade', 'age']);

  const genero = obterDado(usuario, [
    'genero',
    'gênero',
    'sexo',
  ]);

  const altura = obterDado(usuario, ['altura', 'height']);

  const peso = obterDado(usuario, ['peso', 'weight']);

  const medicacao = obterDado(usuario, [
    'medicacao',
    'medicação',
    'medicamentos',
    'medicamento',
    'medication',
  ]);

  const medico = obterDado(usuario, [
    'medico_responsavel',
    'médico_responsável',
    'medico',
    'medico_responsavel_nome',
    'doctor',
  ]);

  // ----------------------------------------------------------
  // INTERFACE
  // ----------------------------------------------------------

  return (
    <LinearGradient
      colors={[
        '#899EEB',
        '#AAB9EF',
        '#C8CFED',
        '#E3E1D2',
        '#FFF5B8',
      ]}
      locations={[0, 0.25, 0.5, 0.75, 1]}
      style={styles.container}
    >
      {/* ELEMENTOS DECORATIVOS */}

      <View style={styles.arcOne} />
      <View style={styles.arcTwo} />
      <View style={styles.arcThree} />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View
          style={[
            styles.containerBranco,
            { marginTop: Math.max(insets.top * 0.15, 4) },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 30) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* BOTÃO VOLTAR */}

            <TouchableOpacity
              style={styles.botaoVoltar}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color="#30364D"
              />
            </TouchableOpacity>

            {/* TÍTULO */}

            <View style={styles.tituloArea}>
              <Text style={styles.titulo}>Minha conta</Text>

              <Text style={styles.subtitulo}>
                Consulte seus dados pessoais e informações de saúde.
              </Text>
            </View>

            {/* CARTÃO PRINCIPAL */}

            <View style={styles.usuarioCard}>
              <View style={styles.avatar}>
                <Ionicons
                  name="person"
                  size={42}
                  color="#126D83"
                />
              </View>

              <View style={styles.usuarioInfo}>
                <Text style={styles.usuarioNome}>
                  {carregando
                    ? 'Carregando...'
                    : nome || 'Usuário'}
                </Text>

                <Text style={styles.usuarioEmail}>
                  {email || 'E-mail não informado'}
                </Text>

                <View style={styles.statusContainer}>
                  <View style={styles.statusBolinha} />

                  <Text style={styles.statusTexto}>
                    Perfil pessoal
                  </Text>
                </View>
              </View>
            </View>

            {/* DADOS PESSOAIS */}

            <Text style={styles.secaoTitulo}>
              DADOS PESSOAIS
            </Text>

            <View style={styles.card}>
              <OpcaoPerfil
                icone="person-outline"
                titulo="Nome completo"
                subtitulo={nome}
                corIcone="#899EEB"
              />

              <OpcaoPerfil
                icone="mail-outline"
                titulo="E-mail"
                subtitulo={email}
                corIcone="#6A7395"
              />

              <OpcaoPerfil
                icone="calendar-outline"
                titulo="Idade"
                subtitulo={idade ? `${idade} anos` : null}
                corIcone="#F0D060"
              />

              <OpcaoPerfil
                icone="people-outline"
                titulo="Gênero"
                subtitulo={genero}
                corIcone="#899EEB"
                ultimo
              />
            </View>

            {/* INFORMAÇÕES FÍSICAS */}

            <Text style={styles.secaoTitulo}>
              INFORMAÇÕES FÍSICAS
            </Text>

            <View style={styles.card}>
              <OpcaoPerfil
                icone="resize-outline"
                titulo="Altura"
                subtitulo={
                  altura
                    ? `${altura}${
                        String(altura).includes('cm') ||
                        String(altura).includes('m')
                          ? ''
                          : ' cm'
                      }`
                    : null
                }
                corIcone="#126D83"
              />

              <OpcaoPerfil
                icone="scale-outline"
                titulo="Peso"
                subtitulo={
                  peso
                    ? `${peso}${
                        String(peso).toLowerCase().includes('kg')
                          ? ''
                          : ' kg'
                      }`
                    : null
                }
                corIcone="#55B878"
                ultimo
              />
            </View>

            {/* INFORMAÇÕES DE SAÚDE */}

            <Text style={styles.secaoTitulo}>
              INFORMAÇÕES DE SAÚDE
            </Text>

            <View style={styles.card}>
              <OpcaoPerfil
                icone="medkit-outline"
                titulo="Medicação"
                subtitulo={medicacao}
                corIcone="#55B878"
              />

              <OpcaoPerfil
                icone="person-circle-outline"
                titulo="Médico responsável"
                subtitulo={medico}
                corIcone="#899EEB"
                ultimo
              />
            </View>

            {/* AVISO */}

            <View style={styles.avisoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={23}
                color="#126D83"
              />

              <View style={styles.avisoTextoContainer}>
                <Text style={styles.avisoTitulo}>
                  Seus dados são importantes
                </Text>

                <Text style={styles.avisoTexto}>
                  Mantenha suas informações atualizadas para
                  facilitar o acompanhamento da sua saúde.
                </Text>
              </View>
            </View>

            {/* BOTÃO SAIR DA CONTA */}

            <TouchableOpacity
              style={styles.botaoSair}
              onPress={sairDaConta}
              activeOpacity={0.8}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#D9535D"
              />

              <Text style={styles.textoBotaoSair}>
                Sair da conta
              </Text>
            </TouchableOpacity>

            {/* RODAPÉ */}

            <View style={styles.finalArea}>
              <Ionicons
                name="heart-circle-outline"
                size={29}
                color="#899EEB"
              />

              <Text style={styles.finalTexto}>
                Sunny Health
              </Text>

              <Text style={styles.versao}>
                Cuidado e acompanhamento em saúde
              </Text>

              <Text style={styles.versao}>
                Versão 1.0.0
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
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

  safeArea: {
    flex: 1,
  },

  // ELEMENTOS DECORATIVOS

  arcOne: {
    position: 'absolute',
    width: 480,
    height: 480,
    borderRadius: 300,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
    top: -220,
    right: -180,
  },

  arcTwo: {
    position: 'absolute',
    width: 390,
    height: 390,
    borderRadius: 300,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    top: 190,
    left: -235,
  },

  arcThree: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.17)',
    bottom: -360,
    right: -280,
  },

  glowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 70,
    right: -80,
  },

  glowTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 100,
    backgroundColor: 'rgba(255,245,184,0.14)',
    bottom: 180,
    left: -70,
  },

  // PAINEL PRINCIPAL

  containerBranco: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    marginHorizontal: 12,
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 4,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // BOTÃO VOLTAR

  botaoVoltar: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  // TÍTULO

  tituloArea: {
    marginTop: 8,
    marginBottom: 18,
  },

  titulo: {
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '800',
    color: '#30364D',
  },

  subtitulo: {
    fontSize: 15,
    lineHeight: 21,
    color: '#4D5570',
    marginTop: 5,
  },

  // CARTÃO DO USUÁRIO

  usuarioCard: {
    minHeight: 105,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 23,
    paddingHorizontal: 17,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  usuarioInfo: {
    flex: 1,
  },

  usuarioNome: {
    fontSize: 19,
    fontWeight: '800',
    color: '#30364D',
  },

  usuarioEmail: {
    fontSize: 13.5,
    color: '#6A7395',
    marginTop: 4,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  statusBolinha: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#55B878',
    marginRight: 6,
  },

  statusTexto: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#6A7395',
  },

  // TÍTULOS DAS SEÇÕES

  secaoTitulo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6A7395',
    letterSpacing: 1,
    marginTop: 23,
    marginBottom: 8,
    marginLeft: 4,
  },

  // CARTÕES

  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 21,
    paddingHorizontal: 15,
    paddingVertical: 2,
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  // OPÇÕES DO PERFIL

  opcao: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    paddingVertical: 10,
  },

  opcaoUltima: {
    borderBottomWidth: 0,
  },

  opcaoIcone: {
    width: 43,
    height: 43,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  opcaoTextoContainer: {
    flex: 1,
  },

  opcaoTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#30364D',
  },

  opcaoSubtitulo: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#7B8299',
    marginTop: 3,
  },

  // AVISO

  avisoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(200,207,237,0.30)',
    borderRadius: 18,
    padding: 15,
    marginTop: 23,
    borderWidth: 1,
    borderColor: 'rgba(137,158,235,0.18)',
  },

  avisoTextoContainer: {
    flex: 1,
    marginLeft: 11,
  },

  avisoTitulo: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#30364D',
  },

  avisoTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6A7395',
    marginTop: 4,
  },

  // BOTÃO SAIR DA CONTA

  botaoSair: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#F2D7D9',
    marginTop: 23,
    gap: 9,
  },

  textoBotaoSair: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D9535D',
  },

  // RODAPÉ

  finalArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 8,
  },

  finalTexto: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6A7395',
    marginTop: 6,
  },

  versao: {
    fontSize: 11.5,
    color: '#9AA0B3',
    marginTop: 4,
    textAlign: 'center',
  },
});
