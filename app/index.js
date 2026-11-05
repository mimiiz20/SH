import {StyleSheet,Text,View,TouchableOpacity,Animated,Easing,Image,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWindowDimensions } from 'react-native';

import {initializeDatabase,getDatabase,resetDatabaseForDevelopment,} from '../database/database';

export default function Index() {

  // ANIMAÇÕES

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(-1)).current;

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(1.08)).current;

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(40)).current;

  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;

  const [transitioning, setTransitioning] = useState(false);
  const [onboardingConcluido, setOnboardingConcluido] = useState(false);
  const [verificandoBanco, setVerificandoBanco] = useState(true);

  // VERIFICA O PRIMEIRO ACESSO

  useEffect(() => {
    const verificarPrimeiroAcesso = async () => {
      try {
        await initializeDatabase();

        const database = await getDatabase();

        const resultado = await database.getFirstAsync(`
          SELECT onboarding_concluido
          FROM sessao
          WHERE id = 1
          LIMIT 1;
        `);

setOnboardingConcluido(false);
      } catch (error) {
        console.error(
          'Erro ao verificar primeiro acesso:',
          error
        );

        setOnboardingConcluido(false);
      } finally {
        setVerificandoBanco(false);
      }
    };

    verificarPrimeiroAcesso();
  }, []);

  // ANIMAÇÃO INICIAL

  useEffect(() => {
    // Imagem
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Logo
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.15,
          duration: 700,
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
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Texto
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Botão
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // ROTAÇÃO DA LOGO

  const logoRotation = logoRotate.interpolate({
    inputRange: [-1, 0],
    outputRange: ['-360deg', '0deg'],
  });

  // ENTRADA NO APLICATIVO

  const entrarNoApp = () => {
    if (transitioning || verificandoBanco) return;

    setTransitioning(true);

    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1.3,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1.12,
        duration: 500,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onboardingConcluido) {
        router.replace('/batisono');
      } else {
        router.push('/introducao');
      }
    });
  };

  // INTERFACE

  return (
    <View style={styles.container}>

      {/* IMAGEM DE FUNDO */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/images/Inicio.png')}
          style={styles.backgroundImage}
        />
      </Animated.View>

      {/* GRADIENTES */}
      <View style={styles.gradientContainer}>

        <LinearGradient
          colors={[
            'rgba(75, 88, 117, 0.62)',
            'rgba(75, 88, 117, 0.28)',
            'rgba(75, 88, 117, 0.08)',
            'rgba(75, 88, 117, 0.35)',
          ]}
          locations={[0, 0.28, 0.58, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            'rgba(243, 217, 130, 0.42)',
            'rgba(243, 217, 130, 0.18)',
            'rgba(243, 217, 130, 0.05)',
            'rgba(243, 217, 130, 0)',
          ]}
          locations={[0, 0.25, 0.5, 0.8]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0.75 }}
          style={styles.gradient}
          pointerEvents="none"
        />

        <LinearGradient
          colors={[
            'rgba(48, 54, 77, 0)',
            'rgba(48, 54, 77, 0.06)',
            'rgba(48, 54, 77, 0.25)',
            'rgba(48, 54, 77, 0.55)',
            'rgba(48, 54, 77, 0.82)',
          ]}
          locations={[0, 0.3, 0.52, 0.72, 1]}
          style={styles.gradient}
          pointerEvents="none"
        />

      </View>

      {/* LOGO */}
      <Animated.View
        style={[
          styles.logoCorner,
          {
            opacity: logoOpacity,
            transform: [
              { scale: logoScale },
              { rotate: logoRotation },
            ],
          },
        ]}
      >
        <Image
          source={require('../assets/images/Logo.png')}
          style={styles.logo}
        />
      </Animated.View>

      {/* CONTEÚDO */}
      <View style={styles.content}>

        {/* TEXTO */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: contentOpacity,
              transform: [
                { translateY: contentTranslate },
              ],
            },
          ]}
        >
          <Text style={styles.welcome}>
            Bem-vindo(a)!
          </Text>

          <Text style={styles.title}>
            SUNNY HEALTH
          </Text>

          <View style={styles.titleLine} />

          <Text style={styles.description}>
            Tecnologia e cuidado para acompanhar
            sua saúde de forma simples,
            tranquila e acessível.
          </Text>
        </Animated.View>

        {/* BOTÃO */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={entrarNoApp}
            disabled={transitioning || verificandoBanco}
          >
            <Text style={styles.buttonText}>
              CONTINUAR
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({

  // Fundo
  container: {
    flex: 1,
    backgroundColor: '#4B5875',
    overflow: 'hidden',
  },

  // Imagem
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Gradientes
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // Logo
  logoCorner: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 165,
    height: 165,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },

  logo: {
    width: 155,
    height: 155,
    resizeMode: 'contain',
  },

  // Conteúdo inferior
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 28,
    paddingBottom: 90,
    alignItems: 'center',
    zIndex: 10,
  },

  // Container branco dos textos
  textContainer: {
    width: '100%',
    alignItems: 'center',

    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    borderRadius: 28,

    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 28,

    shadowColor: '#4B5875',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 5,
  },

  // Título principal
  welcome: {
    fontSize: 40,
    fontWeight: '800',
    color: '#4B5875',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Nome do aplicativo
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#5F9FC2',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginTop: 6,
  },

  // Linha decorativa
  titleLine: {
    width: 80,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#F3D982',
    marginTop: 14,
    marginBottom: 18,
  },

  // Descrição
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: '#5E667D',
    textAlign: 'center',
    maxWidth: 350,
  },

  // Botão
  buttonContainer: {
    width: '100%',
  },

  button: {
    width: '100%',
    height: 62,
    borderRadius: 18,

    backgroundColor: '#E6C968',

    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: '#4B5875',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.20,
    shadowRadius: 9,
    elevation: 6,
  },

  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },
});