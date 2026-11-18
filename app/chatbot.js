import React from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,StyleSheet,Text,TextInput,TouchableOpacity,View,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// ==========================================
// CORES
// ==========================================

const C = {
  fundo: '#B8C5E8',
  branco: '#FFFFFF',
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  rosa: '#C65B69',
  borda: '#E7EAF4',
  roxo: '#7A6BB5',
};

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Chatbot() {
  const insets = useSafeAreaInsets();

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/batisono');
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>

        {/* NAVBAR SUPERIOR */}

        <View
          style={[
            styles.topSafeArea,
            { paddingTop: insets.top },
          ]}
        >
          <View style={styles.navbar}>

            <TouchableOpacity
              style={styles.botaoVoltar}
              onPress={voltar}
              accessibilityLabel="Voltar para a tela anterior"
            >
              <Ionicons
                name="arrow-back"
                size={25}
                color={C.texto}
              />
            </TouchableOpacity>

            <View style={styles.navbarTituloArea}>
              <Text style={styles.navbarTitulo}>
                Assistente Sunny
              </Text>

              <Text style={styles.navbarSubtitulo}>
                Comunicação e apoio
              </Text>
            </View>

          </View>
        </View>

        {/* CONTEÚDO PRINCIPAL */}

        <KeyboardAvoidingView
          style={styles.conteudoPrincipal}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* APRESENTAÇÃO */}

            <View style={styles.apresentacao}>
              <View style={styles.avatarAssistente}>
                <Text style={styles.avatarTexto}>S</Text>
              </View>

              <Text style={styles.titulo}>
                Olá! Como posso ajudar?
              </Text>

              <Text style={styles.subtitulo}>
                Sou a assistente virtual do Sunny Health.
                Estou aqui para conversar, esclarecer dúvidas
                e compartilhar informações sobre a doença de Parkinson.
              </Text>
            </View>

            {/* MENSAGEM INICIAL */}

            <View style={styles.mensagemArea}>

              <View style={styles.mensagemCabecalho}>
                <View style={styles.mensagemAvatar}>
                  <Text style={styles.mensagemAvatarTexto}>S</Text>
                </View>

                <Text style={styles.nomeAssistente}>
                  Sunny
                </Text>

                <Text style={styles.horario}>
                  Agora
                </Text>
              </View>

              <View style={styles.balaoAssistente}>
                <Text style={styles.textoMensagem}>
                  É um prazer conversar com você!

                  {'\n\n'}

                  Você pode me perguntar sobre Parkinson,
                  cuidados no dia a dia, bem-estar ou outros
                  assuntos relacionados à sua rotina.

                  {'\n\n'}

                  Por onde gostaria de começar?
                </Text>
              </View>

            </View>

            {/* SUGESTÕES DE CONVERSA */}

            <View style={styles.sugestoesArea}>
              <Text style={styles.sugestoesTitulo}>
                ASSUNTOS QUE VOCÊ PODE EXPLORAR
              </Text>

              <View style={styles.sugestoesLista}>

                <View style={styles.sugestao}>
                  <Text style={styles.sugestaoTexto}>
                    Entendendo o Parkinson
                  </Text>
                </View>

                <View style={styles.sugestao}>
                  <Text style={styles.sugestaoTexto}>
                    Cuidados no dia a dia
                  </Text>
                </View>

                <View style={styles.sugestao}>
                  <Text style={styles.sugestaoTexto}>
                    Bem-estar e qualidade de vida
                  </Text>
                </View>

                <View style={styles.sugestao}>
                  <Text style={styles.sugestaoTexto}>
                    Dúvidas sobre sintomas
                  </Text>
                </View>

              </View>
            </View>

            {/* AVISO */}

            <View style={styles.aviso}>
              <Ionicons
                name="information-circle-outline"
                size={21}
                color={C.azul}
              />

              <Text style={styles.avisoTexto}>
                A assistente oferece informações educativas
                e não substitui a avaliação ou orientação
                de profissionais de saúde.
              </Text>
            </View>

          </ScrollView>

          {/* CAMPO DE MENSAGEM */}

          <View
            style={[
              styles.compositorArea,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >

            <View style={styles.compositor}>

              <TextInput
                style={styles.campoMensagem}
                placeholder="Digite sua mensagem..."
                placeholderTextColor={C.secundario}
                multiline
                editable={false}
              />

              <View style={styles.botaoEnviar}>
                <Ionicons
                  name="arrow-up"
                  size={22}
                  color={C.branco}
                />
              </View>

            </View>

            <Text style={styles.textoCompositor}>
              Assistente virtual em fase de desenvolvimento.
            </Text>

          </View>

        </KeyboardAvoidingView>

      </View>
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: '#30364D',
  },

  container: {
    flex: 1,
    backgroundColor: C.fundo,
    overflow: 'hidden',
  },

  // NAVBAR SUPERIOR

  topSafeArea: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    zIndex: 2,
    marginHorizontal: -17,
  },

  navbar: {
    minHeight: 75,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },

  botaoVoltar: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: C.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  navbarTituloArea: {
    flex: 1,
  },

  navbarTitulo: {
    color: C.texto,
    fontSize: 17,
    fontWeight: '800',
  },

  navbarSubtitulo: {
    color: C.secundario,
    fontSize: 11,
    marginTop: 3,
  },

  // CONTEÚDO

  conteudoPrincipal: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 25,
    paddingBottom: 20,
  },

  // APRESENTAÇÃO

  apresentacao: {
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 27,
  },

  avatarAssistente: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: C.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: C.texto,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  avatarTexto: {
    color: C.branco,
    fontSize: 34,
    fontWeight: '900',
  },

  titulo: {
    color: C.texto,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitulo: {
    color: C.texto,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
  },

  // MENSAGEM

  mensagemArea: {
    marginBottom: 25,
  },

  mensagemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
    gap: 8,
  },

  mensagemAvatar: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: C.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },

  mensagemAvatarTexto: {
    color: C.branco,
    fontSize: 15,
    fontWeight: '900',
  },

  nomeAssistente: {
    color: C.texto,
    fontSize: 12,
    fontWeight: '800',
  },

  horario: {
    color: C.secundario,
    fontSize: 10,
    marginLeft: 'auto',
  },

  balaoAssistente: {
    backgroundColor: C.branco,
    borderRadius: 19,
    borderTopLeftRadius: 5,
    padding: 17,
    maxWidth: '94%',
    shadowColor: C.texto,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
  },

  textoMensagem: {
    color: C.texto,
    fontSize: 13,
    lineHeight: 21,
  },

  // SUGESTÕES

  sugestoesArea: {
    marginBottom: 20,
  },

  sugestoesTitulo: {
    color: C.secundario,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 11,
  },

  sugestoesLista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  sugestao: {
    backgroundColor: C.branco,
    borderWidth: 1,
    borderColor: C.borda,
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },

  sugestaoTexto: {
    color: C.azul,
    fontSize: 11,
    fontWeight: '700',
  },

  // AVISO

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: C.azulClaro,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },

  avisoTexto: {
    flex: 1,
    color: C.texto,
    fontSize: 11,
    lineHeight: 17,
  },

  // CAMPO DE MENSAGEM

  compositorArea: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingHorizontal: 16,
    paddingTop: 13,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    shadowColor: C.texto,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },

  compositor: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F6FB',
    borderWidth: 1,
    borderColor: C.borda,
    borderRadius: 17,
    paddingHorizontal: 13,
  },

  campoMensagem: {
    flex: 1,
    color: C.texto,
    fontSize: 13,
    minHeight: 45,
    maxHeight: 90,
    paddingVertical: 12,
  },

  botaoEnviar: {
    width: 37,
    height: 37,
    borderRadius: 13,
    backgroundColor: C.azul,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    opacity: 0.65,
  },

  textoCompositor: {
    color: C.secundario,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 9,
  },

});
