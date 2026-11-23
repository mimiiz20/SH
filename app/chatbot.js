
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
// CONEXÃO COM O BACKEND
// ==========================================

// Substitua pelo IPv4 do notebook.
const API_URL = 'http://192.168.1.5:3000/chat';

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Chatbot() {
  const insets = useSafeAreaInsets();

  const [mensagens, setMensagens] = useState([
    {
      id: 'inicial',
      role: 'assistant',
      content:
        'É um prazer conversar com você!\n\nVocê pode me perguntar sobre Parkinson, cuidados no dia a dia, bem-estar ou outros assuntos relacionados à sua rotina.\n\nPor onde gostaria de começar?',
      horario: 'Agora',
    },
  ]);

  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);

  const scrollRef = useRef(null);

  // ==========================================
  // ROLAGEM AUTOMÁTICA
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [mensagens, carregando]);

  // ==========================================
  // VOLTAR
  // ==========================================

  const voltar = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/batisono');
    }
  };

  // ==========================================
  // ENVIAR MENSAGEM
  // ==========================================

  const enviarMensagem = async (mensagemPersonalizada) => {
    const mensagemTexto = (
      mensagemPersonalizada ?? texto
    ).trim();

    if (!mensagemTexto || carregando) return;

    const mensagemUsuario = {
      id: Date.now().toString(),
      role: 'user',
      content: mensagemTexto,
      horario: 'Agora',
    };

    setMensagens((anterior) => [
      ...anterior,
      mensagemUsuario,
    ]);

    setTexto('');
    setCarregando(true);

    try {
      const historico = mensagens.map((item) => ({
        role: item.role,
        content: item.content,
      }));

      const resposta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mensagem: mensagemTexto,
          historico,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || 'Não foi possível obter uma resposta.'
        );
      }

      if (!dados.resposta) {
        throw new Error('Resposta não encontrada.');
      }

      setMensagens((anterior) => [
        ...anterior,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: dados.resposta,
          horario: 'Agora',
        },
      ]);

    } catch (erro) {
      console.error('Erro ao conversar com Sunny:', erro);

      setMensagens((anterior) => [
        ...anterior,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content:
            'Não consegui me conectar ao servidor neste momento. Verifique se o backend e o Ollama estão funcionando e tente novamente.',
          horario: 'Agora',
        },
      ]);

    } finally {
      setCarregando(false);
    }
  };

  // ==========================================
  // SUGESTÕES
  // ==========================================

  const sugestoes = [
    'Entendendo o Parkinson',
    'Cuidados no dia a dia',
    'Bem-estar e qualidade de vida',
    'Dúvidas sobre sintomas',
  ];

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
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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

            {/* MENSAGENS */}

            {mensagens.map((mensagem) => {
              const usuario = mensagem.role === 'user';

              return (
                <View
                  key={mensagem.id}
                  style={[
                    styles.mensagemArea,
                    usuario && styles.mensagemUsuarioArea,
                  ]}
                >

                  <View style={styles.mensagemCabecalho}>

                    <View
                      style={[
                        styles.mensagemAvatar,
                        usuario && styles.mensagemAvatarUsuario,
                      ]}
                    >
                      <Text style={styles.mensagemAvatarTexto}>
                        {usuario ? 'V' : 'S'}
                      </Text>
                    </View>

                    <Text style={styles.nomeAssistente}>
                      {usuario ? 'Você' : 'Sunny'}
                    </Text>

                    <Text style={styles.horario}>
                      {mensagem.horario}
                    </Text>

                  </View>

                  <View
                    style={[
                      styles.balaoAssistente,
                      usuario && styles.balaoUsuario,
                    ]}
                  >
                    <Text
                      style={[
                        styles.textoMensagem,
                        usuario && styles.textoMensagemUsuario,
                      ]}
                    >
                      {mensagem.content}
                    </Text>
                  </View>

                </View>
              );
            })}

            {/* CARREGAMENTO */}

            {carregando && (
              <View style={styles.carregandoArea}>
                <View style={styles.mensagemAvatar}>
                  <Text style={styles.mensagemAvatarTexto}>S</Text>
                </View>

                <ActivityIndicator
                  size="small"
                  color={C.azul}
                />

                <Text style={styles.carregandoTexto}>
                  Sunny está preparando uma resposta...
                </Text>
              </View>
            )}

            {/* SUGESTÕES */}

            {mensagens.length === 1 && (
              <View style={styles.sugestoesArea}>
                <Text style={styles.sugestoesTitulo}>
                  ASSUNTOS QUE VOCÊ PODE EXPLORAR
                </Text>

                <View style={styles.sugestoesLista}>
                  {sugestoes.map((sugestao) => (
                    <TouchableOpacity
                      key={sugestao}
                      style={styles.sugestao}
                      onPress={() => enviarMensagem(sugestao)}
                      disabled={carregando}
                    >
                      <Text style={styles.sugestaoTexto}>
                        {sugestao}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
                editable={!carregando}
                value={texto}
                onChangeText={setTexto}
                maxLength={2000}
              />

              <TouchableOpacity
                style={[
                  styles.botaoEnviar,
                  (!texto.trim() || carregando) &&
                    styles.botaoEnviarDesabilitado,
                ]}
                onPress={() => enviarMensagem()}
                disabled={!texto.trim() || carregando}
                accessibilityLabel="Enviar mensagem"
              >
                <Ionicons
                  name="arrow-up"
                  size={22}
                  color={C.branco}
                />
              </TouchableOpacity>

            </View>

            <Text style={styles.textoCompositor}>
              Assistente virtual com inteligência artificial.
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

  // MENSAGENS

  mensagemArea: {
    marginBottom: 25,
  },

  mensagemUsuarioArea: {
    alignItems: 'flex-end',
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

  mensagemAvatarUsuario: {
    backgroundColor: C.roxo,
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

  balaoUsuario: {
    backgroundColor: C.azul,
    borderTopLeftRadius: 19,
    borderTopRightRadius: 5,
  },

  textoMensagem: {
    color: C.texto,
    fontSize: 13,
    lineHeight: 21,
  },

  textoMensagemUsuario: {
    color: C.branco,
  },

  // CARREGAMENTO

  carregandoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },

  carregandoTexto: {
    color: C.secundario,
    fontSize: 11,
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
  },

  botaoEnviarDesabilitado: {
    opacity: 0.65,
  },

  textoCompositor: {
    color: C.secundario,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 9,
  },

});
