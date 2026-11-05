
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const C = {
  branco: '#FFFFFF',
  texto: '#30364D',
  secundario: '#65708F',
  azul: '#5574B8',
  azulClaro: '#E9EDFA',
  verde: '#4B8B76',
  verdeClaro: '#E7F3EC',
  rosa: '#C65B69',
  rosaClaro: '#FBECEF',
  roxo: '#7A6BB5',
  borda: '#E7EAF4',
};

const dicasAlimentacao = [
  {
    imagem: require('../assets/images/alimento.png'),
    titulo: 'Tenha uma alimentação variada',
    descricao:
      'Inclua verduras, legumes, cereais integrais, proteínas e diferentes alimentos ao longo do dia. Uma alimentação equilibrada ajuda a manter a saúde e a disposição.',
    cor: '#4B8B76',
    fundo: '#E7F3EC',
    icone: 'restaurant-outline',
  },
  {
    imagem: require('../assets/images/kiwi.png'),
    titulo: 'Inclua frutas no dia a dia',
    descricao:
      'Kiwi, mamão, maçã e outras frutas fornecem fibras, vitaminas e minerais. As fibras e a ingestão adequada de líquidos podem ajudar no funcionamento intestinal.',
    cor: '#4B8B76',
    fundo: '#E7F3EC',
    icone: 'leaf-outline',
  },
  {
    imagem: require('../assets/images/laranja.png'),
    titulo: 'Lembre-se da hidratação',
    descricao:
      'Beba água regularmente ao longo do dia, conforme suas necessidades e orientações de saúde. A hidratação é importante para o funcionamento do organismo.',
    cor: '#C58A36',
    fundo: '#FFF1D9',
    icone: 'water-outline',
  },
];

const dicasExercicios = [
  {
    imagem: require('../assets/images/alongamento.jpg'),
    titulo: 'Faça alongamentos com cuidado',
    descricao:
      'Movimentos suaves podem ajudar a trabalhar a flexibilidade e a mobilidade. Faça os exercícios respeitando seus limites e, se necessário, com orientação de um fisioterapeuta.',
    cor: '#5574B8',
    fundo: '#E9EDFA',
    icone: 'body-outline',
  },
  {
    imagem: require('../assets/images/musculos.jpg'),
    titulo: 'Trabalhe a força muscular',
    descricao:
      'Exercícios adaptados de fortalecimento podem contribuir para as atividades do cotidiano. A intensidade deve ser adequada à capacidade de cada pessoa.',
    cor: '#7A6BB5',
    fundo: '#F0EDFA',
    icone: 'fitness-outline',
  },
  {
    imagem: require('../assets/images/abraco.png'),
    titulo: 'Movimente-se com segurança',
    descricao:
      'Caminhadas orientadas, exercícios de equilíbrio e movimentos funcionais podem fazer parte da rotina. Escolha um ambiente seguro e peça ajuda se houver risco de quedas.',
    cor: '#C65B69',
    fundo: '#FBECEF',
    icone: 'walk-outline',
  },
];

function CartaoDica({ item, numero }) {
  return (
    <View style={styles.cardDica}>
      <Image
        source={item.imagem}
        style={styles.imagemDica}
        resizeMode="cover"
        accessibilityLabel={item.titulo}
      />

      <View style={styles.cardDicaConteudo}>
        <View style={styles.cardDicaCabecalho}>
          <View
            style={[
              styles.iconeDica,
              { backgroundColor: item.fundo },
            ]}
          >
            <Ionicons
              name={item.icone}
              size={21}
              color={item.cor}
            />
          </View>

          <View style={styles.numeroDica}>
            <Text style={styles.numeroDicaTexto}>
              DICA {numero}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDicaTitulo}>
          {item.titulo}
        </Text>

        <Text style={styles.cardDicaDescricao}>
          {item.descricao}
        </Text>
      </View>
    </View>
  );
}

