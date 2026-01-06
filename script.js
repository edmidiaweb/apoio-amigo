/**
 * SCRIPT.JS - Versão com Incentivo a Atividades Físicas e Hobbies
 */

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');

let estadoAtual = { tema: null, etapa: 0, respostas: [], aguardandoAtividade: false };
let sosInterval;

// Banco de dicas baseadas em hobbies/esportes
const dicasAtividades = {
    "Caminhada / Corrida": "Que tal colocar um tênis agora e dar uma volta no quarteirão? O ar fresco e o movimento ajudam a reduzir o cortisol (hormônio do estresse).",
    "Academia / Musculação": "O esforço físico pesado ajuda a descarregar a raiva e a frustração. Se puder, faça um treino focado hoje.",
    "Yoga / Alongamento": "Ótima escolha para momentos de ansiedade. Tente fazer 5 minutos de saudações ao sol ou apenas alongar o pescoço e as costas.",
    "Esportes Coletivos": "O contato com outras pessoas é um santo remédio para a solidão. Tente marcar uma partida para os próximos dias.",
    "Artes / Hobbies Criativos": "Pintar, escrever ou tocar um instrumento ajuda a canalizar emoções que as palavras não alcançam. Dedique 15 minutos a isso hoje.",
    "Meditação / Leitura": "Excelente para acalmar a mente barulhenta. Que tal ler apenas duas páginas de um livro que você gosta agora?"
};

