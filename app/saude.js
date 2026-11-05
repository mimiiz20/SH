import React, { useCallback, useState } from 'react';

import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import {
  router,
  useLocalSearchParams,
  useFocusEffect,
} from 'expo-router';

import { getDatabase } from '../database/database';

export default function Saude() {
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();

  const [questionario, setQuestionario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // ============================================================
  // NAVEGAÇÃO
  // ============================================================

  const navegar = (rota) => {
    router.push(rota);
  };

  // ============================================================
  // FUNÇÕES PARA INTERPRETAR AS RESPOSTAS
  // ============================================================

  const valorNumerico = (valor) => {
    if (valor === null || valor === undefined || valor === '') {
      return 0;
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
      return 0;
    }

    return numero;
  };

  const porcentagem = (valor, maximo = 5) => {
    const numero = valorNumerico(valor);

    if (numero <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round((numero / maximo) * 100)
    );
  };

  const textoResposta = (valor) => {
    if (
      valor === null ||
      valor === undefined ||
      valor === ''
    ) {
      return '--';
    }

    return String(valor);
  };

  // ============================================================
  // TEXTOS DAS RESPOSTAS
  // ============================================================

  const textoHorasSono = (valor) => {
    const respostas = {
      1: 'Menos de 5 horas',
      2: '5 a 6 horas',
      3: '6 a 7 horas',
      4: '7 a 8 horas',
      5: 'Mais de 8 horas',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoQualidadeSono = (valor) => {
    const respostas = {
      1: 'Muito ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Boa',
      5: 'Muito boa',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoDescanso = (valor) => {
    const respostas = {
      1: 'Nada descansado',
      2: 'Pouco descansado',
      3: 'Moderadamente descansado',
      4: 'Bem descansado',
      5: 'Muito descansado',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoHumor = (valor) => {
    const respostas = {
      1: 'Muito ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Muito bom',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoEstresse = (valor) => {
    const respostas = {
      1: 'Muito baixo',
      2: 'Baixo',
      3: 'Moderado',
      4: 'Alto',
      5: 'Muito alto',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoRelaxamento = (valor) => {
    const respostas = {
      1: 'Nunca',
      2: 'Raramente',
      3: 'Às vezes',
      4: 'Frequentemente',
      5: 'Sempre',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoDisposicao = (valor) => {
    const respostas = {
      1: 'Muito baixa',
      2: 'Baixa',
      3: 'Moderada',
      4: 'Boa',
      5: 'Muito boa',
    };

    return respostas[valor] || textoResposta(valor);
  };

  const textoFrequenciaAtividade = (valor) => {
    const respostas = {
      1: 'Nunca',
      2: '1 vez por semana',
      3: '2 a 3 vezes por semana',
      4: '4 a 5 vezes por semana',
      5: 'Todos os dias',
    };

    return respostas[valor] || textoResposta(valor);
  };

  // ============================================================
  // BUSCAR QUESTIONÁRIO
  // ============================================================

  const carregarQuestionario = async () => {
    try {
      setCarregando(true);

      const db = await getDatabase();

      let usuarioId = params.usuarioId;

      // --------------------------------------------------------
      // Se não recebeu usuarioId pela rota,
      // busca na sessão
      // --------------------------------------------------------

      if (!usuarioId) {
        const sessao = await db.getFirstAsync(`
          SELECT usuario_id
          FROM sessao
          WHERE id = 1
          LIMIT 1
        `);

        if (sessao) {
          usuarioId = sessao.usuario_id;
        }
      }

      // --------------------------------------------------------
      // Se ainda não encontrou usuário
      // --------------------------------------------------------

      if (!usuarioId) {
        setQuestionario(null);
        return;
      }

      // --------------------------------------------------------
      // Busca o último questionário respondido
      // --------------------------------------------------------

      const resultado = await db.getFirstAsync(
        `
        SELECT *
        FROM questionarios
        WHERE usuario_id = ?
        ORDER BY id DESC
        LIMIT 1
        `,
        [Number(usuarioId)]
      );

      setQuestionario(resultado || null);
    } catch (erro) {
      console.log(
        'Erro ao carregar questionário:',
        erro
      );

      setQuestionario(null);
    } finally {
      setCarregando(false);
    }
  };

  // ============================================================
  // RECARREGAR AO ENTRAR NA TELA
  // ============================================================
  //
  // IMPORTANTE:
  // O useFocusEffect agora vem do expo-router.
  // Assim não precisamos instalar @react-navigation/native.
  //
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      carregarQuestionario();
    }, [params.usuarioId])
  );

  // ============================================================
  // COMPONENTE DE BARRA
  // ============================================================

  const BarraGrafico = ({
    titulo,
    valor,
    maximo = 5,
    cor = '#5574B8',
    texto,
  }) => {
    const percentual = porcentagem(valor, maximo);

    return (
      <View style={styles.barraItem}>
        <View style={styles.barraCabecalho}>
          <Text style={styles.barraTitulo}>
            {titulo}
          </Text>

          <Text style={styles.barraValor}>
            {texto || `${valor || 0}/${maximo}`}
          </Text>
        </View>

        <View style={styles.barraFundo}>
          <View
            style={[
              styles.barraPreenchida,
              {
                width: `${percentual}%`,
                backgroundColor: cor,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // ============================================================
  // TELA DE CARREGAMENTO
  // ============================================================

  if (carregando) {
    return (
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#5574B8"
            />

            <Text style={styles.loadingTexto}>
              Carregando seus dados de saúde...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>

        {/* ======================================================
            FUNDO
        ====================================================== */}

        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: '#C9C3E6',
            },
          ]}
        />

        {/* ======================================================
            BRILHOS
        ====================================================== */}

        <View
          pointerEvents="none"
          style={styles.glowOne}
        />

        <View
          pointerEvents="none"
          style={styles.glowTwo}
        />

        <View
          pointerEvents="none"
          style={styles.glowThree}
        />

        {/* ======================================================
            NAVBAR SUPERIOR
        ====================================================== */}

        <View
          style={[
            styles.topSafeArea,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.navbar}>

            <View style={styles.navbarTexto}>
              <Text style={styles.nomeLogo}>
                SUNNY HEALTH
              </Text>

              <Image
                source={require('../assets/images/Logo.png')}
                style={styles.logoImagem}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={styles.botaoPerfil}
              onPress={() => navegar('/perfil')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={26}
                color="#30364D"
              />
            </TouchableOpacity>

          </View>
        </View>

        {/* ======================================================
            CONTEÚDO
        ====================================================== */}

        <View style={styles.conteudoPrincipal}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* ==================================================
                TÍTULO
            ================================================== */}

            <View style={styles.tituloPagina}>

              <Text style={styles.titulo}>
                Minha saúde
              </Text>

              <Text style={styles.subtituloPagina}>
                Acompanhe suas respostas e seus hábitos de saúde.
              </Text>

            </View>

            {/* ==================================================
                SEM QUESTIONÁRIO
            ================================================== */}

            {!questionario ? (

              <View style={styles.cardSemDados}>

                <View style={styles.iconeSemDados}>
                  <Ionicons
                    name="clipboard-outline"
                    size={34}
                    color="#5574B8"
                  />
                </View>

                <Text style={styles.tituloSemDados}>
                  Nenhum questionário respondido
                </Text>

                <Text style={styles.textoSemDados}>
                  Responda ao questionário para visualizar
                  seus dados de sono, alimentação, bem-estar
                  e atividade física.
                </Text>

                <TouchableOpacity
                  style={styles.botaoQuestionario}
                  onPress={() => navegar('/quest')}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text style={styles.textoBotaoQuestionario}>
                    Responder questionário
                  </Text>
                </TouchableOpacity>

              </View>

            ) : (

              <>

                {/* ==================================================
                    RESUMO
                ================================================== */}

                <View style={styles.card}>

                  <View style={styles.cardCabecalho}>

                    <View
                      style={[
                        styles.iconeCard,
                        styles.iconeSaude,
                      ]}
                    >
                      <Ionicons
                        name="heart-outline"
                        size={28}
                        color="#5574B8"
                      />
                    </View>

                    <View style={styles.cardTituloArea}>

                      <Text style={styles.cardTitulo}>
                        Resumo de saúde
                      </Text>

                      <Text style={styles.cardDescricao}>
                        Informações do seu último questionário
                      </Text>

                    </View>

                  </View>

                  <View style={styles.resumoGrid}>

                    <View style={styles.resumoItem}>

                      <Ionicons
                        name="moon-outline"
                        size={23}
                        color="#5574B8"
                      />

                      <Text style={styles.resumoValor}>
                        {questionario.horas_sono
                          ? textoHorasSono(
                              questionario.horas_sono
                            )
                          : '--'}
                      </Text>

                      <Text style={styles.resumoLabel}>
                        sono
                      </Text>

                    </View>

                    <View style={styles.resumoDivisor} />

                    <View style={styles.resumoItem}>

                      <Ionicons
                        name="restaurant-outline"
                        size={23}
                        color="#5574B8"
                      />

                      <Text style={styles.resumoValor}>
                        {questionario.refeicoes_dia || '--'}
                      </Text>

                      <Text style={styles.resumoLabel}>
                        refeições/dia
                      </Text>

                    </View>

                    <View style={styles.resumoDivisor} />

                    <View style={styles.resumoItem}>

                      <Ionicons
                        name="fitness-outline"
                        size={23}
                        color="#5574B8"
                      />

                      <Text style={styles.resumoValor}>
                        {questionario.atividade_minutos || '--'}
                      </Text>

                      <Text style={styles.resumoLabel}>
                        min. atividade
                      </Text>

                    </View>

                  </View>

                </View>

                {/* ==================================================
                    SONO
                ================================================== */}

                <View style={styles.card}>

                  <View style={styles.graficoCabecalho}>

                    <View style={styles.cabecalhoComIcone}>

                      <View
                        style={[
                          styles.iconeCard,
                          styles.iconeSono,
                        ]}
                      >
                        <Ionicons
                          name="moon"
                          size={27}
                          color="#5574B8"
                        />
                      </View>

                      <View style={styles.cardTituloArea}>

                        <Text style={styles.cardTitulo}>
                          Qualidade do sono
                        </Text>

                        <Text style={styles.cardDescricao}>
                          Como você tem dormido
                        </Text>

                      </View>

                    </View>

                  </View>

                  <View style={styles.valorDestaque}>

                    <Text style={styles.valorDestaqueNumero}>
                      {questionario.horas_sono || '--'}
                    </Text>

                    <Text style={styles.valorDestaqueUnidade}>
                      / 5
                    </Text>

                  </View>

                  <Text style={styles.valorDestaqueDescricao}>
                    {textoHorasSono(
                      questionario.horas_sono
                    )}
                  </Text>

                  <View style={styles.graficoArea}>

                    <BarraGrafico
                      titulo="Qualidade"
                      valor={questionario.qualidade_sono}
                      maximo={5}
                      cor="#5574B8"
                      texto={textoQualidadeSono(
                        questionario.qualidade_sono
                      )}
                    />

                    <BarraGrafico
                      titulo="Descanso"
                      valor={questionario.descanso}
                      maximo={5}
                      cor="#6A7395"
                      texto={textoDescanso(
                        questionario.descanso
                      )}
                    />

                    <BarraGrafico
                      titulo="Despertares"
                      valor={questionario.despertares}
                      maximo={5}
                      cor="#899EEB"
                      texto={`${questionario.despertares || 0}/5`}
                    />

                    <BarraGrafico
                      titulo="Facilidade para dormir"
                      valor={questionario.dificuldade_dormir}
                      maximo={4}
                      cor="#AAB9EF"
                      texto={`${questionario.dificuldade_dormir || 0}/4`}
                    />

                  </View>

                  <View style={styles.infoBox}>

                    <Ionicons
                      name="information-circle-outline"
                      size={20}
                      color="#5574B8"
                    />

                    <Text style={styles.infoTexto}>
                      Estes dados representam as respostas
                      fornecidas no seu último questionário.
                    </Text>

                  </View>

                </View>

                {/* ==================================================
                    ALIMENTAÇÃO
                ================================================== */}

                <View style={styles.card}>

                  <View style={styles.graficoCabecalho}>

                    <View style={styles.cabecalhoComIcone}>

                      <View
                        style={[
                          styles.iconeCard,
                          styles.iconeAlimentacao,
                        ]}
                      >
                        <Ionicons
                          name="restaurant"
                          size={27}
                          color="#5574B8"
                        />
                      </View>

                      <View style={styles.cardTituloArea}>

                        <Text style={styles.cardTitulo}>
                          Alimentação
                        </Text>

                        <Text style={styles.cardDescricao}>
                          Hábitos alimentares registrados
                        </Text>

                      </View>

                    </View>

                  </View>

                  <View style={styles.refeicoesBox}>

                    <View style={styles.refeicoesIcone}>

                      <Ionicons
                        name="restaurant-outline"
                        size={28}
                        color="#5574B8"
                      />

                    </View>

                    <View style={styles.refeicoesTexto}>

                      <Text style={styles.refeicoesLabel}>
                        Refeições por dia
                      </Text>

                      <Text style={styles.refeicoesValor}>
                        {questionario.refeicoes_dia || '--'}
                      </Text>

                    </View>

                  </View>

                  <View style={styles.graficoArea}>

                    <BarraGrafico
                      titulo="Frutas"
                      valor={questionario.frutas}
                      maximo={5}
                      cor="#6AAE82"
                      texto={`${questionario.frutas || 0}/5`}
                    />

                    <BarraGrafico
                      titulo="Verduras e legumes"
                      valor={questionario.verduras}
                      maximo={5}
                      cor="#55B878"
                      texto={`${questionario.verduras || 0}/5`}
                    />

                    <BarraGrafico
                      titulo="Alimentos ultraprocessados"
                      valor={questionario.ultraprocessados}
                      maximo={5}
                      cor="#D8A85B"
                      texto={`${questionario.ultraprocessados || 0}/5`}
                    />

                    <BarraGrafico
                      titulo="Consumo de água"
                      valor={questionario.agua}
                      maximo={5}
                      cor="#6E9ED8"
                      texto={`${questionario.agua || 0}/5`}
                    />

                  </View>

                  <View style={styles.legendaAlimentacao}>

                    <Ionicons
                      name="leaf-outline"
                      size={19}
                      color="#55B878"
                    />

                    <Text style={styles.legendaTexto}>
                      Os indicadores representam as respostas
                      fornecidas no questionário.
                    </Text>

                  </View>

                </View>

                {/* ==================================================
                    BEM-ESTAR
                ================================================== */}

                <View style={styles.card}>

                  <View style={styles.graficoCabecalho}>

                    <View style={styles.cabecalhoComIcone}>

                      <View
                        style={[
                          styles.iconeCard,
                          styles.iconeMental,
                        ]}
                      >
                        <Ionicons
                          name="happy-outline"
                          size={28}
                          color="#5574B8"
                        />
                      </View>

                      <View style={styles.cardTituloArea}>

                        <Text style={styles.cardTitulo}>
                          Bem-estar
                        </Text>

                        <Text style={styles.cardDescricao}>
                          Como você se sentiu no período
                        </Text>

                      </View>

                    </View>

                  </View>

                  <View style={styles.graficoArea}>

                    <BarraGrafico
                      titulo="Humor"
                      valor={questionario.humor}
                      maximo={5}
                      cor="#899EEB"
                      texto={textoHumor(
                        questionario.humor
                      )}
                    />

                    <BarraGrafico
                      titulo="Estresse"
                      valor={questionario.estresse}
                      maximo={5}
                      cor="#B184C8"
                      texto={textoEstresse(
                        questionario.estresse
                      )}
                    />

                    <BarraGrafico
                      titulo="Relaxamento"
                      valor={questionario.relaxamento}
                      maximo={5}
                      cor="#72A98A"
                      texto={textoRelaxamento(
                        questionario.relaxamento
                      )}
                    />

                    <BarraGrafico
                      titulo="Disposição"
                      valor={questionario.disposicao}
                      maximo={5}
                      cor="#5574B8"
                      texto={textoDisposicao(
                        questionario.disposicao
                      )}
                    />

                  </View>

                </View>

                {/* ==================================================
                    ATIVIDADE FÍSICA
                ================================================== */}

                <View style={styles.card}>

                  <View style={styles.graficoCabecalho}>

                    <View style={styles.cabecalhoComIcone}>

                      <View
                        style={[
                          styles.iconeCard,
                          styles.iconeAtividade,
                        ]}
                      >
                        <Ionicons
                          name="walk"
                          size={28}
                          color="#5574B8"
                        />
                      </View>

                      <View style={styles.cardTituloArea}>

                        <Text style={styles.cardTitulo}>
                          Atividade física
                        </Text>

                        <Text style={styles.cardDescricao}>
                          Movimento e rotina diária
                        </Text>

                      </View>

                    </View>

                  </View>

                  <View style={styles.atividadeGrid}>

                    <View style={styles.atividadeItem}>

                      <Ionicons
                        name="time-outline"
                        size={25}
                        color="#5574B8"
                      />

                      <Text style={styles.atividadeNumero}>
                        {questionario.atividade_minutos || '--'}
                      </Text>

                      <Text style={styles.atividadeLabel}>
                        minutos
                      </Text>

                    </View>

                    <View style={styles.atividadeDivisor} />

                    <View style={styles.atividadeItem}>

                      <Ionicons
                        name="calendar-outline"
                        size={25}
                        color="#5574B8"
                      />

                      <Text
                        style={[
                          styles.atividadeFrequencia,
                          {
                            maxWidth: 115,
                          },
                        ]}
                      >
                        {textoFrequenciaAtividade(
                          questionario.atividade_frequencia
                        )}
                      </Text>

                      <Text style={styles.atividadeLabel}>
                        frequência
                      </Text>

                    </View>

                  </View>

                  <View style={styles.dificuldadeAtividade}>

                    <View style={styles.dificuldadeIcone}>

                      <Ionicons
                        name="body-outline"
                        size={23}
                        color="#5574B8"
                      />

                    </View>

                    <View style={styles.dificuldadeTexto}>

                      <Text style={styles.dificuldadeTitulo}>
                        Dificuldade nas atividades
                      </Text>

                      <Text style={styles.dificuldadeValor}>
                        {textoResposta(
                          questionario.dificuldade_atividades
                        )}
                      </Text>

                    </View>

                  </View>

                </View>

                {/* ==================================================
                    ÚLTIMO REGISTRO
                ================================================== */}

                <View style={styles.cardAviso}>

                  <View style={styles.iconeAviso}>

                    <Ionicons
                      name="checkmark-circle-outline"
                      size={27}
                      color="#5574B8"
                    />

                  </View>

                  <View style={styles.textoAvisoArea}>

                    <Text style={styles.tituloAviso}>
                      Dados atualizados
                    </Text>

                    <Text style={styles.textoAvisoCompleto}>
                      Esta tela utiliza as respostas mais recentes
                      salvas no questionário. Ao responder novamente,
                      os dados desta página serão atualizados.
                    </Text>

                  </View>

                </View>

              </>

            )}

            <View style={{ height: 25 }} />

          </ScrollView>

        </View>

        {/* ======================================================
            BARRA INFERIOR
        ====================================================== */}

        <View
          style={[
            styles.bottomSafeArea,
            {
              paddingBottom: insets.bottom,
            },
          ]}
        >

          <View style={styles.bottomBar}>

            {/* ==================================================
                INÍCIO
            ================================================== */}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/inicio')}
              activeOpacity={0.8}
            >
              <View style={styles.navIcon}>

                <Ionicons
                  name="home-outline"
                  size={25}
                  color="#5574B8"
                />

              </View>

              <Text style={styles.navTexto}>
                Início
              </Text>

            </TouchableOpacity>

            {/* ==================================================
                BATIMENTOS
            ================================================== */}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/batisono')}
              activeOpacity={0.8}
            >
              <View style={styles.navIcon}>

                <Ionicons
                  name="heart-outline"
                  size={25}
                  color="#5574B8"
                />

              </View>

              <Text style={styles.navTexto}>
                Batimentos
              </Text>

            </TouchableOpacity>

            {/* ==================================================
                TREMores
            ================================================== */}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/tremores')}
              activeOpacity={0.8}
            >
              <View style={styles.navIcon}>

                <Ionicons
                  name="hand-left-outline"
                  size={25}
                  color="#5574B8"
                />

              </View>

              <Text style={styles.navTexto}>
                Tremores
              </Text>

            </TouchableOpacity>

            {/* ==================================================
                SAÚDE - ATIVO
            ================================================== */}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/saude')}
              activeOpacity={0.8}
            >

              <View style={styles.navIconAtivo}>

                <Ionicons
                  name="shield-checkmark"
                  size={25}
                  color="#30364D"
                />

              </View>

              <Text
                style={[
                  styles.navTexto,
                  styles.navTextoAtivo,
                ]}
              >
                Saúde
              </Text>

            </TouchableOpacity>

            {/* ==================================================
                QUESTIONÁRIO
            ================================================== */}

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/quest')}
              activeOpacity={0.8}
            >

              <View style={styles.navIcon}>

                <Ionicons
                  name="document-text-outline"
                  size={25}
                  color="#5574B8"
                />

              </View>

              <Text style={styles.navTexto}>
                Questionário
              </Text>

            </TouchableOpacity>

          </View>

        </View>

      </View>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  // ============================================================
  // ESTRUTURA
  // ============================================================

  safeArea: {
    flex: 1,
    backgroundColor: '#C9C3E6',
  },

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  conteudoPrincipal: {
    flex: 1,
  },

  // ============================================================
  // BRILHOS
  // ============================================================

  glowOne: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 100,
    right: -90,
  },

  glowTwo: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: 150,
    left: -80,
  },

  glowThree: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 420,
    right: 20,
  },

  // ============================================================
  // NAVBAR SUPERIOR
  // ============================================================

  topSafeArea: {
    backgroundColor: 'transparent',
    zIndex: 20,
  },

  navbar: {
    minHeight: 76,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DDE3F0',

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 4,
  },

  navbarTexto: {
    flex: 1,
    marginRight: 12,
  },

  nomeLogo: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#416AAB',
    marginTop: 15,
    marginBottom: -42,
    marginLeft: 45,
  },

  logoImagem: {
    width: 200,
    height: 65,
    marginLeft: -85,
  },

  botaoPerfil: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E9F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8D4EA',
  },

  // ============================================================
  // SCROLL
  // ============================================================

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 22,
  },

  // ============================================================
  // TÍTULO
  // ============================================================

  tituloPagina: {
    marginBottom: 18,
  },

  titulo: {
    fontSize: 29,
    fontWeight: '800',
    color: '#30364D',
  },

  subtituloPagina: {
    marginTop: 5,
    fontSize: 16,
    color: '#4B5268',
  },

  // ============================================================
  // CARDS
  // ============================================================

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    marginBottom: 15,

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },

  cardCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  graficoCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cabecalhoComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  cardTituloArea: {
    flex: 1,
  },

  iconeCard: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconeSaude: {
    backgroundColor: '#E2E9F7',
  },

  iconeSono: {
    backgroundColor: '#E5E6F7',
  },

  iconeAlimentacao: {
    backgroundColor: '#E5F0E8',
  },

  iconeMental: {
    backgroundColor: '#E8E5F4',
  },

  iconeAtividade: {
    backgroundColor: '#E2E9F7',
  },

  cardTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#30364D',
  },

  cardDescricao: {
    marginTop: 5,
    fontSize: 13,
    color: '#7183A8',
  },

  // ============================================================
  // RESUMO
  // ============================================================

  resumoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E1E6F0',
  },

  resumoItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },

  resumoDivisor: {
    width: 1,
    height: 55,
    backgroundColor: '#DCE2EE',
  },

  resumoValor: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: '700',
    color: '#30364D',
    textAlign: 'center',
  },

  resumoLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#7183A8',
    textAlign: 'center',
  },

  // ============================================================
  // VALOR DESTAQUE
  // ============================================================

  valorDestaque: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 18,
  },

  valorDestaqueNumero: {
    fontSize: 38,
    fontWeight: '800',
    color: '#416AAB',
  },

  valorDestaqueUnidade: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#7183A8',
  },

  valorDestaqueDescricao: {
    marginTop: -2,
    fontSize: 12,
    color: '#7183A8',
  },

  // ============================================================
  // GRÁFICOS DE BARRA
  // ============================================================

  graficoArea: {
    marginTop: 18,
  },

  barraItem: {
    marginBottom: 16,
  },

  barraCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  barraTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5268',
    flex: 1,
  },

  barraValor: {
    fontSize: 10,
    color: '#7183A8',
    textAlign: 'right',
    marginLeft: 10,
    maxWidth: 150,
  },

  barraFundo: {
    width: '100%',
    height: 10,
    borderRadius: 10,
    backgroundColor: '#E8EBF4',
    overflow: 'hidden',
  },

  barraPreenchida: {
    height: '100%',
    borderRadius: 10,
  },

  // ============================================================
  // INFO
  // ============================================================

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8EDF8',
    borderRadius: 14,
    padding: 11,
    marginTop: 5,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 15,
    color: '#62749C',
  },

  // ============================================================
  // ALIMENTAÇÃO
  // ============================================================

  refeicoesBox: {
    marginTop: 17,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
    alignItems: 'center',
  },

  refeicoesIcone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5F0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  refeicoesTexto: {
    marginLeft: 13,
  },

  refeicoesLabel: {
    fontSize: 11,
    color: '#7183A8',
  },

  refeicoesValor: {
    marginTop: 2,
    fontSize: 27,
    fontWeight: '800',
    color: '#30364D',
  },

  legendaAlimentacao: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F7F3',
    borderRadius: 13,
    padding: 11,
  },

  legendaTexto: {
    flex: 1,
    marginLeft: 8,
    fontSize: 10,
    lineHeight: 15,
    color: '#62749C',
  },

  // ============================================================
  // ATIVIDADE
  // ============================================================

  atividadeGrid: {
    marginTop: 17,
    paddingVertical: 15,
    borderRadius: 17,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
    alignItems: 'center',
  },

  atividadeItem: {
    flex: 1,
    alignItems: 'center',
    minHeight: 85,
    justifyContent: 'center',
  },

  atividadeDivisor: {
    width: 1,
    height: 55,
    backgroundColor: '#DCE2EE',
  },

  atividadeNumero: {
    marginTop: 6,
    fontSize: 27,
    fontWeight: '800',
    color: '#30364D',
  },

  atividadeFrequencia: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '700',
    color: '#30364D',
    textAlign: 'center',
  },

  atividadeLabel: {
    marginTop: 2,
    fontSize: 10,
    color: '#7183A8',
  },

  dificuldadeAtividade: {
    marginTop: 15,
    padding: 13,
    borderRadius: 15,
    backgroundColor: '#F7F8FC',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dificuldadeIcone: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dificuldadeTexto: {
    marginLeft: 11,
    flex: 1,
  },

  dificuldadeTitulo: {
    fontSize: 11,
    color: '#7183A8',
  },

  dificuldadeValor: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
    color: '#30364D',
  },

  // ============================================================
  // SEM DADOS
  // ============================================================

  cardSemDados: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 25,
    alignItems: 'center',

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },

  iconeSemDados: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E2E9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloSemDados: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: '700',
    color: '#30364D',
    textAlign: 'center',
  },

  textoSemDados: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#7183A8',
    textAlign: 'center',
  },

  botaoQuestionario: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: '#5574B8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoBotaoQuestionario: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ============================================================
  // AVISO FINAL
  // ============================================================

  cardAviso: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  iconeAviso: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E9F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  textoAvisoArea: {
    flex: 1,
  },

  tituloAviso: {
    fontSize: 13,
    fontWeight: '700',
    color: '#30364D',
  },

  textoAvisoCompleto: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#7183A8',
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C9C3E6',
  },

  loadingTexto: {
    marginTop: 12,
    fontSize: 13,
    color: '#5574B8',
    fontWeight: '600',
  },

  // ============================================================
  // BARRA INFERIOR
  // ============================================================

  bottomSafeArea: {
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },

  bottomBar: {
    height: 76,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#DDE3F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    paddingTop: 5,
    paddingBottom: 5,

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: -2,
    },

    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 8,
  },

  navItem: {
    flex: 1,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },

  navIcon: {
    width: 42,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navIconAtivo: {
    width: 43,
    height: 36,
    borderRadius: 22,
    backgroundColor: '#E2E9F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  navTexto: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    color: '#7183A8',
    textAlign: 'center',
  },

  navTextoAtivo: {
    color: '#30364D',
    fontWeight: '700',
  },
});