
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import {
  initializeDatabase,
  buscarEpisodiosMovimento,
  buscarResumoEpisodiosMovimento,
} from '../database/database';

// ==========================================
// CORES
// ==========================================

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

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatarData(data) {
  if (!data) return 'Data não informada';

  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return String(data);
  }

  return valor.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarValor(valor, casas = 2) {
  if (valor === null || valor === undefined || valor === '') {
    return '--';
  }

  const numero = Number(valor);

  return Number.isFinite(numero)
    ? numero.toFixed(casas).replace('.', ',')
    : '--';
}

function formatarDuracao(duracaoMs) {
  const segundos = Math.max(0, Number(duracaoMs) || 0) / 1000;

  if (segundos < 60) {
    return `${segundos.toFixed(0)} segundos`;
  }

  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = Math.floor(segundos % 60);

  if (minutos < 60) {
    return `${minutos} min ${segundosRestantes} s`;
  }

  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;

  return `${horas} h ${minutosRestantes} min`;
}

function formatarRegularidade(valor) {
  if (valor === null || valor === undefined) {
    return '--';
  }

  const numero = Number(valor);

  if (!Number.isFinite(numero)) return '--';

  return `${Math.round(numero * 100)}%`;
}

// ==========================================
// COMPONENTE: INDICADOR
// ==========================================

function CartaoIndicador({
  titulo,
  valor,
  unidade,
  descricao,
  icone,
  cor,
  fundo,
}) {
  return (
    <View style={styles.indicadorCard}>
      <View style={[styles.indicadorIcone, { backgroundColor: fundo }]}>
        <Ionicons name={icone} size={22} color={cor} />
      </View>

      <Text style={styles.indicadorTitulo}>
        {titulo}
      </Text>

      <View style={styles.indicadorValorLinha}>
        <Text style={styles.indicadorValor}>
          {valor}
        </Text>

        {!!unidade && (
          <Text style={styles.indicadorUnidade}>
            {unidade}
          </Text>
        )}
      </View>

      {!!descricao && (
        <Text style={styles.indicadorDescricao}>
          {descricao}
        </Text>
      )}
    </View>
  );
}

// ==========================================
// COMPONENTE: EPISÓDIO
// ==========================================

