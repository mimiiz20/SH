import {StyleSheet,Text,View,ScrollView,TouchableOpacity,Animated,Easing,TextInput,Pressable,} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {initializeDatabase,getDatabase,} from '../database/database';

export default function Cadastro() {

  // DADOS DO USUÁRIO

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // TERMOS E PRIVACIDADE

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);

  // ANIMAÇÃO DOS ARCOS
  // ============================================================

  const arc1 = useRef(new Animated.Value(0)).current;
  const arc2 = useRef(new Animated.Value(0)).current;
  const arc3 = useRef(new Animated.Value(0)).current;

  // ============================================================
  // ANIMAÇÃO DO TÍTULO
  // ============================================================

  const titleTranslate = useRef(
    new Animated.Value(-80)
  ).current;

  const titleOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const titleScale = useRef(
    new Animated.Value(0.88)
  ).current;

  // ============================================================
  // ANIMAÇÃO DO CARD
  // ============================================================

  const cardTranslate = useRef(
    new Animated.Value(45)
  ).current;

  const cardOpacity = useRef(
    new Animated.Value(0)
  ).current;

  // ============================================================
  // INICIALIZAÇÃO DO BANCO
  // ============================================================

  useEffect(() => {

    const prepararBanco = async () => {

      try {

        await initializeDatabase();

      } catch (error) {

        console.error(
          'Erro ao inicializar banco:',
          error
        );

      }

    };

    prepararBanco();

  }, []);

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
    // CARD
    // ------------------------------------------------------------

    Animated.parallel([

      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 700,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

    ]).start();

  }, []);

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
  // CADASTRAR USUÁRIO
  // ============================================================

  const cadastrarUsuario = async () => {

    try {

      // ----------------------------------------------------------
      // VALIDAÇÃO DOS CAMPOS
      // ----------------------------------------------------------

      if (
        !nome.trim() ||
        !email.trim() ||
        !senha.trim()
      ) {

        alert('Preencha todos os campos.');

        return;
      }

      // ----------------------------------------------------------
      // PEGA O BANCO
      // ----------------------------------------------------------

      const database = await getDatabase();

      // ----------------------------------------------------------
      // CADASTRA O USUÁRIO
      // ----------------------------------------------------------

      const resultado = await database.runAsync(

        `INSERT INTO usuarios
         (nome, email, senha)
         VALUES (?, ?, ?);`,

        nome.trim(),

        email
          .trim()
          .toLowerCase(),

        senha

      );

      // ----------------------------------------------------------
      // PEGA O ID DO USUÁRIO CRIADO
      // ----------------------------------------------------------

      const usuarioId =
        resultado.lastInsertRowId;

      console.log(
        'Usuário cadastrado com sucesso!'
      );

      console.log(
        'ID do usuário:',
        usuarioId
      );

      // ----------------------------------------------------------
      // CRIA A SESSÃO
      // ----------------------------------------------------------
      //
      // onboarding_concluido = 0
      //
      // Isso significa:
      //
      // "O usuário acabou de se cadastrar,
      // mas ainda não terminou as etapas iniciais."
      //
      // ----------------------------------------------------------

      await database.runAsync(

        `INSERT OR REPLACE INTO sessao
         (id, usuario_id, onboarding_concluido)
         VALUES (1, ?, 0);`,

        Number(usuarioId)

      );

      console.log(
        'Sessão criada com sucesso!'
      );

      console.log(
        'Onboarding ainda não concluído.'
      );

      // ----------------------------------------------------------
      // VAI PARA O RELÓGIO
      // ----------------------------------------------------------
      //
      // O usuarioId é enviado para o relogio.js
      // para que ele continue pertencendo
      // ao mesmo usuário.
      //
      // ----------------------------------------------------------

      router.push({

        pathname: '/quest',

        params: {
          usuarioId: String(usuarioId),
        },

      });

    } catch (error) {

      console.error(
        'Erro ao cadastrar usuário:',
        error
      );

      // ----------------------------------------------------------
      // E-MAIL JÁ EXISTENTE
      // ----------------------------------------------------------

      if (
        error.message?.includes('UNIQUE')
      ) {

        alert(
          'Este e-mail já está cadastrado.'
        );

      } else {

        alert(
          'Não foi possível realizar o cadastro.'
        );

      }

    }

  };

  // ============================================================
  // INTERFACE
  // ============================================================

  return (

    <View style={styles.container}>

      {/* ========================================================
          FUNDO
      ======================================================== */}

      <LinearGradient
        colors={[
          '#899EEB',
          '#AAB9EF',
          '#C8CFED',
          '#E3E1D2',
          '#FFF5B8',
        ]}
        locations={[
          0,
          0.25,
          0.52,
          0.78,
          1,
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={StyleSheet.absoluteFill}
      />

      {/* ========================================================
          ARCOS
      ======================================================== */}

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

      {/* ========================================================
          CONTEÚDO
      ======================================================== */}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* ======================================================
            TÍTULO
        ====================================================== */}

        <Animated.View
          style={{
            opacity: titleOpacity,

            transform: [

              {
                translateX: titleTranslate,
              },

              {
                scale: titleScale,
              },

            ],
          }}
        >

          <Text style={styles.title}>
            CADASTRO
          </Text>

        </Animated.View>

        <Text style={styles.text}>
          Informe seus dados
        </Text>

        {/* ======================================================
            CARD
        ====================================================== */}

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

          {/* ====================================================
              NOME
          ==================================================== */}

          <Text style={styles.cardInfo}>
            NOME
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor="#999"
            value={nome}
            onChangeText={setNome}
          />

          {/* ====================================================
              EMAIL
          ==================================================== */}

          <Text style={styles.cardInfo}>
            EMAIL
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* ====================================================
              SENHA
          ==================================================== */}

          <Text style={styles.cardInfo}>
            SENHA
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />

          {/* ====================================================
              PRIVACIDADE
          ==================================================== */}

          <View style={styles.privacyContainer}>

            {/* --------------------------------------------------
                TERMOS
            -------------------------------------------------- */}

            <Pressable
              style={styles.checkRow}
              onPress={() =>
                setAceitouTermos(
                  !aceitouTermos
                )
              }
            >

              <View
                style={[
                  styles.checkbox,
                  aceitouTermos &&
                    styles.checkboxChecked,
                ]}
              >

                {aceitouTermos && (

                  <Text style={styles.check}>
                    ✓
                  </Text>

                )}

              </View>

              <Text style={styles.privacyText}>
                Li e concordo com os Termos de Uso.
              </Text>

            </Pressable>

            {/* --------------------------------------------------
                PRIVACIDADE
            -------------------------------------------------- */}

            <Pressable
              style={styles.checkRow}
              onPress={() =>
                setAceitouPrivacidade(
                  !aceitouPrivacidade
                )
              }
            >

              <View
                style={[
                  styles.checkbox,
                  aceitouPrivacidade &&
                    styles.checkboxChecked,
                ]}
              >

                {aceitouPrivacidade && (

                  <Text style={styles.check}>
                    ✓
                  </Text>

                )}

              </View>

              <Text style={styles.privacyText}>
                Li e concordo com a Política de Privacidade.
              </Text>

            </Pressable>

          </View>

          {/* ====================================================
              BOTÃO CONTINUAR
          ==================================================== */}

          <TouchableOpacity
            style={[
              styles.nextButton,

              (!aceitouTermos ||
                !aceitouPrivacidade) &&
                styles.nextButtonDisabled,
            ]}
            activeOpacity={0.85}
            disabled={
              !aceitouTermos ||
              !aceitouPrivacidade
            }
            onPress={cadastrarUsuario}
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

// =================================================================
// ESTILOS
// =================================================================

const styles = StyleSheet.create({

  // ===============================================================
  // CONTAINER
  // ===============================================================

  container: {
    flex: 1,
    overflow: 'hidden',
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },

  // ===============================================================
  // ARCOS
  // ===============================================================

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

  // ===============================================================
  // TÍTULO
  // ===============================================================

  title: {
    fontSize: 45,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 15,
  },

  text: {
    fontSize: 20,
    color: '#30364D',
    marginBottom: 30,
  },

  // ===============================================================
  // CARD
  // ===============================================================

  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 20,
    padding: 24,

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },

  cardInfo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#30364D',
    marginBottom: 14,
  },

  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5F6FA',
    borderWidth: 1,
    borderColor: '#D8DCF0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#30364D',
    marginBottom: 18,
  },

  // ===============================================================
  // PRIVACIDADE
  // ===============================================================

  privacyContainer: {
    width: '100%',
    marginTop: 5,
    marginBottom: 20,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#899EEB',
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#899EEB',
  },

  check: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  privacyText: {
    flex: 1,
    fontSize: 13,
    color: '#555B72',
    lineHeight: 19,
  },

  // ===============================================================
  // BOTÃO
  // ===============================================================

  nextButton: {
    width: '100%',
    height: 64,
    backgroundColor: '#F0D060',
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nextButtonDisabled: {
    backgroundColor: '#B8BDD0',
    opacity: 1,
  },

  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // ===============================================================
  // DIVISOR
  // ===============================================================

  dividerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 18,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9DCE8',
  },

  dividerText: {
    marginHorizontal: 12,
    color: '#8A8FA3',
    fontSize: 12,
    fontWeight: '600',
  },

  // ===============================================================
  // GOOGLE
  // ===============================================================

  googleButton: {
    width: '100%',
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9DCE8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleIcon: {
    fontSize: 19,
    fontWeight: '700',
    color: '#4285F4',
    marginRight: 10,
  },

  googleButtonText: {
    color: '#30364D',
    fontSize: 14,
    fontWeight: '700',
  },

  // ===============================================================
  // BOLINHAS
  // ===============================================================

  pageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },

  pageDot: {
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.45,
    shadowRadius: 4,
    elevation: 4,

    borderWidth: 1,
    borderColor: 'rgba(48,54,77,0.25)',
  },

  pageDotActive: {
    width: 17,
    height: 17,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',

    shadowColor: '#30364D',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.55,
    shadowRadius: 5,
    elevation: 5,

    borderWidth: 2,
    borderColor: 'rgba(48,54,77,0.30)',
  },

  // ===============================================================
  // RODAPÉ
  // ===============================================================

  footer: {
    textAlign: 'center',
    color: '#FFFFFF',
    opacity: 0.75,
    fontSize: 12,
  },

});