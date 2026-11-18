
import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { getDatabase } from '../database/database';

// ==========================================
// CORES
// ==========================================

const GRADIENT = [
  '#899EEB',
  '#AAB9EF',
  '#C8CFED',
  '#E3E1D2',
  '#FFF5B8',
];

const C = {
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  branco: '#FFFFFF',
};

// ==========================================
// ETAPAS DO QUESTIONÁRIO
// ==========================================

const etapas = [
  {
    titulo: 'COMO ESTÁ SEU SONO?',
    subtitulo: 'Queremos entender melhor sua rotina de descanso.',
    icone: 'moon-outline',
    campos: [
      'horas_sono',
      'qualidade_sono',
      'despertares',
      'dificuldade_dormir',
      'descanso',
    ],
    perguntas: [
      [
        'Quantas horas você costuma dormir por noite?',
        'horas_sono',
        ['Menos de 5 horas', '5 a 6 horas', '6 a 7 horas', '7 a 8 horas', 'Mais de 8 horas'],
      ],
      [
        'Como você avalia a qualidade do seu sono?',
        'qualidade_sono',
        ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Muito boa'],
      ],
      [
        'Você costuma acordar durante a noite?',
        'despertares',
        ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Todas as noites'],
      ],
      [
        'Você tem dificuldade para pegar no sono?',
        'dificuldade_dormir',
        ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente'],
      ],
      [
        'Quando acorda, você se sente descansado(a)?',
        'descanso',
        ['Nunca', 'Raramente', 'Às vezes', 'Na maioria das vezes', 'Sempre'],
      ],
    ],
  },
  {
    titulo: 'COMO É SUA ALIMENTAÇÃO?',
    subtitulo: 'Essas informações ajudam a acompanhar seus hábitos.',
    icone: 'restaurant-outline',
    campos: [
      'refeicoes_dia',
      'frutas',
      'verduras',
      'ultraprocessados',
      'agua',
    ],
    perguntas: [
      [
        'Quantas refeições você costuma fazer por dia?',
        'refeicoes_dia',
        ['1 a 2', '3', '4', '5 ou mais'],
      ],
      [
        'Com que frequência você come frutas?',
        'frutas',
        ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Mais de uma vez por dia'],
      ],
      [
        'Com que frequência você come verduras e legumes?',
        'verduras',
        ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Mais de uma vez por dia'],
      ],
      [
        'Com que frequência você consome alimentos ultraprocessados?',
        'ultraprocessados',
        ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Várias vezes ao dia'],
      ],
      [
        'Você costuma beber água ao longo do dia?',
        'agua',
        ['Muito pouco', 'Pouco', 'Às vezes', 'Frequentemente', 'Regularmente'],
      ],
    ],
  },
  {
    titulo: 'COMO VOCÊ TEM SE SENTIDO?',
    subtitulo: 'Conte um pouco sobre seu bem-estar nas últimas semanas.',
    icone: 'heart-outline',
    campos: [
      'humor',
      'estresse',
      'relaxamento',
      'disposicao',
    ],
    perguntas: [
      [
        'Como você tem se sentido nas últimas duas semanas?',
        'humor',
        ['Muito mal', 'Mal', 'Regular', 'Bem', 'Muito bem'],
      ],
      [
        'Com que frequência você se sentiu preocupado(a) ou tenso(a)?',
        'estresse',
        ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Quase sempre'],
      ],
      [
        'Com que frequência você teve dificuldade para relaxar?',
        'relaxamento',
        ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Quase sempre'],
      ],
      [
        'Como está sua disposição no dia a dia?',
        'disposicao',
        ['Muito baixa', 'Baixa', 'Regular', 'Boa', 'Muito boa'],
      ],
    ],
  },
  {
    titulo: 'SUA ROTINA',
    subtitulo: 'Agora vamos conhecer seus hábitos de atividade.',
    icone: 'walk-outline',
    campos: [
      'atividade_minutos',
      'atividade_frequencia',
    ],
    perguntas: [
      [
        'Quanto tempo você costuma se movimentar ou fazer atividade física por dia?',
        'atividade_minutos',
        ['Quase não faço', 'Até 15 minutos', '15 a 30 minutos', '30 a 60 minutos', 'Mais de 1 hora'],
      ],
      [
        'Com que frequência você pratica atividade física?',
        'atividade_frequencia',
        ['Nunca', '1 vez por semana', '2 a 3 vezes por semana', '4 a 5 vezes por semana', 'Todos os dias'],
      ],
    ],
  },
  {
    titulo: 'SEU DIA A DIA',
    subtitulo: 'Por fim, queremos entender como está sua rotina.',
    icone: 'person-outline',
    campos: [
      'dificuldade_atividades',
    ],
    perguntas: [
      [
        'Você sente dificuldade para realizar atividades do dia a dia?',
        'dificuldade_atividades',
        ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
      ],
    ],
  },
];

