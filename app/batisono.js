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
  buscarUltimaMedicaoApollo,
  buscarUltimaFrequenciaCardiaca,
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
// QUESTIONÁRIO
// ==========================================

const OPCOES = {
  horas_sono: ['Menos de 5 horas', '5 a 6 horas', '6 a 7 horas', '7 a 8 horas', 'Mais de 8 horas'],
  qualidade_sono: ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Muito boa'],
  despertares: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Todas as noites'],
  dificuldade_dormir: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente'],
  descanso: ['Nunca', 'Raramente', 'Às vezes', 'Na maioria das vezes', 'Sempre'],
  refeicoes_dia: ['1 a 2', '3', '4', '5 ou mais'],
  frutas: ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Mais de uma vez por dia'],
  verduras: ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Mais de uma vez por dia'],
  ultraprocessados: ['Nunca', 'Raramente', 'Algumas vezes por semana', 'Todos os dias', 'Várias vezes ao dia'],
  agua: ['Muito pouco', 'Pouco', 'Às vezes', 'Frequentemente', 'Regularmente'],
  humor: ['Muito mal', 'Mal', 'Regular', 'Bem', 'Muito bem'],
  estresse: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Quase sempre'],
  relaxamento: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Quase sempre'],
  disposicao: ['Muito baixa', 'Baixa', 'Regular', 'Boa', 'Muito boa'],
  atividade_minutos: ['Quase não faço', 'Até 15 minutos', '15 a 30 minutos', '30 a 60 minutos', 'Mais de 1 hora'],
  atividade_frequencia: ['Nunca', '1 vez por semana', '2 a 3 vezes por semana', '4 a 5 vezes por semana', 'Todos os dias'],
  dificuldade_atividades: ['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'],
};