// 1. CONFIGURAÇÃO DOS FLUXOS (Mantidos os anteriores)
const fluxos = {
    gratidao: {
        perguntas: [
            { q: "1. Qual foi a pequena vitória ou alegria que você teve hoje?", sugestoes: ["Um café gostoso", "Terminei uma tarefa", "Alguém foi gentil", "Mantive a calma"] },
            { q: "2. Quem é uma pessoa pela qual você é grato hoje?", sugestoes: ["Um amigo", "Minha família", "Um colega", "Eu mesmo"] },
            { q: "3. O que você aprendeu hoje que te faz melhor amanhã?", sugestoes: ["A dizer não", "A silenciar", "Sou resiliente", "A pedir ajuda"] }
        ],
        analisar: () => "✨ **Que momento especial...** Eu te entendo e sinto daqui a sua luz. Cultivar o coração grato é o segredo para manter a paz."
    },
    recaida: {
        perguntas: [
            { q: "1. Qual pensamento 'perigoso' você está alimentando agora?", sugestoes: ["Raiva de alguém", "Tédio profundo", "Incompreensão", "Vontade de fugir"] },
            { q: "2. Do que você está tentando fugir ou anestesiar agora?", sugestoes: ["Dor do passado", "Frustração", "Medo do futuro", "Solidão"] },
            { q: "3. Como você se sentirá 15 minutos após o erro?", sugestoes: ["Arrependido", "Fracassado", "Com medo", "Terei que recomeçar"] }
        ],
        analisar: () => "🚨 **INTERVENÇÃO:** Eu sei como essa pressão parece insuportável. Mas não tome uma decisão permanente por causa de um sentimento temporário. Respire, isso vai passar."
    },
    carater: {
        perguntas: [
            { q: "1. Onde você permitiu que o egoísmo ou medo guiassem suas ações?", sugestoes: ["Menti", "Fui rude", "Pensei só em mim", "Fui preguiçoso"] },
            { q: "2. Você agiu com desonestidade ou tentou manipular algo?", sugestoes: ["Omiti a verdade", "Exagerei", "Tentei controlar", "Fui honesto"] },
            { q: "3. O seu orgulho te impediu de ser útil ou admitir um erro?", sugestoes: ["Não pedi desculpas", "Fui superior", "Não aceitei crítica", "Fiquei com raiva"] }
        ],
        analisar: () => "📊 **Feedback:** Olhar para nossas falhas dói, mas a honestidade liberta. Repare o que for preciso e siga em paz."
    },
    ansiedade: {
        perguntas: [
            { q: "1. O que você está tentando controlar no futuro agora?", sugestoes: ["Finanças/Contas", "Opinião alheia", "Saúde", "O resultado de algo"] },
            { q: "2. Esse medo é real ou um pensamento em loop?", sugestoes: ["Looping mental", "Problema real", "Não sei dizer", "Medo do 'e se'"] },
            { q: "3. O que aconteceria se você soltasse o controle por 5 minutos?", sugestoes: ["Ficaria sem rumo", "Nada mudaria", "Teria que aceitar", "Teria paz"] }
        ],
        analisar: () => "📊 **Feedback:** Parece que o mundo vai desabar, mas você está seguro agora. Não tente resolver a vida inteira hoje. Foque no próximo minuto."
    },
    panico: {
        perguntas: [
            { q: "1. Onde você sente o desconforto no corpo agora?", sugestoes: ["Peito apertado", "Falta de ar", "Tremores/Suor", "Tontura"] },
            { q: "2. Você percebe que, apesar do medo, você ainda está respirando?", sugestoes: ["Sim, mas é difícil", "Estou tentando focar", "Não sinto bem", "Vou observar"] },
            { q: "3. O que aconteceria se você apenas observasse a sensação sem lutar?", sugestoes: ["Passaria mais rápido", "Sentiria menos medo", "Teria mais controle", "Tenho medo de tentar"] }
        ],
        analisar: () => "🚨 **Eu estou aqui com você...** Seu corpo está apenas tentando te proteger. Respire comigo, isso vai passar, eu prometo."
    },
    sobrecarga: {
        perguntas: [
            { q: "1. O que você está fazendo apenas para agradar aos outros?", sugestoes: ["Trabalho extra", "Dizendo sim sem querer", "Assumindo erros alheios", "Tentando ser perfeito"] },
            { q: "2. O que aconteceria se você fizesse apenas o essencial hoje?", sugestoes: ["Alguém ficaria bravo", "Eu teria descanso", "O mundo não pararia", "Me sentiria culpado"] },
            { q: "3. Você está tentando fazer tudo sozinho?", sugestoes: ["Sim, não confio", "Sim, não quero incomodar", "Sim, do meu jeito", "Ninguém ajuda"] }
        ],
        analisar: () => "📊 **Feedback:** Eu sei como é carregar o mundo nas costas. Mas você não é uma máquina. Descansar é uma necessidade."
    },
    solidao: {
        perguntas: [
            { q: "1. Você está sozinho por falta de pessoas ou por medo de se abrir?", sugestoes: ["Medo de julgamento", "Ninguém me procura", "Me sinto diferente", "Prefiro ficar na minha"] },
            { q: "2. O que essa solidão diz sobre seu relacionamento com você mesmo?", sugestoes: ["Não gosto de mim", "Me cobro demais", "Me sinto vazio", "Preciso de alguém"] },
            { q: "3. Qual pequena conexão você poderia fazer hoje?", sugestoes: ["Mandar um oi", "Ligar para alguém", "Falar com vizinho", "Sorrir para alguém"] }
        ],
        analisar: () => "📊 **Você não está sozinho nessa...** Esse silêncio às vezes machuca, mas você tem um valor imenso. Tente uma pequena conexão hoje."
    }
};