const perguntasIniciais = etapas.flatMap(e => e.campos);

// ==========================================
// NAVBAR SUPERIOR
// ==========================================

function NavbarSuperior({ insets }) {
  return (
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
          accessibilityLabel="Abrir configurações"
          activeOpacity={0.7}
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
          accessibilityLabel="Abrir perfil"
          activeOpacity={0.7}
        >
          <Ionicons
            name="person-outline"
            size={24}
            color={C.texto}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// NAVBAR INFERIOR
// ==========================================

function NavbarInferior({ insets }) {
  const itens = [
    {
      nome: 'Monitorar',
      icone: 'heart-outline',
      rota: '/batisono',
    },
    {
      nome: 'Questionário',
      icone: 'clipboard-outline',
      rota: '/questionario',
      ativo: true,
    },
    {
      nome: 'Relógio',
      icone: 'bluetooth-outline',
      rota: '/bluetooth',
    },
    {
      nome: 'Dicas',
      icone: 'book-outline',
      rota: '/dicas',
    },
  ];

  return (
    <View
      style={[
        styles.bottomSafeArea,
        { paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.bottomBar}>
        {itens.map(item => (
          <TouchableOpacity
            key={item.nome}
            style={styles.navItem}
            onPress={() => router.replace(item.rota)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.navIcon,
                item.ativo && styles.navIconAtivo,
              ]}
            >
              <Ionicons
                name={item.icone}
                size={23}
                color={item.ativo ? C.texto : C.azul}
              />
            </View>

            <Text
              style={[
                styles.navTexto,
                item.ativo && styles.navTextoAtivo,
              ]}
            >
              {item.nome}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ==========================================
// OPÇÕES DAS PERGUNTAS
// ==========================================

const Opcoes = ({ campo, valores, respostas, responder }) => (
  <View style={styles.opcoes}>
    {valores.map((texto, i) => {
      const valor = i + 1;
      const selecionado = respostas[campo] === valor;

      return (
        <TouchableOpacity
          key={texto}
          style={[
            styles.opcao,
            selecionado && styles.opcaoSelecionada,
          ]}
          activeOpacity={0.8}
          onPress={() => responder(campo, valor)}
        >
          <View
            style={[
              styles.radio,
              selecionado && styles.radioSelecionado,
            ]}
          >
            {selecionado && (
              <View style={styles.radioInterno} />
            )}
          </View>

          <Text
            style={[
              styles.opcaoTexto,
              selecionado && styles.opcaoTextoSelecionado,
            ]}
          >
            {texto}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Questionario() {
  const insets = useSafeAreaInsets();
  const { usuarioId } = useLocalSearchParams();

  const [etapa, setEtapa] = useState(0);
  const [questionarioConcluido, setQuestionarioConcluido] = useState(false);

  const [respostas, setRespostas] = useState(
    Object.fromEntries(
      perguntasIniciais.map(campo => [campo, null])
    )
  );

  const scrollRef = useRef(null);

  const arc1 = useRef(new Animated.Value(0)).current;
  const arc2 = useRef(new Animated.Value(0)).current;
  const arc3 = useRef(new Animated.Value(0)).current;

  // ==========================================
  // ANIMAÇÕES DE FUNDO
  // ==========================================

  useEffect(() => {
    const animar = (animation, duration, delay = 0) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animation, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

    animar(arc1, 9000);
    animar(arc2, 12000, 1000);
    animar(arc3, 15000, 2000);

    return () => {
      arc1.stopAnimation();
      arc2.stopAnimation();
      arc3.stopAnimation();
    };
  }, [arc1, arc2, arc3]);

  // ==========================================
  // REGISTRAR RESPOSTA
  // ==========================================

  const responder = (campo, valor) => {
    setRespostas(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  // ==========================================
  // VERIFICAR ETAPA
  // ==========================================

  const etapaCompleta = () =>
    etapas[etapa].campos.every(
      campo => respostas[campo] !== null
    );

  // ==========================================
  // SALVAR QUESTIONÁRIO NO SQLITE
  // ==========================================

  const finalizarQuestionario = async () => {
    try {
      if (!usuarioId) {
        Alert.alert(
          'Erro',
          'Não foi possível identificar o usuário.'
        );
        return;
      }

      const database = await getDatabase();

      await database.runAsync(
        `INSERT INTO questionarios (
          usuario_id,
          horas_sono,
          qualidade_sono,
          despertares,
          dificuldade_dormir,
          descanso,
          refeicoes_dia,
          frutas,
          verduras,
          ultraprocessados,
          agua,
          humor,
          estresse,
          relaxamento,
          disposicao,
          atividade_minutos,
          atividade_frequencia,
          dificuldade_atividades
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        Number(usuarioId),
        ...perguntasIniciais.map(campo => respostas[campo])
      );

      await database.runAsync(
        `INSERT OR REPLACE INTO sessao
        (id, usuario_id, onboarding_concluido)
        VALUES (1, ?, 1);`,
        Number(usuarioId)
      );

      console.log('QUESTIONÁRIO SALVO:', respostas);
      setQuestionarioConcluido(true);

    } catch (error) {
      console.error('Erro ao salvar questionário:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar o questionário.'
      );
    }
  };

  // ==========================================
  // PRÓXIMA ETAPA
  // ==========================================

  const proximaEtapa = () => {
    if (!etapaCompleta()) {
      Alert.alert(
        'Responda todas as perguntas',
        'Escolha uma opção antes de continuar.'
      );
      return;
    }

    if (etapa < etapas.length - 1) {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      setEtapa(prev => prev + 1);
    } else {
      finalizarQuestionario();
    }
  };

  // ==========================================
  // ANIMAÇÕES DOS ELEMENTOS DECORATIVOS
  // ==========================================

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

  // ==========================================
  // FUNDO DECORATIVO
  // ==========================================

  const elementosDecorativos = (
    <View
      pointerEvents="none"
      style={styles.backgroundDecorations}
    >
      <Animated.View
        style={[
          styles.arc,
          styles.arcOne,
          {
            transform: [
              { translateX: moveArc1 },
              { rotate: '18deg' },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.arc,
          styles.arcTwo,
          {
            transform: [
              { translateX: moveArc2 },
              { rotate: '-20deg' },
            ],
          },
        ]}
      />

      <Animated.View
        style={[
          styles.arc,
          styles.arcThree,
          {
            transform: [
              { translateX: moveArc3 },
              { rotate: '12deg' },
            ],
          },
        ]}
      />

      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <View style={styles.glowThree} />
    </View>
  );

  // ==========================================
  // TELA DE CONCLUSÃO
  // ==========================================

  if (questionarioConcluido) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={GRADIENT}
          locations={[0, 0.25, 0.52, 0.78, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {elementosDecorativos}

        <View style={styles.safeArea}>
          <NavbarSuperior insets={insets} />

          <View style={styles.conclusaoContainer}>
            <View style={styles.sucessoCirculo}>
              <Ionicons
                name="checkmark"
                size={58}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.conclusaoTitulo}>
              TUDO PRONTO!
            </Text>

            <Text style={styles.conclusaoTexto}>
              Seu cadastro foi concluído com sucesso.
            </Text>

            <Text style={styles.conclusaoTextoSecundario}>
              Suas informações foram registradas e o Sunny Health está pronto
              para acompanhar sua rotina.
            </Text>

            <View style={styles.conclusaoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={25}
                color="#55B878"
              />

              <Text style={styles.conclusaoCardTexto}>
                Seus dados foram salvos com segurança neste dispositivo.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.botaoEntrar}
              activeOpacity={0.85}
              onPress={() => router.replace('/batisono')}
            >
              <Text style={styles.botaoEntrarTexto}>
                ENTRAR NO SUNNY HEALTH
              </Text>
            </TouchableOpacity>
          </View>

          <NavbarInferior insets={insets} />
        </View>
      </View>
    );
  }

  // ==========================================
  // DADOS DA ETAPA ATUAL
  // ==========================================

  const dados = etapas[etapa];

  // ==========================================
  // TELA PRINCIPAL
  // ==========================================

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GRADIENT}
        locations={[0, 0.25, 0.52, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {elementosDecorativos}

      <View style={styles.safeArea}>

        {/* NAVBAR SUPERIOR */}
        <NavbarSuperior insets={insets} />

        {/* CONTEÚDO */}
        <View style={styles.content}>
          <View style={styles.topo}>
            <Text style={styles.contador}>
              {etapa + 1} de {etapas.length}
            </Text>
          </View>

          <View style={styles.iconeContainer}>
            <Ionicons
              name={dados.icone}
              size={42}
              color="#FFFFFF"
            />
          </View>

          <Text style={styles.titulo}>
            {dados.titulo}
          </Text>

          <Text style={styles.subtitulo}>
            {dados.subtitulo}
          </Text>

          <View style={styles.progressoContainer}>
            {etapas.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progresso,
                  i <= etapa && styles.progressoAtivo,
                ]}
              />
            ))}
          </View>

          <View style={styles.perguntasCard}>
            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {dados.perguntas.map(
                ([pergunta, campo, opcoes]) => (
                  <View
                    style={styles.pergunta}
                    key={campo}
                  >
                    <Text style={styles.perguntaTexto}>
                      {pergunta}
                    </Text>

                    <Opcoes
                      campo={campo}
                      valores={opcoes}
                      respostas={respostas}
                      responder={responder}
                    />
                  </View>
                )
              )}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.botao,
              !etapaCompleta() && styles.botaoDesativado,
            ]}
            activeOpacity={0.85}
            onPress={proximaEtapa}
          >
            <Text style={styles.botaoTexto}>
              {etapa === etapas.length - 1
                ? 'FINALIZAR'
                : 'CONTINUAR'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* NAVBAR INFERIOR */}
        <NavbarInferior insets={insets} />

      </View>
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================

const styles = StyleSheet.create({

  // ==========================================
  // ESTRUTURA PRINCIPAL
  // ==========================================

  container: {
    flex: 1,
    backgroundColor: '#FFF5B8',
    overflow: 'hidden',
  },

  safeArea: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    flexDirection: 'column',
    zIndex: 10,
    elevation: 10,
  },

// ==========================================
// NAVBAR SUPERIOR
// ==========================================

topSafeArea: {
  backgroundColor: 'rgba(255,255,255,0.92)',
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  zIndex: 20,
  elevation: 8,
  width: '100%',
  flexShrink: 0,
},

navbar: {
  minHeight: 75,
  width: '100%',
  paddingHorizontal: 20,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

botaoPerfil: {
  width: 55,
  height: 55,
  borderRadius: 18,
  backgroundColor: '#C9C3E6',
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 10,
},

// ==========================================
// NAVBAR INFERIOR
// ==========================================

bottomSafeArea: {
  backgroundColor: 'rgba(255,255,255,0.97)',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  paddingTop: 8,
  shadowColor: '#30364D',
  shadowOffset: { width: 0, height: -3 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 8,
  width: '100%',
  flexShrink: 0,
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
  backgroundColor: '#E9EDFA',
},

navTexto: {
  color: '#65708F',
  fontSize: 9,
  fontWeight: '600',
  textAlign: 'center',
},

navTextoAtivo: {
  color: '#30364D',
  fontWeight: '800',
},
  // ==========================================
  // CONTEÚDO PRINCIPAL
  // ==========================================

  content: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    zIndex: 1,
  },

  topo: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  contador: {
    fontSize: 15,
    fontWeight: '700',
    color: '#30364D',
  },

  iconeContainer: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: '#899EEB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 2,
    marginBottom: 10,
  },

  titulo: {
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '800',
    color: '#30364D',
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 15.5,
    lineHeight: 21,
    color: '#4D5570',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
  },

  // ==========================================
  // PROGRESSO
  // ==========================================

  progressoContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 6,
    marginBottom: 10,
  },

  progresso: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  progressoAtivo: {
    backgroundColor: '#FFFFFF',
  },

  // ==========================================
  // CARD DAS PERGUNTAS
  // ==========================================

  perguntasCard: {
    flex: 1,
    minHeight: 0,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 5,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 2,
    paddingBottom: 18,
  },

  pergunta: {
    marginBottom: 18,
  },

  perguntaTexto: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    color: '#30364D',
    marginBottom: 9,
  },

  // ==========================================
  // OPÇÕES
  // ==========================================

  opcoes: {
    gap: 7,
  },

  opcao: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#F4F5FA',
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  opcaoSelecionada: {
    backgroundColor: '#EEF1FF',
    borderColor: '#899EEB',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#899EEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  radioSelecionado: {
    borderColor: '#899EEB',
  },

  radioInterno: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#899EEB',
  },

  opcaoTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 19,
    color: '#30364D',
  },

  opcaoTextoSelecionado: {
    fontWeight: '700',
  },

  // ==========================================
  // BOTÃO CONTINUAR
  // ==========================================

  botao: {
    height: 58,
    flexShrink: 0,
    marginTop: 12,
    borderRadius: 17,
    backgroundColor: '#55B878',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 5,
  },

  botaoDesativado: {
    backgroundColor: '#AEB4C7',
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // ==========================================
  // TELA DE CONCLUSÃO
  // ==========================================

  conclusaoContainer: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 15,
  },

  sucessoCirculo: {
    width: 105,
    height: 105,
    borderRadius: 53,
    backgroundColor: '#55B878',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },

  conclusaoTitulo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#30364D',
    marginTop: 25,
    textAlign: 'center',
  },

  conclusaoTexto: {
    fontSize: 18,
    fontWeight: '700',
    color: '#30364D',
    textAlign: 'center',
    marginTop: 10,
  },

  conclusaoTextoSecundario: {
    fontSize: 15.5,
    lineHeight: 22,
    color: '#4D5570',
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 340,
  },

  conclusaoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginTop: 25,
    gap: 12,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  conclusaoCardTexto: {
    flex: 1,
    fontSize: 14.5,
    lineHeight: 20,
    color: '#4D5570',
    fontWeight: '600',
  },

  botaoEntrar: {
    width: '100%',
    height: 62,
    borderRadius: 18,
    backgroundColor: '#55B878',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  botaoEntrarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // ==========================================
  // FUNDO DECORATIVO
  // ==========================================

  backgroundDecorations: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    elevation: 0,
  },

  arc: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.20)',
    borderRadius: 300,
  },

  arcOne: {
    width: 480,
    height: 480,
    top: -210,
    right: -180,
  },

  arcTwo: {
    width: 390,
    height: 390,
    top: 180,
    left: -230,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  arcThree: {
    width: 600,
    height: 600,
    bottom: -350,
    right: -280,
    borderColor: 'rgba(255,255,255,0.17)',
  },

  glowOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: 70,
    right: -80,
  },

  glowTwo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,245,184,0.12)',
    bottom: 180,
    left: -70,
  },

  glowThree: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 420,
    right: 20,
  },

});