function CartaoEpisodio({ episodio, indice }) {
  return (
    <View style={styles.cartaoEpisodio}>
      <View style={styles.episodioCabecalho}>
        <View style={styles.episodioNumero}>
          <Text style={styles.episodioNumeroTexto}>
            {indice}
          </Text>
        </View>

        <View style={styles.episodioInformacoes}>
          <Text style={styles.episodioTitulo}>
            Episódio de movimento
          </Text>

          <Text style={styles.episodioData}>
            {formatarData(episodio.inicio_em)}
          </Text>
        </View>

        <View style={styles.episodioIcone}>
          <Ionicons
            name="activity-outline"
            size={21}
            color={C.azul}
          />
        </View>
      </View>

      <View style={styles.divisor} />

      <View style={styles.episodioLinha}>
        <View style={styles.episodioDado}>
          <Ionicons name="time-outline" size={17} color={C.azul} />
          <Text style={styles.episodioLabel}>Duração</Text>
          <Text style={styles.episodioValor}>
            {formatarDuracao(episodio.duracao_ms)}
          </Text>
        </View>

        <View style={styles.episodioDado}>
          <Ionicons name="pulse-outline" size={17} color={C.roxo} />
          <Text style={styles.episodioLabel}>Frequência</Text>
          <Text style={styles.episodioValor}>
            {episodio.frequencia_hz != null
              ? `${formatarValor(episodio.frequencia_hz)} Hz`
              : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.episodioLinha}>
        <View style={styles.episodioDado}>
          <Ionicons name="analytics-outline" size={17} color={C.verde} />
          <Text style={styles.episodioLabel}>Regularidade</Text>
          <Text style={styles.episodioValor}>
            {formatarRegularidade(episodio.regularidade)}
          </Text>
        </View>

        <View style={styles.episodioDado}>
          <Ionicons name="bar-chart-outline" size={17} color={C.rosa} />
          <Text style={styles.episodioLabel}>Amostras</Text>
          <Text style={styles.episodioValor}>
            {episodio.quantidade_amostras ?? '--'}
          </Text>
        </View>
      </View>

      {episodio.classificacao && (
        <View style={styles.classificacao}>
          <Text style={styles.classificacaoTexto}>
            Classificação: {episodio.classificacao}
          </Text>
        </View>
      )}
    </View>
  );
}

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function Relatorio() {
  const insets = useSafeAreaInsets();

  const [episodios, setEpisodios] = useState([]);
  const [resumo, setResumo] = useState({
    quantidade: 0,
    duracao_total_ms: 0,
    frequencia_media: null,
    amplitude_media: null,
    ultimo_episodio: null,
  });

  const [carregando, setCarregando] = useState(true);
  const [erroBanco, setErroBanco] = useState(false);

  const navegar = rota => router.push(rota);

  // ==========================================
  // CARREGAR DADOS DO BANCO
  // ==========================================

  const atualizarRelatorio = useCallback(async () => {
    try {
      await initializeDatabase();

      const [lista, dadosResumo] = await Promise.all([
        buscarEpisodiosMovimento(1000),
        buscarResumoEpisodiosMovimento(),
      ]);

      setEpisodios(lista || []);

      setResumo(
        dadosResumo || {
          quantidade: 0,
          duracao_total_ms: 0,
          frequencia_media: null,
          amplitude_media: null,
          ultimo_episodio: null,
        }
      );

      setErroBanco(false);
    } catch (error) {
      console.error(
        'Erro ao carregar relatório:',
        error?.message || error
      );

      setErroBanco(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      const carregar = async () => {
        setCarregando(true);

        try {
          await initializeDatabase();

          const [lista, dadosResumo] = await Promise.all([
            buscarEpisodiosMovimento(1000),
            buscarResumoEpisodiosMovimento(),
          ]);

          if (!ativo) return;

          setEpisodios(lista || []);

          setResumo(
            dadosResumo || {
              quantidade: 0,
              duracao_total_ms: 0,
              frequencia_media: null,
              amplitude_media: null,
              ultimo_episodio: null,
            }
          );

          setErroBanco(false);
        } catch (error) {
          console.error('Erro ao carregar relatório:', error);

          if (ativo) {
            setErroBanco(true);
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      };

      carregar();

      return () => {
        ativo = false;
      };
    }, [])
  );

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <View pointerEvents="none" style={styles.glowOne} />
        <View pointerEvents="none" style={styles.glowTwo} />

        {/* NAVBAR SUPERIOR */}

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

        <View style={styles.conteudoPrincipal}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* TÍTULO */}

            <View style={styles.tituloPagina}>
              <Text style={styles.titulo}>
                Relatório completo
              </Text>

              <Text style={styles.subtituloPagina}>
                Acompanhe o histórico e os indicadores de movimentação
                registrados pela pulseira Apollo.
              </Text>
            </View>

            {/* RESUMO GERAL */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeResumo]}>
                  <Ionicons
                    name="document-text-outline"
                    size={27}
                    color={C.azul}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Resumo geral
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Indicadores acumulados dos registros realizados.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.botaoAtualizar}
                  onPress={() => {
                    setCarregando(true);
                    atualizarRelatorio();
                  }}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={21}
                    color={C.azul}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.statusConexao}>
                <Ionicons
                  name={
                    erroBanco
                      ? 'alert-circle-outline'
                      : 'checkmark-circle-outline'
                  }
                  size={19}
                  color={erroBanco ? C.rosa : C.verde}
                />

                <Text style={styles.statusConexaoTexto}>
                  {erroBanco
                    ? 'Erro ao consultar os registros'
                    : 'Dados armazenados no banco de dados'}
                </Text>
              </View>

              {carregando ? (
                <View style={styles.estadoCarregando}>
                  <ActivityIndicator size="small" color={C.azul} />
                  <Text style={styles.textoAguardando}>
                    Carregando indicadores...
                  </Text>
                </View>
              ) : erroBanco ? (
                <View style={styles.estadoVazio}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={34}
                    color={C.rosa}
                  />

                  <Text style={styles.estadoVazioTitulo}>
                    Não foi possível carregar os dados
                  </Text>

                  <TouchableOpacity
                    style={styles.botaoSecundario}
                    onPress={() => {
                      setCarregando(true);
                      atualizarRelatorio();
                    }}
                  >
                    <Text style={styles.botaoSecundarioTexto}>
                      Tentar novamente
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.indicadoresGrade}>
                  <CartaoIndicador
                    titulo="Episódios"
                    valor={String(resumo.quantidade ?? 0)}
                    descricao="Total de registros salvos"
                    icone="pulse-outline"
                    cor={C.azul}
                    fundo={C.azulClaro}
                  />

                  <CartaoIndicador
                    titulo="Tempo total"
                    valor={formatarDuracao(resumo.duracao_total_ms)}
                    descricao="Duração acumulada"
                    icone="timer-outline"
                    cor={C.roxo}
                    fundo="#F0EDFA"
                  />

                  <CartaoIndicador
                    titulo="Frequência média"
                    valor={formatarValor(resumo.frequencia_media)}
                    unidade="Hz"
                    descricao="Média dos episódios registrados"
                    icone="analytics-outline"
                    cor={C.verde}
                    fundo="#EAF4EF"
                  />

                  <CartaoIndicador
                    titulo="Amplitude média"
                    valor={formatarValor(resumo.amplitude_media)}
                    descricao="Média registrada nos episódios"
                    icone="bar-chart-outline"
                    cor={C.rosa}
                    fundo={C.rosaClaro}
                  />
                </View>
              )}
            </View>

            {/* HISTÓRICO COMPLETO */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeHistorico]}>
                  <Ionicons
                    name="time-outline"
                    size={27}
                    color={C.roxo}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Histórico de movimentos
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Todos os episódios registrados pela Apollo.
                  </Text>
                </View>
              </View>

              <View style={styles.resumoHistorico}>
                <View style={styles.resumoHistoricoItem}>
                  <Text style={styles.resumoHistoricoNumero}>
                    {resumo.quantidade ?? 0}
                  </Text>

                  <Text style={styles.resumoHistoricoLabel}>
                    Episódios registrados
                  </Text>
                </View>

                <View style={styles.resumoHistoricoItem}>
                  <Text style={styles.resumoHistoricoNumero}>
                    {formatarDuracao(resumo.duracao_total_ms)}
                  </Text>

                  <Text style={styles.resumoHistoricoLabel}>
                    Duração acumulada
                  </Text>
                </View>
              </View>

              <Text style={styles.secaoLabel}>
                REGISTROS DE MOVIMENTAÇÃO
              </Text>

              {carregando ? (
                <View style={styles.estadoCarregando}>
                  <ActivityIndicator size="small" color={C.azul} />
                  <Text style={styles.textoAguardando}>
                    Carregando histórico...
                  </Text>
                </View>
              ) : erroBanco ? (
                <View style={styles.estadoVazio}>
                  <Text style={styles.estadoVazioDescricao}>
                    Não foi possível consultar o histórico.
                  </Text>
                </View>
              ) : episodios.length > 0 ? (
                episodios.map((episodio, index) => (
                  <CartaoEpisodio
                    key={
                      episodio.id ??
                      `${episodio.inicio_em}-${index}`
                    }
                    episodio={episodio}
                    indice={episodios.length - index}
                  />
                ))
              ) : (
                <View style={styles.estadoVazio}>
                  <Ionicons
                    name="analytics-outline"
                    size={36}
                    color={C.azul}
                  />

                  <Text style={styles.estadoVazioTitulo}>
                    Nenhum episódio registrado
                  </Text>

                  <Text style={styles.estadoVazioDescricao}>
                    Quando a Apollo identificar e finalizar um episódio
                    de movimento, ele aparecerá nesta seção.
                  </Text>
                </View>
              )}
            </View>

            {/* ÚLTIMO REGISTRO */}

            {!carregando && !erroBanco && resumo.ultimo_episodio && (
              <View style={styles.card}>
                <View style={styles.cardCabecalho}>
                  <View style={[styles.iconeCard, styles.iconeUltimo]}>
                    <Ionicons
                      name="calendar-outline"
                      size={26}
                      color={C.verde}
                    />
                  </View>

                  <View style={styles.cardTituloArea}>
                    <Text style={styles.cardTitulo}>
                      Último registro
                    </Text>

                    <Text style={styles.cardDescricao}>
                      Informações do episódio mais recente.
                    </Text>
                  </View>
                </View>

                <View style={styles.ultimoRegistroBox}>
                  <Text style={styles.ultimoRegistroData}>
                    {formatarData(resumo.ultimo_episodio.inicio_em)}
                  </Text>

                  <View style={styles.episodioLinha}>
                    <Text style={styles.episodioLabel}>
                      Duração
                    </Text>

                    <Text style={styles.episodioValor}>
                      {formatarDuracao(
                        resumo.ultimo_episodio.duracao_ms
                      )}
                    </Text>
                  </View>

                  <View style={styles.episodioLinha}>
                    <Text style={styles.episodioLabel}>
                      Frequência estimada
                    </Text>

                    <Text style={styles.episodioValor}>
                      {formatarValor(
                        resumo.ultimo_episodio.frequencia_hz
                      )} Hz
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* AVISO */}

            <View style={styles.aviso}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color={C.azul}
              />

              <Text style={styles.avisoTexto}>
                Os indicadores apresentados são dados experimentais
                coletados pelo dispositivo Apollo. Eles auxiliam no
                acompanhamento dos registros, mas não representam
                diagnóstico médico.
              </Text>
            </View>

            <Text style={styles.rodape}>
              Sunny Health | Apollo
            </Text>
          </ScrollView>
        </View>

        {/* NAVBAR INFERIOR */}

        <View
          style={[
            styles.bottomSafeArea,
            { paddingBottom: insets.bottom },
          ]}
        >
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/batisono')}
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

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/questionario')}
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

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/bluetooth')}
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

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navegar('/dicas')}
            >
              <View style={styles.navIcon}>
                <Ionicons
                  name="book-outline"
                  size={23}
                  color={C.azul}
                />
              </View>

              <Text style={styles.navTexto}>
                Dicas
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 14,
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

  card: {
    backgroundColor: C.branco,
    borderRadius: 22,
    padding: 17,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#30364D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },

  cardCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  iconeCard: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconeResumo: {
    backgroundColor: C.azulClaro,
  },

  iconeHistorico: {
    backgroundColor: '#F0EDFA',
  },

  iconeUltimo: {
    backgroundColor: '#EAF4EF',
  },

  cardTituloArea: {
    flex: 1,
  },

  cardTitulo: {
    color: C.texto,
    fontSize: 16,
    fontWeight: '800',
  },

  cardDescricao: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  botaoAtualizar: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusConexao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  statusConexaoTexto: {
    color: C.secundario,
    fontSize: 11,
  },

  indicadoresGrade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  indicadorCard: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#F8F9FD',
    borderRadius: 16,
    padding: 13,
    minHeight: 135,
  },

  indicadorIcone: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  indicadorTitulo: {
    color: C.secundario,
    fontSize: 11,
    fontWeight: '700',
  },

  indicadorValorLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    marginTop: 5,
  },

  indicadorValor: {
    color: C.texto,
    fontSize: 19,
    fontWeight: '900',
  },

  indicadorUnidade: {
    color: C.secundario,
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '700',
  },

  indicadorDescricao: {
    color: C.secundario,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },

  resumoHistorico: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 15,
  },

  resumoHistoricoItem: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    borderRadius: 14,
    padding: 12,
  },

  resumoHistoricoNumero: {
    color: C.texto,
    fontSize: 17,
    fontWeight: '900',
  },

  resumoHistoricoLabel: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 5,
  },

  secaoLabel: {
    color: C.secundario,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
    marginBottom: 10,
  },

  cartaoEpisodio: {
    backgroundColor: '#F8F9FD',
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
  },

  episodioCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  episodioNumero: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },

  episodioNumeroTexto: {
    color: C.azul,
    fontSize: 14,
    fontWeight: '900',
  },

  episodioInformacoes: {
    flex: 1,
    marginLeft: 10,
  },

  episodioTitulo: {
    color: C.texto,
    fontSize: 12,
    fontWeight: '800',
  },

  episodioData: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 4,
  },

  episodioIcone: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divisor: {
    height: 1,
    backgroundColor: C.borda,
    marginBottom: 12,
  },

  episodioLinha: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 9,
  },

  episodioDado: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    padding: 9,
  },

  episodioLabel: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 5,
  },

  episodioValor: {
    color: C.texto,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  classificacao: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0EDFA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
    marginTop: 12,
  },

  classificacaoTexto: {
    color: C.roxo,
    fontSize: 10,
    fontWeight: '700',
  },

  ultimoRegistroBox: {
    backgroundColor: '#F8F9FD',
    padding: 14,
    borderRadius: 15,
  },

  ultimoRegistroData: {
    color: C.azul,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },

  estadoCarregando: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  textoAguardando: {
    color: C.secundario,
    fontSize: 11,
    marginTop: 8,
  },

  estadoVazio: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 22,
  },

  estadoVazioTitulo: {
    color: C.texto,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },

  estadoVazioDescricao: {
    color: C.secundario,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },

  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: C.azulClaro,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
  },

  botaoSecundarioTexto: {
    color: C.azul,
    fontSize: 12,
    fontWeight: '800',
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: C.azulClaro,
    borderRadius: 14,
    padding: 13,
    marginBottom: 15,
  },

  avisoTexto: {
    flex: 1,
    color: C.texto,
    fontSize: 12,
    lineHeight: 19,
  },

  rodape: {
    textAlign: 'center',
    color: C.secundario,
    fontSize: 10,
    marginBottom: 5,
  },

  // NAVBAR INFERIOR

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

  navTexto: {
    color: C.secundario,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