export default function Dicas() {
  const insets = useSafeAreaInsets();

  const navegar = (rota) => router.push(rota);

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        {/* DECORAÇÃO DE FUNDO */}
        <View pointerEvents="none" style={styles.glowOne} />
        <View pointerEvents="none" style={styles.glowTwo} />

        {/* CABEÇALHO SUPERIOR */}
        <View
          style={[
            styles.topSafeArea,
            { paddingTop: insets.top },
          ]}
        >
          <View style={styles.navbar}>
            <TouchableOpacity
              style={styles.botaoPerfil}
              onPress={() => navegar('/config')}
              activeOpacity={0.8}
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
              onPress={() => navegar('/perfil')}
              activeOpacity={0.8}
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

        {/* CONTEÚDO DA TELA */}
        <View style={styles.conteudoPrincipal}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* TÍTULO */}
            <View style={styles.tituloPagina}>
              <Text style={styles.titulo}>
                Dicas de saúde
              </Text>

              <Text style={styles.subtituloPagina}>
                Pequenos cuidados diários podem contribuir
                para seu bem-estar e sua qualidade de vida.
              </Text>
            </View>

            {/* CARTÃO DE BOAS-VINDAS */}
            <View style={styles.cardBoasVindas}>
              <View style={styles.boasVindasTexto}>
                <Text style={styles.boasVindasTitulo}>
                  Cuide de você!
                </Text>

                <Text style={styles.boasVindasDescricao}>
                  Alimentação equilibrada, movimento e
                  momentos de bem-estar fazem parte do
                  cuidado com a saúde.
                </Text>
              </View>

              <Ionicons
                name="heart-circle"
                size={64}
                color="#C65B69"
              />
            </View>

            {/* SEÇÃO DE ALIMENTAÇÃO */}
            <View style={styles.secaoCabecalho}>
              <View
                style={[
                  styles.secaoIcone,
                  { backgroundColor: C.verdeClaro },
                ]}
              >
                <Ionicons
                  name="nutrition-outline"
                  size={24}
                  color={C.verde}
                />
              </View>

              <View style={styles.secaoTexto}>
                <Text style={styles.secaoTitulo}>
                  Alimentação saudável
                </Text>

                <Text style={styles.secaoDescricao}>
                  Nutrição e hidratação no dia a dia.
                </Text>
              </View>
            </View>

            {dicasAlimentacao.map((item, index) => (
              <CartaoDica
                key={item.titulo}
                item={item}
                numero={index + 1}
              />
            ))}

            {/* SEÇÃO DE EXERCÍCIOS */}
            <View style={styles.secaoCabecalho}>
              <View
                style={[
                  styles.secaoIcone,
                  { backgroundColor: C.azulClaro },
                ]}
              >
                <Ionicons
                  name="fitness-outline"
                  size={24}
                  color={C.azul}
                />
              </View>

              <View style={styles.secaoTexto}>
                <Text style={styles.secaoTitulo}>
                  Exercícios físicos
                </Text>

                <Text style={styles.secaoDescricao}>
                  Movimento adaptado às suas necessidades.
                </Text>
              </View>
            </View>

            {dicasExercicios.map((item, index) => (
              <CartaoDica
                key={item.titulo}
                item={item}
                numero={index + 1}
              />
            ))}

            {/* BEM-ESTAR */}
            <View style={styles.cardBemEstar}>
              <View style={styles.bemEstarIcone}>
                <Ionicons
                  name="heart-outline"
                  size={25}
                  color={C.rosa}
                />
              </View>

              <View style={styles.bemEstarConteudo}>
                <Text style={styles.bemEstarTitulo}>
                  Seu bem-estar também importa
                </Text>

                <Text style={styles.bemEstarDescricao}>
                  Mantenha contato com pessoas queridas,
                  respeite seu ritmo e reserve momentos
                  para atividades prazerosas.
                </Text>
              </View>

              <Image
                source={require('../assets/images/mental.png')}
                style={styles.imagemBemEstar}
                resizeMode="cover"
                accessibilityLabel="Pessoas compartilhando um abraço"
              />
            </View>

            {/* AVISO DE SEGURANÇA */}
            <View style={styles.cardAviso}>
              <View style={styles.iconeAviso}>
                <Ionicons
                  name="information-circle-outline"
                  size={25}
                  color={C.azul}
                />
              </View>

              <View style={styles.textoAvisoArea}>
                <Text style={styles.tituloAviso}>
                  Cada pessoa é única
                </Text>

                <Text style={styles.textoAviso}>
                  As necessidades variam de pessoa para
                  pessoa. Converse com a equipe de saúde
                  antes de iniciar ou modificar exercícios
                  e procure orientação nutricional quando
                  necessário. Se houver dificuldade para
                  engolir, procure avaliação profissional.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* NAVBAR INFERIOR — MESMA ESTRUTURA ORIGINAL */}
        <View
          style={[
            styles.bottomSafeArea,
            { paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.bottomBar}>
            {/* MONITORAMENTO */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/batisono')}
              activeOpacity={0.8}
              accessibilityLabel="Monitoramento"
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

            {/* QUESTIONÁRIO */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/questionario')}
              activeOpacity={0.8}
              accessibilityLabel="Questionário"
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

            {/* RELÓGIO */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/bluetooth')}
              activeOpacity={0.8}
              accessibilityLabel="Conexão do relógio"
            >
              <View style={styles.navIcon}>
                <Ionicons
                  name="bluetooth-outline"
                  size={23}
                  color={C.azul}
                />
              </View>

              <Text style={styles.navTexto}>
                Relógio
              </Text>
            </TouchableOpacity>

            {/* DICAS — ITEM ATIVO */}
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/dicas')}
              activeOpacity={0.8}
              accessibilityLabel="Dicas"
            >
              <View
                style={[
                  styles.navIcon,
                  styles.navIconAtivo,
                ]}
              >
                <Ionicons
                  name="book"
                  size={23}
                  color={C.texto}
                />
              </View>

              <Text
                style={[
                  styles.navTexto,
                  styles.navTextoAtivo,
                ]}
              >
                Dicas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#B8C5E8',
    opacity: 0.35,
  },

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

  conteudoPrincipal: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 18,
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

  subtituloPagina: {
    color: C.texto,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  cardBoasVindas: {
    backgroundColor: C.branco,
    borderRadius: 22,
    padding: 17,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  boasVindasTexto: {
    flex: 1,
  },

  boasVindasTitulo: {
    color: C.texto,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 7,
  },

  boasVindasDescricao: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 18,
  },

  imagemFeliz: {
    width: 100,
    height: 110,
    marginLeft: 8,
  },

  secaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 3,
    paddingHorizontal: 3,
  },

  secaoIcone: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  secaoTexto: {
    flex: 1,
  },

  secaoTitulo: {
    color: C.texto,
    fontSize: 17,
    fontWeight: '800',
  },

  secaoDescricao: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  cardDica: {
    backgroundColor: C.branco,
    borderRadius: 22,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  imagemDica: {
    width: '100%',
    height: 185,
    backgroundColor: '#F1F3F9',
  },

  cardDicaConteudo: {
    padding: 16,
  },

  cardDicaCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  iconeDica: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroDica: {
    backgroundColor: '#F1F3FA',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  numeroDicaTexto: {
    color: C.secundario,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  cardDicaTitulo: {
    color: C.texto,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 7,
  },

  cardDicaDescricao: {
    color: C.secundario,
    fontSize: 13,
    lineHeight: 20,
  },

  cardBemEstar: {
    backgroundColor: C.branco,
    borderRadius: 22,
    padding: 16,
    marginTop: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  bemEstarIcone: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: C.rosaClaro,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  bemEstarConteudo: {
    marginBottom: 13,
  },

  bemEstarTitulo: {
    color: C.texto,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 7,
  },

  bemEstarDescricao: {
    color: C.secundario,
    fontSize: 13,
    lineHeight: 20,
  },

  imagemBemEstar: {
    width: '100%',
    height: 170,
    borderRadius: 15,
    backgroundColor: '#F1F3F9',
  },

  cardAviso: {
    backgroundColor: '#F1F4FC',
    borderRadius: 19,
    padding: 15,
    marginTop: 3,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F7',
  },

  iconeAviso: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  textoAvisoArea: {
    flex: 1,
  },

  tituloAviso: {
    color: C.texto,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },

  textoAviso: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 18,
  },

  /* NAVBAR INFERIOR */

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
