import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Animated,Easing,Image,} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

export default function Introducao() {
  // ============================================================
  // ANIMAÇÃO DOS ARCOS
  // ============================================================

  const arc1 = useRef(new Animated.Value(0)).current;
  const arc2 = useRef(new Animated.Value(0)).current;
  const arc3 = useRef(new Animated.Value(0)).current;

  // ============================================================
  // ANIMAÇÃO DA LÂMPADA
  // ============================================================

  const lampScale = useRef(new Animated.Value(0.35)).current;
  const lampOpacity = useRef(new Animated.Value(0)).current;
  const [lampVisible, setLampVisible] = useState(false);

  // ============================================================
  // ANIMAÇÃO DO TÍTULO
  // ============================================================

  const titleTranslate = useRef(new Animated.Value(-80)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0.88)).current;
  const titleLineScale = useRef(new Animated.Value(0)).current;
  const titleLineOpacity = useRef(new Animated.Value(0)).current;

  // ============================================================
  // ANIMAÇÃO DA LOGO
  // ============================================================

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-1)).current;

  // ============================================================
  // ANIMAÇÃO DOS CARDS
  // ============================================================

  const cardTranslate = useRef(new Animated.Value(45)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const helpTranslate = useRef(new Animated.Value(45)).current;
  const helpOpacity = useRef(new Animated.Value(0)).current;

  const firstStepTranslate = useRef(new Animated.Value(45)).current;
  const firstStepOpacity = useRef(new Animated.Value(0)).current;

  // ============================================================
  // ANIMAÇÃO DO BOTÃO
  // ============================================================

  const stepsTranslate = useRef(new Animated.Value(30)).current;
  const stepsOpacity = useRef(new Animated.Value(0)).current;

  // ============================================================
  // INÍCIO DAS ANIMAÇÕES
  // ============================================================

  useEffect(() => {
    // ------------------------------------------------------------
    // ARCOS
    // ------------------------------------------------------------

    const animateArc = (
      animation,
      duration,
      delay = 0
    ) => {
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
    };

    animateArc(arc1, 9000);
    animateArc(arc2, 12000, 1000);
    animateArc(arc3, 15000, 2000);

    // ------------------------------------------------------------
    // TÍTULO
    // ------------------------------------------------------------

    Animated.parallel([
      Animated.timing(titleTranslate, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.timing(titleScale, {
          toValue: 1.06,
          duration: 550,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),

        Animated.spring(titleScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ------------------------------------------------------------
    // LINHA DO TÍTULO
    // ------------------------------------------------------------

    Animated.sequence([
      Animated.delay(550),

      Animated.parallel([
        Animated.timing(titleLineOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.spring(titleLineScale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ------------------------------------------------------------
    // LOGO
    // ------------------------------------------------------------

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.15,
          duration: 850,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),

        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(logoRotate, {
        toValue: 0,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // ------------------------------------------------------------
    // CARDS
    // ------------------------------------------------------------

    Animated.sequence([
      Animated.delay(750),

      // SOBRE O APLICATIVO
      Animated.parallel([
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(140),

      // COMO PODE AJUDAR
      Animated.parallel([
        Animated.timing(helpTranslate, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(helpOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(140),

      // PRIMEIRO PASSO
      Animated.parallel([
        Animated.timing(firstStepTranslate, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(firstStepOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(200),

      // BOTÃO
      Animated.parallel([
        Animated.timing(stepsTranslate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(stepsOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ============================================================
  // LÂMPADA
  // ============================================================

  const showLamp = () => {
    if (lampVisible) {
      return;
    }

    setLampVisible(true);

    lampScale.setValue(0.35);
    lampOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(lampScale, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),

      Animated.timing(lampOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ============================================================
  // SCROLL
  // ============================================================

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    if (scrollY > 20) {
      showLamp();
    }
  };

  // ============================================================
  // MOVIMENTO DOS ARCOS
  // ============================================================

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

  // ============================================================
  // ROTAÇÃO DA LOGO
  // ============================================================

  const logoRotation = logoRotate.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-360deg', '0deg'],
  });

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <View style={styles.container}>

      {/* FUNDO */}

      <LinearGradient
        colors={[
          '#899EEB',
          '#AAB9EF',
          '#C8CFED',
          '#E3E1D2',
          '#FFF5B8',
        ]}
        locations={[0, 0.25, 0.52, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ARCOS */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.arc,
          styles.arcOne,
          {
            transform: [
              {
                translateX: moveArc1,
              },
              {
                rotate: '18deg',
              },
            ],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.arc,
          styles.arcTwo,
          {
            transform: [
              {
                translateX: moveArc2,
              },
              {
                rotate: '-20deg',
              },
            ],
          },
        ]}
      />

      <Animated.View
        pointerEvents="none"
        style={[
          styles.arc,
          styles.arcThree,
          {
            transform: [
              {
                translateX: moveArc3,
              },
              {
                rotate: '12deg',
              },
            ],
          },
        ]}
      />

      {/* BRILHOS */}

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

      {/* CONTEÚDO */}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        {/* CABEÇALHO */}

        <View style={styles.header}>

          <View style={styles.titleRow}>

            {/* TÍTULO */}

            <View style={styles.titleContainer}>

              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: titleOpacity,
                    transform: [
                      {
                        translateX: titleTranslate,
                      },
                      {
                        scale: titleScale,
                      },
                    ],
                  },
                ]}
              >
                SUNNY
                {'\n'}
                HEALTH
              </Animated.Text>

              <Animated.View
                style={[
                  styles.titleLine,
                  {
                    opacity: titleLineOpacity,
                    transform: [
                      {
                        scaleX: titleLineScale,
                      },
                    ],
                  },
                ]}
              />

            </View>

            {/* LOGO */}

            <Animated.View
              style={[
                styles.appIconContainer,
                {
                  opacity: logoOpacity,
                  transform: [
                    {
                      scale: logoScale,
                    },
                    {
                      rotate: logoRotation,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../assets/images/Logo.png')}
                style={styles.appIcon}
              />
            </Animated.View>

          </View>

        </View>

        {/* SOBRE O APLICATIVO + NOSSO OBJETIVO */}

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [
                {
                  translateY: cardTranslate,
                },
              ],
            },
          ]}
        >

          <View style={styles.cardHeader}>

            <View style={styles.cardIcon}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#30364D"
              />
            </View>

            <Text style={styles.cardTitle}>
              BEM-VINDO AO SUNNY HEALTH
            </Text>

          </View>

          <Text style={styles.text}>
            O Sunny Health foi desenvolvido para auxiliar
            no monitoramento de sinais relacionados à
            doença de Parkinson.
          </Text>

          <Text style={styles.text}>
            A proposta é reunir informações importantes
            em um único lugar, tornando mais simples
            acompanhar os dados ao longo do tempo.
          </Text>

          {/* OBJETIVO */}

          <View style={styles.objectiveBox}>

            <Animated.View
              style={[
                styles.yellowCircle,
                {
                  opacity: lampOpacity,
                  transform: [
                    {
                      scale: lampScale,
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name="bulb-outline"
                size={48}
                color="#30364D"
              />
            </Animated.View>

            <View style={styles.objectiveContent}>

              <Text style={styles.objectiveTitle}>
                NOSSO OBJETIVO
              </Text>

              <Text style={styles.objectiveText}>
                Facilitar o acompanhamento da saúde por meio
                da tecnologia e da organização dos dados.
              </Text>

            </View>

          </View>

        </Animated.View>

        {/* COMO O SUNNY HEALTH PODE AJUDAR */}

        <Animated.View
          style={[
            styles.helpCard,
            {
              opacity: helpOpacity,
              transform: [
                {
                  translateY: helpTranslate,
                },
              ],
            },
          ]}
        >

          <Text style={styles.helpTitle}>
            COMO O SUNNY HEALTH PODE AJUDAR
          </Text>

          <Text style={styles.helpSubtitle}>
            Durante o uso do aplicativo, você poderá
            acompanhar diferentes informações relacionadas
            ao seu monitoramento.
          </Text>

          {/* ITEM 1 */}

          <View style={styles.featureItem}>

            <View style={styles.featureIcon}>
              <Ionicons
                name="pulse-outline"
                size={23}
                color="#30364D"
              />
            </View>

            <View style={styles.featureContent}>

              <Text style={styles.featureTitle}>
                BATIMENTOS
              </Text>

              <Text style={styles.featureText}>
                Visualize informações relacionadas aos
                seus batimentos cardíacos.
              </Text>

            </View>

          </View>

          {/* ITEM 2 */}

          <View style={styles.featureItem}>

            <View style={styles.featureIcon}>
              <Ionicons
                name="analytics-outline"
                size={23}
                color="#30364D"
              />
            </View>

            <View style={styles.featureContent}>

              <Text style={styles.featureTitle}>
                TREMOR
              </Text>

              <Text style={styles.featureText}>
                Acompanhe dados relacionados à intensidade
                dos tremores registrados.
              </Text>

            </View>

          </View>

          {/* ITEM 3 */}

          <View style={styles.featureItem}>

            <View style={styles.featureIcon}>
              <Ionicons
                name="moon-outline"
                size={23}
                color="#30364D"
              />
            </View>

            <View style={styles.featureContent}>

              <Text style={styles.featureTitle}>
                SONO
              </Text>

              <Text style={styles.featureText}>
                Consulte informações sobre a qualidade
                e o acompanhamento do sono.
              </Text>

            </View>

          </View>

        </Animated.View>

        {/* PRIMEIRO PASSO */}

        <Animated.View
          style={[
            styles.techCard,
            {
              opacity: firstStepOpacity,
              transform: [
                {
                  translateY: firstStepTranslate,
                },
              ],
            },
          ]}
        >

          <View style={styles.techHeader}>

            <View style={styles.techIcon}>
              <Ionicons
                name="person-add-outline"
                size={23}
                color="#30364D"
              />
            </View>

            <Text style={styles.techTitle}>
              PRIMEIRO PASSO
            </Text>

          </View>

          <Text style={styles.techText}>
            Para começar a utilizar o Sunny Health,
            crie sua conta e configure seu acesso ao
            aplicativo.
          </Text>

          <View style={styles.instructionBox}>

            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#FFF5B8"
            />

            <Text style={styles.instructionText}>
              Toque em{' '}

              <Text style={styles.boldText}>
                CONTINUAR
              </Text>{' '}

              para começar seu cadastro.
            </Text>

          </View>

        </Animated.View>

        {/* BOTÃO */}

        <Animated.View
          style={[
            styles.stepsContainer,
            {
              opacity: stepsOpacity,
              transform: [
                {
                  translateY: stepsTranslate,
                },
              ],
            },
          ]}
        >

          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.85}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={styles.nextButtonText}>
              CONTINUAR
            </Text>
          </TouchableOpacity>

        </Animated.View>

      </ScrollView>

    </View>
  );
}

// ================================================================
// ESTILOS
// ================================================================

const styles = StyleSheet.create({

  // ==============================================================
  // CONTAINER
  // ==============================================================

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 40,
  },

  // ==============================================================
  // ARCOS
  // ==============================================================

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

  // ==============================================================
  // BRILHOS
  // ==============================================================

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

  // ==============================================================
  // CABEÇALHO
  // ==============================================================

  header: {
    marginBottom: 15,
  },

  titleRow: {
    position: 'relative',
    minHeight: 270,
  },

  titleContainer: {
    position: 'absolute',
    left: 0,
    top: 75,
  },

  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  titleLine: {
    width: 95,
    height: 3,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
  },

  // ==============================================================
  // LOGO
  // ==============================================================

  appIconContainer: {
    position: 'absolute',
    right: -45,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  appIcon: {
    width: 255,
    height: 255,
    borderRadius: 22,
    resizeMode: 'contain',
  },

  // ==============================================================
  // SOBRE O APLICATIVO
  // ==============================================================

  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#E3E7FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  cardTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#30364D',
    lineHeight: 25,
  },

  text: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4B5268',
    marginBottom: 12,
  },

  // ==============================================================
  // OBJETIVO
  // ==============================================================

  objectiveBox: {
    position: 'relative',
    marginTop: 4,
    padding: 17,
    paddingRight: 105,
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: '#FFF5B8',
    overflow: 'hidden',
  },

  objectiveContent: {
    width: '100%',
  },

  objectiveTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4B5268',
    marginBottom: 7,
  },

  objectiveText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5268',
  },

  yellowCircle: {
    position: 'absolute',
    right: -15,
    bottom: -20,
    width: 105,
    height: 105,
    borderRadius: 100,
    backgroundColor: '#F0D060',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==============================================================
  // COMO O SUNNY HEALTH PODE AJUDAR
  // ==============================================================

  helpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 3,
  },

  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#30364D',
    marginBottom: 9,
  },

  helpSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5268',
    marginBottom: 18,
  },

  // ==============================================================
  // ITENS DE RECURSOS
  // ==============================================================

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#AAB9EF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#30364D',
    marginBottom: 3,
  },

  featureText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5268',
  },

  // ==============================================================
  // PRIMEIRO PASSO
  // ==============================================================

  techCard: {
    backgroundColor: '#88B8F3',
    borderRadius: 20,
    padding: 22,
    marginBottom: 25,
    shadowColor: '#30364D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },

  techHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  techIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0D060',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  techTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#30364D',
  },

  techText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#4B5268',
    marginBottom: 16,
  },

  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(48,54,77,0.16)',
    borderRadius: 14,
    padding: 13,
  },

  instructionText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 13,
    lineHeight: 19,
    color: '#FFFFFF',
  },

  boldText: {
    fontWeight: '700',
    color: '#FFF5B8',
  },

  // ==============================================================
  // BOTÃO
  // ==============================================================

  stepsContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },

  nextButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#F0D060',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F9FAFF',
    letterSpacing: 1,
    marginRight: 10,
    textShadowColor: '#30364D',
    textShadowOffset: {
      width: 2,
      height: 2,
    },
    textShadowRadius: 0,
  },
});


