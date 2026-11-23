
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const OLLAMA_URL = 'http://127.0.0.1:11434/api/chat';
const MODELO = 'llama3.2:1b';

const INSTRUCOES = `
Você é o Sunny, assistente virtual do aplicativo Sunny Health.

Suas funções:
- Cumprimentar os usuários de maneira natural e amigável.
- Responder a saudações como "oi", "olá" e "bom dia".
- Responder dúvidas gerais sobre o funcionamento do Sunny Health.
- Fornecer informações educativas sobre a doença de Parkinson.
- Explicar sintomas, cuidados, acompanhamento e qualidade de vida.

Regras:
- Não recuse perguntas gerais e educativas sobre Parkinson.
- Não faça diagnósticos nem prescreva medicamentos.
- Não substitua a orientação de profissionais de saúde.
- Use linguagem simples, acolhedora e objetiva.
- Considere o contexto das mensagens anteriores.
`;

app.get('/', (req, res) => {
  res.json({
    mensagem: 'Backend Sunny Health funcionando!',
    modelo: MODELO
  });
});

app.post('/chat', async (req, res) => {
  try {
    const { mensagem, historico = [] } = req.body;

    if (!mensagem || typeof mensagem !== 'string') {
      return res.status(400).json({
        erro: 'Envie uma mensagem válida.'
      });
    }

    const mensagensAnteriores = Array.isArray(historico)
      ? historico
          .filter(item =>
            ['user', 'assistant'].includes(item.role) &&
            typeof item.content === 'string'
          )
          .slice(-10)
          .map(item => ({
            role: item.role,
            content: item.content
          }))
      : [];

    const respostaIA = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODELO,
        stream: false,
        messages: [
          {
            role: 'system',
            content: INSTRUCOES
          },
          ...mensagensAnteriores,
          {
            role: 'user',
            content: mensagem
          }
        ]
      })
    });

    if (!respostaIA.ok) {
      const erro = await respostaIA.text();
      console.error('Erro do Ollama:', erro);

      return res.status(502).json({
        erro: 'Não foi possível obter resposta do modelo local.'
      });
    }

    const dados = await respostaIA.json();

    res.json({
      resposta: dados.message.content
    });

  } catch (erro) {
    console.error('Erro no backend:', erro.message);

    res.status(500).json({
      erro: 'Não foi possível conversar com a inteligência artificial.'
    });
  }
});

const PORTA = process.env.PORT || 3000;

app.listen(PORTA, '0.0.0.0', () => {
  console.log(`Sunny Health Backend iniciado na porta ${PORTA}`);
  console.log(`Modelo conectado: ${MODELO}`);
});