const GRUPOS_QUESTIONARIO = [
  {
    titulo: 'Sono e descanso',
    icone: 'moon-outline',
    cor: C.roxo,
    campos: [
      ['horas_sono', 'Duração do sono'],
      ['qualidade_sono', 'Qualidade do sono'],
      ['despertares', 'Despertares durante a noite'],
      ['dificuldade_dormir', 'Dificuldade para dormir'],
      ['descanso', 'Sensação de descanso'],
    ],
  },
  {
    titulo: 'Alimentação e hidratação',
    icone: 'restaurant-outline',
    cor: C.verde,
    campos: [
      ['refeicoes_dia', 'Refeições por dia'],
      ['frutas', 'Consumo de frutas'],
      ['verduras', 'Consumo de verduras e legumes'],
      ['ultraprocessados', 'Consumo de ultraprocessados'],
      ['agua', 'Consumo de água'],
    ],
  },
  {
    titulo: 'Bem-estar',
    icone: 'heart-outline',
    cor: C.rosa,
    campos: [
      ['humor', 'Humor'],
      ['estresse', 'Frequência de estresse'],
      ['relaxamento', 'Dificuldade para relaxar'],
      ['disposicao', 'Disposição no dia a dia'],
    ],
  },
  {
    titulo: 'Atividade e rotina',
    icone: 'walk-outline',
    cor: C.azul,
    campos: [
      ['atividade_minutos', 'Tempo de atividade por dia'],
      ['atividade_frequencia', 'Frequência de atividade física'],
      ['dificuldade_atividades', 'Dificuldade nas atividades diárias'],
    ],
  },
  {
    titulo: 'Informações sanguíneas',
    icone: 'water-outline',
    cor: C.rosa,
    campos: [
      ['tipo_sanguineo', 'Tipo sanguíneo'],
      ['fator_rh', 'Fator Rh'],
      ['tipagem_confirmada', 'Origem da informação'],
    ],
  },
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function formatarResposta(campo, valor) {
  if (valor === null || valor === undefined || valor === '') {
    return 'Não informado';
  }

  if (
    campo === 'tipo_sanguineo' ||
    campo === 'fator_rh' ||
    campo === 'tipagem_confirmada'
  ) {
    return String(valor);
  }

  const opcoes = OPCOES[campo];

  if (!opcoes) return String(valor);

  return opcoes[Number(valor) - 1] || 'Não informado';
}

function formatarData(data) {
  if (!data) return 'Data não informada';

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return String(data);
  }

  return dataFormatada.toLocaleString('pt-BR', {
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
    ? numero.toFixed(casas)
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

function calcularMagnitude(x, y, z) {
  const valores = [x, y, z].map(Number);

  if (!valores.every(Number.isFinite)) {
    return null;
  }

  return Math.sqrt(
    valores[0] ** 2 +
    valores[1] ** 2 +
    valores[2] ** 2
  );
}

function resumoEpisodiosVazio() {
  return {
    quantidade: 0,
    duracao_total_ms: 0,
    frequencia_media: null,
    amplitude_media: null,
    ultimo_episodio: null,
  };
}

// ==========================================
// COMPONENTES
// ==========================================

function CartaoResposta({ titulo, valor }) {
  return (
    <View style={styles.novaRespostaLinha}>
      <Text style={styles.novaRespostaTitulo}>{titulo}</Text>
      <Text style={styles.novaRespostaValor}>{valor}</Text>
    </View>
  );
}

function GrupoQuestionario({ grupo, questionario }) {
  return (
    <View style={styles.novoGrupo}>
      <View style={styles.novoGrupoCabecalho}>
        <View
          style={[
            styles.novoGrupoIcone,
            { backgroundColor: `${grupo.cor}18` },
          ]}
        >
          <Ionicons name={grupo.icone} size={20} color={grupo.cor} />
        </View>

        <Text style={styles.novoGrupoTitulo}>
          {grupo.titulo}
        </Text>
      </View>

      {grupo.campos.map(([campo, titulo]) => (
        <CartaoResposta
          key={campo}
          titulo={titulo}
          valor={formatarResposta(campo, questionario[campo])}
        />
      ))}
    </View>
  );
}

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

function CartaoEpisodio({ episodio, indice }) {
  return (
    <View style={styles.cartaoEpisodio}>
      <View style={styles.episodioCabecalho}>
        <View>
          <Text style={styles.episodioTitulo}>
            Episódio {indice}
          </Text>

          <Text style={styles.episodioData}>
            {formatarData(episodio.inicio_em)}
          </Text>
        </View>

        <View style={styles.episodioIcone}>
          <Ionicons
            name="activity-outline"
            size={20}
            color={C.azul}
          />
        </View>
      </View>

      <View style={styles.episodioLinha}>
        <Text style={styles.episodioLabel}>Duração</Text>
        <Text style={styles.episodioValor}>
          {formatarDuracao(episodio.duracao_ms)}
        </Text>
      </View>

      <View style={styles.episodioLinha}>
        <Text style={styles.episodioLabel}>
          Frequência estimada
        </Text>
        <Text style={styles.episodioValor}>
          {formatarValor(episodio.frequencia_hz)} Hz
        </Text>
      </View>

      <View style={styles.episodioLinha}>
        <Text style={styles.episodioLabel}>Regularidade</Text>
        <Text style={styles.episodioValor}>
          {formatarRegularidade(episodio.regularidade)}
        </Text>
      </View>

      <View style={styles.episodioLinha}>
        <Text style={styles.episodioLabel}>
          Amostras analisadas
        </Text>
        <Text style={styles.episodioValor}>
          {episodio.quantidade_amostras ?? '--'}
        </Text>
      </View>
    </View>
  );
}

// ==========================================
// TELA PRINCIPAL
// ==========================================

export default function BatiSono() {
  const insets = useSafeAreaInsets();

  const [historicoQuestionarios, setHistoricoQuestionarios] =
    useState([]);

  const [questionarioSelecionado, setQuestionarioSelecionado] =
    useState(null);

  // Última medição completa: acelerômetro, giroscópio e áudio.
  const [medicaoApollo, setMedicaoApollo] = useState(null);

  // Último BPM válido, consultado separadamente no SQLite.
  const [bpmApollo, setBpmApollo] = useState(null);

  const [episodiosApollo, setEpisodiosApollo] = useState([]);

  const [resumoEpisodios, setResumoEpisodios] =
    useState(resumoEpisodiosVazio);

  const [carregandoDados, setCarregandoDados] = useState(true);
  const [erroBanco, setErroBanco] = useState(false);

  const navegar = rota => router.push(rota);

  // ==========================================
  // ATUALIZAÇÃO DOS DADOS
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      let ativo = true;
      let buscando = false;

      const atualizarDados = async () => {
        if (!ativo || buscando) return;

        buscando = true;

        try {
          // Garante que o banco e suas tabelas estejam inicializados.
          const db = await initializeDatabase();

          if (!ativo) return;

          // Busca o usuário que está com a sessão ativa.
          const sessao = await db.getFirstAsync(`
            SELECT usuario_id
            FROM sessao
            WHERE id = 1
            LIMIT 1
          `);

          if (!ativo) return;

          // Se não houver usuário logado, limpa os dados da tela.
          if (!sessao?.usuario_id) {
            setHistoricoQuestionarios([]);
            setQuestionarioSelecionado(null);
            setMedicaoApollo(null);
            setBpmApollo(null);
            setEpisodiosApollo([]);
            setResumoEpisodios(resumoEpisodiosVazio());
            setErroBanco(false);

            return;
          }

          // ======================================
          // QUESTIONÁRIOS
          // ======================================

          const historico = await db.getAllAsync(
            `SELECT *
             FROM questionarios
             WHERE usuario_id = ?
             ORDER BY id DESC
             LIMIT 20`,
            sessao.usuario_id
          );

          if (!ativo) return;

          setHistoricoQuestionarios(historico || []);

          setQuestionarioSelecionado(anterior => {
            if (!historico?.length) return null;

            const aindaExiste = historico.some(
              item => item.id === anterior
            );

            return aindaExiste ? anterior : historico[0].id;
          });

          // ======================================
          // ÚLTIMA MEDIÇÃO COMPLETA
          // ======================================

          // Essa consulta continua sendo responsável pelos dados
          // de acelerômetro, giroscópio e intensidade sonora.
          const medicao = await buscarUltimaMedicaoApollo();

          if (!ativo) return;

          setMedicaoApollo(medicao || null);

          // ======================================
          // ÚLTIMO BPM VÁLIDO
          // ======================================

          // Não usamos o BPM da última medição completa.
          // Buscamos separadamente o último BPM válido para evitar
          // que pacotes recentes com BPM null apaguem a leitura anterior.
          const ultimoBPM = await buscarUltimaFrequenciaCardiaca();

          if (!ativo) return;

          setBpmApollo(ultimoBPM || null);

          // ======================================
          // HISTÓRICO DE EPISÓDIOS
          // ======================================

          const episodios = await buscarEpisodiosMovimento(20);

          if (!ativo) return;

          setEpisodiosApollo(episodios || []);

          // ======================================
          // RESUMO DOS EPISÓDIOS
          // ======================================

          const resumo = await buscarResumoEpisodiosMovimento();

          if (!ativo) return;

          setResumoEpisodios(
            resumo || resumoEpisodiosVazio()
          );

          setErroBanco(false);
        } catch (error) {
          console.error(
            'Erro ao atualizar monitoramento:',
            error?.message || error
          );

          if (ativo) {
            setErroBanco(true);
          }
        } finally {
          buscando = false;

          if (ativo) {
            setCarregandoDados(false);
          }
        }
      };

      atualizarDados();

      const intervalo = setInterval(atualizarDados, 2000);

      return () => {
        ativo = false;
        clearInterval(intervalo);
      };
    }, [])
  );

  // ==========================================
  // DADOS DO QUESTIONÁRIO
  // ==========================================

  const questionarioAtual = historicoQuestionarios.find(
    item => item.id === questionarioSelecionado
  ) || null;

  // ==========================================
  // DADOS DOS SENSORES
  // ==========================================

  const magnitudeAceleracao = calcularMagnitude(
    medicaoApollo?.aceleracao_x,
    medicaoApollo?.aceleracao_y,
    medicaoApollo?.aceleracao_z
  );

  const magnitudeRotacao = calcularMagnitude(
    medicaoApollo?.giroscopio_x,
    medicaoApollo?.giroscopio_y,
    medicaoApollo?.giroscopio_z
  );

  // ==========================================
  // FREQUÊNCIA CARDÍACA
  // ==========================================

  // O BPM vem da consulta buscarUltimaFrequenciaCardiaca(),
  // e não da última medição geral.
  const bpmRecebido = Number(
    bpmApollo?.frequencia_cardiaca
  );

  const frequenciaCardiaca =
    bpmApollo?.frequencia_cardiaca !== null &&
    bpmApollo?.frequencia_cardiaca !== undefined &&
    Number.isFinite(bpmRecebido) &&
    bpmRecebido >= 1 &&
    bpmRecebido <= 255
      ? Math.round(bpmRecebido)
      : null;

  // ==========================================
  // ÚLTIMO EPISÓDIO
  // ==========================================

  const ultimoEpisodio = episodiosApollo[0] || null;

  const frequenciaUltimoEpisodio =
    ultimoEpisodio?.frequencia_hz ?? null;

  const regularidadeUltimoEpisodio =
    ultimoEpisodio?.regularidade ?? null;

  const temMedicao = !!medicaoApollo;

  const dataRecebimento = medicaoApollo?.recebido_em
    ? formatarData(medicaoApollo.recebido_em)
    : null;

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
                Seja bem-vindo(a)!
              </Text>

              <Text style={styles.subtituloPagina}>
                Acompanhe sua movimentação, os registros da Apollo
                e as informações do seu questionário.
              </Text>
            </View>

            {/* ================================== */}
            {/* BATIMENTOS CARDÍACOS */}
            {/* ================================== */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeBatimentos]}>
                  <Ionicons
                    name="heart"
                    size={27}
                    color={C.rosa}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Batimentos cardíacos
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Frequência cardíaca registrada.
                  </Text>
                </View>
              </View>

              <View style={styles.valorPrincipalBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>
                    Frequência cardíaca
                  </Text>

                  <View style={styles.linhaValor}>
                    <Text style={styles.valorGrande}>
                      {frequenciaCardiaca ?? '--'}
                    </Text>

                    <Text style={styles.unidade}>bpm</Text>
                  </View>

                  <Text style={styles.textoAguardando}>
                    {frequenciaCardiaca !== null
                      ? 'Última leitura válida recebida pelo sensor'
                      : 'Aguardando uma leitura válida do sensor MAX30102.'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.iconeValor,
                    { backgroundColor: C.rosaClaro },
                  ]}
                >
                  <Ionicons
                    name="pulse-outline"
                    size={30}
                    color={C.rosa}
                  />
                </View>
              </View>
            </View>

            {/* ================================== */}
            {/* RESUMO DO MONITORAMENTO */}
            {/* ================================== */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeTremor]}>
                  <Ionicons
                    name="pulse-outline"
                    size={27}
                    color={C.azul}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Monitoramento Apollo
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Resumo dos movimentos registrados pela pulseira.
                  </Text>
                </View>
              </View>

              <View style={styles.statusConexao}>
                <Ionicons
                  name={
                    erroBanco
                      ? 'alert-circle-outline'
                      : temMedicao
                        ? 'checkmark-circle'
                        : 'time-outline'
                  }
                  size={20}
                  color={
                    erroBanco
                      ? C.rosa
                      : temMedicao
                        ? C.verde
                        : C.secundario
                  }
                />

                <Text style={styles.statusConexaoTexto}>
                  {erroBanco
                    ? 'Não foi possível consultar os dados'
                    : temMedicao
                      ? 'Existem medições registradas'
                      : 'Aguardando as primeiras medições'}
                </Text>
              </View>

              <View style={styles.indicadoresGrade}>
                <CartaoIndicador
                  titulo="Movimentação"
                  valor={formatarValor(magnitudeAceleracao)}
                  descricao="Leitura combinada dos eixos"
                  icone="walk-outline"
                  cor={C.azul}
                  fundo={C.azulClaro}
                />

                <CartaoIndicador
                  titulo="Mudança de orientação"
                  valor={formatarValor(magnitudeRotacao)}
                  descricao="Variação registrada pelo sensor"
                  icone="sync-outline"
                  cor={C.roxo}
                  fundo="#F0EDFA"
                />

                <CartaoIndicador
                  titulo="Episódios"
                  valor={String(resumoEpisodios.quantidade ?? 0)}
                  descricao="Registros salvos no histórico"
                  icone="repeat-outline"
                  cor={C.rosa}
                  fundo={C.rosaClaro}
                />

                <CartaoIndicador
                  titulo="Tempo registrado"
                  valor={formatarDuracao(
                    resumoEpisodios.duracao_total_ms
                  )}
                  descricao="Duração acumulada dos episódios"
                  icone="timer-outline"
                  cor={C.verde}
                  fundo="#EAF4EF"
                />
              </View>

              {/* ATIVIDADE OSCILATÓRIA */}

              <View style={styles.oscilacaoBox}>
                <View style={styles.oscilacaoCabecalho}>
                  <View style={styles.oscilacaoIcone}>
                    <Ionicons
                      name="pulse"
                      size={23}
                      color={C.rosa}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.oscilacaoTitulo}>
                      Aúdio
                    </Text>

                    <Text style={styles.oscilacaoDescricao}>
                      Frequência estimada no último episódio.
                    </Text>
                  </View>
                </View>

                <View style={styles.oscilacaoValores}>
                  <View style={styles.oscilacaoItem}>
                    <Text style={styles.oscilacaoValor}>
                      {formatarValor(frequenciaUltimoEpisodio)}
                    </Text>

                    <Text style={styles.oscilacaoUnidade}>
                      Hz
                    </Text>

                    <Text style={styles.oscilacaoLegenda}>
                      Frequência
                    </Text>
                  </View>

                  <View style={styles.divisorVertical} />

                  <View style={styles.oscilacaoItem}>
                    <Text style={styles.oscilacaoValor}>
                      {formatarRegularidade(
                        regularidadeUltimoEpisodio
                      )}
                    </Text>

                    <Text style={styles.oscilacaoLegenda}>
                      Regularidade
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.textoAguardando}>
                {dataRecebimento
                  ? `Última medição salva: ${dataRecebimento}`
                  : 'Os dados aparecerão após a primeira medição salva pela Apollo.'}
              </Text>

              <TouchableOpacity
                style={styles.botaoBluetooth}
                onPress={() => navegar('/bluetooth')}
              >
                <Ionicons
                  name="bluetooth-outline"
                  size={19}
                  color={C.azul}
                />

                <Text style={styles.botaoSecundarioTexto}>
                  Abrir conexão Bluetooth
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color={C.azul}
                />
              </TouchableOpacity>
            </View>

            {/* ================================== */}
            {/* HISTÓRICO DE MOVIMENTOS */}
            {/* ================================== */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeSono]}>
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
                    Acompanhe os episódios registrados pela pulseira.
                  </Text>
                </View>
              </View>

              <View style={styles.resumoHistorico}>
                <View style={styles.resumoHistoricoItem}>
                  <Text style={styles.resumoHistoricoNumero}>
                    {resumoEpisodios.quantidade ?? 0}
                  </Text>

                  <Text style={styles.resumoHistoricoLabel}>
                    Episódios registrados
                  </Text>
                </View>

                <View style={styles.resumoHistoricoItem}>
                  <Text style={styles.resumoHistoricoNumero}>
                    {formatarDuracao(
                      resumoEpisodios.duracao_total_ms
                    )}
                  </Text>

                  <Text style={styles.resumoHistoricoLabel}>
                    Duração acumulada
                  </Text>
                </View>
              </View>

              {carregandoDados ? (
                <View style={styles.estadoCarregando}>
                  <ActivityIndicator
                    size="small"
                    color={C.azul}
                  />

                  <Text style={styles.textoAguardando}>
                    Carregando histórico...
                  </Text>
                </View>
              ) : episodiosApollo.length > 0 ? (
                <>
                  <Text style={styles.secaoLabel}>
                    ÚLTIMOS REGISTROS
                  </Text>

                  {episodiosApollo.slice(0, 5).map((episodio, index) => (
                    <CartaoEpisodio
                      key={
                        episodio.id ??
                        `${episodio.inicio_em}-${index}`
                      }
                      episodio={episodio}
                      indice={resumoEpisodios.quantidade - index}
                    />
                  ))}

                  <TouchableOpacity
                    style={styles.botaoRelatorio}
                    onPress={() => navegar('/relatorio')}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.botaoRelatorioTexto}>
                      Ver relatório completo
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.estadoVazio}>
                  <Ionicons
                    name="analytics-outline"
                    size={34}
                    color={C.azul}
                  />

                  <Text style={styles.estadoVazioTitulo}>
                    Nenhum episódio registrado
                  </Text>

                  <Text style={styles.estadoVazioDescricao}>
                    Quando a Apollo identificar e finalizar um episódio
                    de movimento, ele aparecerá aqui.
                  </Text>
                </View>
              )}
            </View>

            {/* ================================== */}
            {/* QUESTIONÁRIO */}
            {/* ================================== */}

            <View style={styles.card}>
              <View style={styles.cardCabecalho}>
                <View style={[styles.iconeCard, styles.iconeSono]}>
                  <Ionicons
                    name="clipboard-outline"
                    size={27}
                    color={C.roxo}
                  />
                </View>

                <View style={styles.cardTituloArea}>
                  <Text style={styles.cardTitulo}>
                    Seu questionário
                  </Text>

                  <Text style={styles.cardDescricao}>
                    Informações do preenchimento selecionado.
                  </Text>
                </View>
              </View>

              {carregandoDados ? (
                <View style={styles.estadoCarregando}>
                  <ActivityIndicator
                    size="small"
                    color={C.azul}
                  />

                  <Text style={styles.textoAguardando}>
                    Carregando dados...
                  </Text>
                </View>
              ) : historicoQuestionarios.length > 0 ? (
                <>
                  <Text style={styles.novoHistoricoLabel}>
                    HISTÓRICO DE QUESTIONÁRIOS
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.novoHistoricoLista}
                  >
                    {historicoQuestionarios.map((item, index) => {
                      const selecionado =
                        item.id === questionarioSelecionado;

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.novoHistoricoItem,
                            selecionado &&
                              styles.novoHistoricoItemAtivo,
                          ]}
                          onPress={() =>
                            setQuestionarioSelecionado(item.id)
                          }
                        >
                          <Text
                            style={[
                              styles.novoHistoricoTitulo,
                              selecionado &&
                                styles.novoHistoricoTextoAtivo,
                            ]}
                          >
                            {index === 0
                              ? 'Mais recente'
                              : `Registro ${historicoQuestionarios.length - index}`}
                          </Text>

                          <Text
                            style={[
                              styles.novoHistoricoData,
                              selecionado &&
                                styles.novoHistoricoTextoAtivo,
                            ]}
                          >
                            {item.criado_em
                              ? new Date(
                                  item.criado_em
                                ).toLocaleDateString('pt-BR')
                              : `#${item.id}`}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {questionarioAtual && (
                    <>
                      <View style={styles.novoDataRegistro}>
                        <Ionicons
                          name="calendar-outline"
                          size={17}
                          color={C.azul}
                        />

                        <Text style={styles.novoDataRegistroTexto}>
                          Preenchido em{' '}
                          {formatarData(questionarioAtual.criado_em)}
                        </Text>
                      </View>

                      {GRUPOS_QUESTIONARIO.map(grupo => (
                        <GrupoQuestionario
                          key={grupo.titulo}
                          grupo={grupo}
                          questionario={questionarioAtual}
                        />
                      ))}
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.botaoSecundario}
                    onPress={() => navegar('/questionario')}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={19}
                      color={C.azul}
                    />

                    <Text style={styles.botaoSecundarioTexto}>
                      Responder novamente
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={C.azul}
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.estadoVazio}>
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color={C.azul}
                  />

                  <Text style={styles.estadoVazioTitulo}>
                    Nenhum questionário encontrado
                  </Text>

                  <Text style={styles.estadoVazioDescricao}>
                    Responda ao questionário para visualizar suas informações.
                  </Text>

                  <TouchableOpacity
                    style={styles.botaoSecundario}
                    onPress={() => navegar('/questionario')}
                  >
                    <Text style={styles.botaoSecundarioTexto}>
                      Responder questionário
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={C.azul}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* ================================== */}
            {/* AVISO SOBRE OS INDICADORES */}
            {/* ================================== */}

            <View style={styles.aviso}>
              <Ionicons
                name="information-circle-outline"
                size={23}
                color={C.azul}
              />

            </View>
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
              <View style={[styles.navIcon, styles.navIconAtivo]}>
                <Ionicons
                  name="heart"
                  size={23}
                  color={C.texto}
                />
              </View>

              <Text style={[styles.navTexto, styles.navTextoAtivo]}>
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

  iconeBatimentos: {
    backgroundColor: C.rosaClaro,
  },

  iconeSono: {
    backgroundColor: '#F0EDFA',
  },

  iconeTremor: {
    backgroundColor: C.azulClaro,
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

  statusConexao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },

  statusConexaoTexto: {
    color: C.secundario,
    fontSize: 12,
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

  oscilacaoBox: {
    backgroundColor: C.rosaClaro,
    borderRadius: 16,
    padding: 14,
    marginTop: 13,
  },

  oscilacaoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  oscilacaoIcone: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F7DDE2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  oscilacaoTitulo: {
    color: C.texto,
    fontSize: 13,
    fontWeight: '800',
  },

  oscilacaoDescricao: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 3,
  },

  oscilacaoValores: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0D9DE',
  },

  oscilacaoItem: {
    flex: 1,
    alignItems: 'center',
  },

  oscilacaoValor: {
    color: C.rosa,
    fontSize: 22,
    fontWeight: '900',
  },

  oscilacaoUnidade: {
    color: C.secundario,
    fontSize: 10,
    fontWeight: '700',
  },

  oscilacaoLegenda: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 4,
  },

  divisorVertical: {
    width: 1,
    height: 42,
    backgroundColor: '#EACBD2',
  },

  textoAguardando: {
    color: C.secundario,
    fontSize: 11,
    marginTop: 8,
    lineHeight: 16,
  },

  botaoBluetooth: {
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
    borderRadius: 14,
    padding: 12,
    marginBottom: 9,
  },

  episodioCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
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
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: C.azulClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },

  episodioLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },

  episodioLabel: {
    color: C.secundario,
    fontSize: 11,
  },

  episodioValor: {
    color: C.texto,
    fontSize: 11,
    fontWeight: '800',
  },

  botaoRelatorio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: C.azul,
    borderRadius: 13,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginTop: 8,
  },

  botaoRelatorioTexto: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  valorPrincipalBox: {
    backgroundColor: '#F8F9FD',
    borderRadius: 17,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },

  label: {
    color: C.secundario,
    fontSize: 12,
    fontWeight: '600',
  },

  linhaValor: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 3,
  },

  valorGrande: {
    color: C.texto,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },

  unidade: {
    color: C.secundario,
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '600',
  },

  iconeValor: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  estadoCarregando: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  estadoVazio: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
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

  // QUESTIONÁRIO

  novoHistoricoLabel: {
    color: C.secundario,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 9,
  },

  novoHistoricoLista: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 5,
  },

  novoHistoricoItem: {
    minWidth: 115,
    padding: 11,
    borderRadius: 13,
    backgroundColor: '#F3F5FA',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  novoHistoricoItemAtivo: {
    backgroundColor: C.azul,
    borderColor: C.azul,
  },

  novoHistoricoTitulo: {
    color: C.texto,
    fontSize: 11,
    fontWeight: '800',
  },

  novoHistoricoData: {
    color: C.secundario,
    fontSize: 10,
    marginTop: 5,
  },

  novoHistoricoTextoAtivo: {
    color: '#FFFFFF',
  },

  novoDataRegistro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: C.azulClaro,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 13,
  },

  novoDataRegistroTexto: {
    color: C.azul,
    fontSize: 11,
    fontWeight: '700',
  },

  novoGrupo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FD',
    borderRadius: 15,
  },

  novoGrupoCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  novoGrupoIcone: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  novoGrupoTitulo: {
    color: C.texto,
    fontSize: 13,
    fontWeight: '800',
  },

  novaRespostaLinha: {
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF5',
  },

  novaRespostaTitulo: {
    color: C.secundario,
    fontSize: 11,
    fontWeight: '600',
  },

  novaRespostaValor: {
    color: C.texto,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
});