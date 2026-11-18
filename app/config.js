
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';

import { router } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// ============================================================
// CORES
// ============================================================

const C = {
  fundo: '#C9C3E6',
  branco: '#FFFFFF',
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  rosa: '#C65B69',
  rosaClaro: '#FBECEF',
  verde: '#4B8B76',
  borda: '#E7EAF4',
  roxo: '#7A6BB5',
};

// ============================================================
// COMPONENTE DE ITEM DE CONFIGURAÇÃO
// ============================================================

function ItemConfiguracao({
  icone,
  titulo,
  descricao,
  onPress,
  cor = C.azul,
  ultimo = false,
}) {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        !ultimo && styles.itemBorda,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.iconeContainer,
          { backgroundColor: `${cor}22` },
        ]}
      >
        <Ionicons name={icone} size={21} color={cor} />
      </View>

      <View style={styles.itemTexto}>
        <Text style={styles.itemTitulo}>
          {titulo}
        </Text>

        {descricao ? (
          <Text style={styles.itemDescricao}>
            {descricao}
          </Text>
        ) : null}
      </View>

      <Ionicons
        name="chevron-forward"
        size={19}
        color={C.secundario}
      />
    </TouchableOpacity>
  );
}

// ============================================================
// COMPONENTE DE INTERRUPTOR
// ============================================================

function ItemInterruptor({
  icone,
  titulo,
  descricao,
  valor,
  onChange,
}) {
  return (
    <View style={styles.item}>
      <View
        style={[
          styles.iconeContainer,
          { backgroundColor: C.azulClaro },
        ]}
      >
        <Ionicons
          name={icone}
          size={21}
          color={C.azul}
        />
      </View>

      <View style={styles.itemTexto}>
        <Text style={styles.itemTitulo}>
          {titulo}
        </Text>

        <Text style={styles.itemDescricao}>
          {descricao}
        </Text>
      </View>

      <Switch
        value={valor}
        onValueChange={onChange}
        trackColor={{
          false: '#D5D8E4',
          true: '#AAB9E5',
        }}
        thumbColor={valor ? C.azul : '#FFFFFF'}
      />
    </View>
  );
}

// ============================================================
// TÍTULO DAS SEÇÕES
// ============================================================

function TituloSecao({ children }) {
  return (
    <Text style={styles.tituloSecao}>
      {children}
    </Text>
  );
}

// ============================================================
// TELA DE CONFIGURAÇÕES
// ============================================================