// 2. FUNÇÕES DE INTERFACE
function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `${text}<div class="time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function responder(text, callback, sugestoes = []) {
    typingIndicator.style.display = 'block';
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        addMessage(text, 'bot');
        if (sugestoes.length > 0) exibirSugestoes(sugestoes);
        if (callback) callback();
    }, 1000);
}

function exibirSugestoes(lista) {
    const container = document.createElement('div');
    container.className = 'sugestoes-container';
    lista.forEach(sug => {
        const btn = document.createElement('button');
        btn.className = 'sugestao-btn';
        btn.innerText = sug;
        btn.onclick = () => { userInput.value = sug; processarEntrada(); container.remove(); };
        container.appendChild(btn);
    });
    chatWindow.appendChild(container);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function exibirTopicos() {
    estadoAtual.tema = null;
    estadoAtual.aguardandoAtividade = false;
    const topicos = [
        { t: "✨ Momento Gratidão", v: "gratidao" },
        { t: "⚠️ Prevenção de Recaída", v: "recaida" },
        { t: "🌱 Reforma de Caráter", v: "carater" },
        { t: "😰 Ansiedade", v: "ansiedade" },
        { t: "🚨 Pânico / Medo", v: "panico" },
        { t: "🤯 Sobrecarga", v: "sobrecarga" },
        { t: "💔 Solidão", v: "solidao" }
    ];
    const container = document.createElement('div');
    container.className = 'topics-container';
    topicos.forEach(obj => {
        const btn = document.createElement('button');
        btn.className = 'topic-btn';
        btn.innerText = obj.t;
        btn.onclick = () => { iniciarFluxo(obj.v); container.remove(); };
        container.appendChild(btn);
    });
    chatWindow.appendChild(container);
}

function iniciarFluxo(tema) {
    estadoAtual.tema = tema;
    estadoAtual.etapa = 0;
    estadoAtual.respostas = [];
    estadoAtual.aguardandoAtividade = false;
    const p = fluxos[tema].perguntas[0];
    responder(p.q, null, p.sugestoes);
}

function processarEntrada() {
    const text = userInput.value.trim();
    if(!text) return;
    
    const antigas = document.querySelector('.sugestoes-container');
    if (antigas) antigas.remove();
    
    addMessage(text, 'user');
    userInput.value = '';

    // Filtro de Segurança
    const lower = text.toLowerCase();
    const termosRisco = ["matar", "suicidio", "fim da minha vida", "vou usar agora"];
    if (termosRisco.some(t => lower.includes(t))) {
        responder("🚨 Eu te entendo, a dor está grande. Mas por favor, respire comigo agora.", () => setTimeout(abrirSOS, 1000));
        return;
    }

    // Lógica de Atividade Física / Hobbies
    if (estadoAtual.aguardandoAtividade) {
        const dica = dicasAtividades[text] || "Movimentar o corpo ou focar em um passatempo é essencial para a higiene mental. Tente dedicar um tempo para si mesmo hoje!";
        responder(`🏃‍♂️ **Dica Prática:** ${dica}`, () => {
            setTimeout(() => responder("Espero que isso ajude. Eu acredito em você. Se precisar de mais apoio, estarei aqui.", exibirTopicos), 3000);
        });
        estadoAtual.aguardandoAtividade = false;
        return;
    }

    // Fluxo de Perguntas Temáticas
    if (estadoAtual.tema) {
        estadoAtual.respostas.push(text);
        estadoAtual.etapa++;
        const pergs = fluxos[estadoAtual.tema].perguntas;
        
        if (estadoAtual.etapa < pergs.length) {
            const prox = pergs[estadoAtual.etapa];
            responder(prox.q, null, prox.sugestoes);
        } else {
            const feedback = fluxos[estadoAtual.tema].analisar(estadoAtual.respostas);
            responder(feedback, () => {
                setTimeout(() => {
                    estadoAtual.aguardandoAtividade = true;
                    responder("Para te ajudar a deslogar desses pensamentos, qual dessas atividades você mais gosta ou sente falta de praticar?", null, Object.keys(dicasAtividades));
                }, 2000);
            });
            estadoAtual.tema = null;
        }
    } else {
        responder("Estou aqui. Escolha um tema para conversarmos:", exibirTopicos);
    }
}

// Funções SOS e Inicialização (Mantidas)
function abrirSOS() {
    document.getElementById('sos-overlay').style.display = 'flex';
    let s = 0;
    sosInterval = setInterval(() => {
        const c = document.getElementById('breath-circle');
        const t = document.getElementById('breath-text');
        if(c) c.style.transform = s === 0 ? "scale(1.4)" : "scale(1)";
        if(t) t.innerText = s === 0 ? "Inspirar" : "Expirar";
        s = s === 0 ? 1 : 0;
    }, 4000);
}
function fecharSOS() { document.getElementById('sos-overlay').style.display = 'none'; clearInterval(sosInterval); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); }
function reiniciarConversa() { chatWindow.innerHTML = ''; estadoAtual.tema = null; inicializarChat(); }
function inicializarChat() { responder("Olá. Sou seu guia de apoio. Vamos analisar o que está acontecendo?", exibirTopicos); }

userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") processarEntrada(); });
window.onload = inicializarChat;