export default function Config() {
  const insets = useSafeAreaInsets();

  const [notificacoes, setNotificacoes] = useState(true);
  const [lembretes, setLembretes] = useState(true);
  const [alertasMovimento, setAlertasMovimento] = useState(true);

  // ----------------------------------------------------------
  // VOLTAR
  // ----------------------------------------------------------

  function voltar() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/batisono');
    }
  }

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#899EEB"
      />

      {/* ELEMENTOS DECORATIVOS */}

      <View style={styles.arcOne} />
      <View style={styles.arcTwo} />
      <View style={styles.arcThree} />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <SafeAreaView
        style={styles.safeArea}
        edges={['top']}
      >
        <View
          style={[
            styles.containerBranco,
            {
              marginTop: Math.max(insets.top * 0.15, 4),
            },
          ]}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: Math.max(insets.bottom, 30),
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* BOTÃO VOLTAR */}

            <TouchableOpacity
              style={styles.botaoVoltar}
              onPress={voltar}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color={C.texto}
              />
            </TouchableOpacity>

            {/* TÍTULO */}

            <View style={styles.tituloArea}>
              <Text style={styles.titulo}>
                Configurações
              </Text>

              <Text style={styles.subtitulo}>
                Personalize sua experiência no Sunny Health.
              </Text>
            </View>

            {/* CONTA */}

            <TituloSecao>
              MINHA CONTA
            </TituloSecao>

            <View style={styles.card}>
              <ItemConfiguracao
                icone="person-outline"
                titulo="Meu perfil"
                descricao="Consulte suas informações pessoais"
                cor={C.roxo}
                onPress={() => router.push('/perfil')}
              />

              <ItemConfiguracao
                icone="watch-outline"
                titulo="Relógio Apollo"
                descricao="Gerencie a conexão do dispositivo"
                cor={C.azul}
                onPress={() => router.push('/bluetooth')}
                ultimo
              />
            </View>

            {/* NOTIFICAÇÕES */}

            <TituloSecao>
              NOTIFICAÇÕES E ALERTAS
            </TituloSecao>

            <View style={styles.card}>
              <ItemInterruptor
                icone="notifications-outline"
                titulo="Notificações"
                descricao="Preferência geral de notificações"
                valor={notificacoes}
                onChange={setNotificacoes}
              />

              <View style={styles.separador} />

              <ItemInterruptor
                icone="alarm-outline"
                titulo="Lembretes diários"
                descricao="Lembretes sobre sua rotina de cuidados"
                valor={lembretes}
                onChange={setLembretes}
              />

              <View style={styles.separador} />

              <ItemInterruptor
                icone="pulse-outline"
                titulo="Alertas de movimento"
                descricao="Preferência para alertas do monitoramento"
                valor={alertasMovimento}
                onChange={setAlertasMovimento}
              />
            </View>

            {/* PRIVACIDADE */}

            <TituloSecao>
              PRIVACIDADE E DADOS
            </TituloSecao>

            <View style={styles.card}>
              <ItemConfiguracao
                icone="shield-checkmark-outline"
                titulo="Privacidade"
                descricao="Informações sobre seus dados"
                cor={C.verde}
                onPress={() => {}}
              />

              <ItemConfiguracao
                icone="document-text-outline"
                titulo="Uso do aplicativo"
                descricao="Entenda como funciona o monitoramento"
                cor={C.roxo}
                onPress={() => router.push('/dicas')}
                ultimo
              />
            </View>

            {/* SOBRE */}

            <TituloSecao>
              SOBRE O APLICATIVO
            </TituloSecao>

            <View style={styles.card}>
              <ItemConfiguracao
                icone="information-circle-outline"
                titulo="Sobre o Sunny Health"
                descricao="Conheça o projeto e sua finalidade"
                cor={C.azul}
                onPress={() => {}}
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
                  Sua privacidade é importante
                </Text>

                <Text style={styles.avisoTexto}>
                  O Sunny Health utiliza informações para
                  apresentar indicadores experimentais de
                  acompanhamento. Os dados não substituem
                  avaliações ou orientações médicas.
                </Text>
              </View>
            </View>

            {/* RODAPÉ */}

            <View style={styles.finalArea}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="heart"
                  size={25}
                  color={C.azul}
                />
              </View>

              <Text style={styles.nomeApp}>
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
    color: C.texto,
  },

  subtitulo: {
    fontSize: 15,
    lineHeight: 21,
    color: '#4D5570',
    marginTop: 5,
  },

  // TÍTULOS DAS SEÇÕES

  tituloSecao: {
    fontSize: 12,
    fontWeight: '800',
    color: C.secundario,
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

  // ITENS

  item: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  itemBorda: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  separador: {
    height: 1,
    backgroundColor: C.borda,
  },

  iconeContainer: {
    width: 43,
    height: 43,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  itemTexto: {
    flex: 1,
    paddingRight: 8,
  },

  itemTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: C.texto,
  },

  itemDescricao: {
    fontSize: 12,
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
    color: C.texto,
  },

  avisoTexto: {
    fontSize: 12,
    lineHeight: 18,
    color: C.secundario,
    marginTop: 4,
  },

  // RODAPÉ

  finalArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 8,
  },

  logoContainer: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  nomeApp: {
    fontSize: 17,
    fontWeight: '800',
    color: C.texto,
  },

  versao: {
    fontSize: 11.5,
    color: '#9AA0B3',
    marginTop: 4,
    textAlign: 'center',
  },
});
