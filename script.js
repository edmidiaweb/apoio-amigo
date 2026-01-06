/**
 * SCRIPT.JS - Motor de Apoio Amigo
 * Inclui: Sistema Especialista, Feedbacks Direcionados e Filtro de Emergência.
 */

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');

// 1. CONFIGURAÇÃO DOS FLUXOS (3 Perguntas + Feedbacks Especialistas)
const fluxos = {
    recaida: {
        perguntas: [
            "1. Qual pensamento ou sentimento 'perigoso' você está alimentando agora que te faz querer jogar tudo para o alto?",
            "2. Do que você está tentando fugir ou o que está tentando anestesiar agora (dor, tédio ou frustração)?",
            "3. Se você agir por impulso agora, como você vai se sentir exatamente 15 minutos após o erro?"
        ],
        analisar: (respostas) => {
            const r = respostas.join(" ").toLowerCase();
            if (r.includes("cansei") || r.includes("aguento") || r.includes("difícil"))
                return "🚨 **INTERVENÇÃO:** O cansaço é o maior inimigo da sobriedade. Não tome decisões permanentes baseadas em sentimentos temporários. Sua mente está mentindo para você agora. PARE e apenas respire.";
            if (r.includes("controle") || r.includes("eu sei") || r.includes("consigo sozinho"))
                return "🚨 **INTERVENÇÃO:** O excesso de confiança precede a queda. No momento em que você acha que não precisa de ajuda, você está mais vulnerável. Ligue para alguém imediatamente.";
            if (r.includes("raiva") || r.includes("merece") || r.includes("ódio"))
                return "🚨 **INTERVENÇÃO:** A raiva é um veneno que você toma esperando que o outro morra. O seu erro não punirá ninguém além de você mesmo. Solte essa brasa antes que ela te queime.";
            return "🚨 **INTERVENÇÃO:** Você identificou o gatilho, agora desmonte a arma. Saia de onde está, mude o ambiente e fale com alguém. O impulso é uma onda: ela sobe, mas sempre desce.";
        }
    },
    carater: {
        perguntas: [
            "1. Onde você permitiu que o egoísmo ou o medo guiassem suas ações hoje?",
            "2. Você agiu com desonestidade ou tentou manipular alguma situação para seu benefício?",
            "3. O seu orgulho impediu você de ser útil a alguém ou de admitir um erro?"
        ],
        analisar: (respostas) => {
            const r = respostas.join(" ").toLowerCase();
            if (r.includes(" mas ") || r.includes("porque")) 
                return "📊 **Feedback:** Cuidado com as justificativas. Explicar o erro é uma forma de não aceitá-lo. Admita sua falha de forma nua e crua para poder crescer.";
            if (r.includes("ele ") || r.includes("ela ") || r.includes("eles"))
                return "📊 **Feedback:** Você está focando no erro alheio. O inventário é sobre a SUA responsabilidade. O que VOCÊ poderia ter feito de diferente?";
            if (r.includes("menti") || r.includes("escondi"))
                return "📊 **Feedback:** A desonestidade é o veneno da alma. Vá e repare isso agora. A transparência absoluta é sua única proteção contra a culpa.";
            if (r.length < 15)
                return "📊 **Feedback:** A reforma íntima exige profundidade. Suas respostas foram superficiais. Tente mergulhar mais fundo na próxima vez.";
            return "📊 **Feedback:** A honestidade rigorosa liberta. Continue fazendo seu inventário diário sem medo de encarar suas sombras.";
        }
    },
    ansiedade: {
        perguntas: [
            "1. O que exatamente você está tentando controlar no futuro agora?",
            "2. Esse medo é sobre algo real que está acontecendo ou é apenas um pensamento repetitivo?",
            "3. O que de pior aconteceria se você soltasse esse controle por 5 minutos?"
        ],
        analisar: (respostas) => {
            const r = respostas.join(" ").toLowerCase();
            if (r.includes("tudo") || r.includes("sempre")) 
                return "📊 **Feedback:** Você está sofrendo por onipotência. Pare de tentar controlar o incontrolável. Foque apenas no que você pode fazer nos próximos 10 minutos.";
            return "📊 **Feedback:** A ansiedade é o nome que damos à nossa tentativa de ser Deus e prever o futuro. Aceite sua limitação e volte para o presente.";
        }
    },
    sobrecarga: {
        perguntas: [
            "1. Quais dessas tarefas você está fazendo apenas para agradar aos outros ou por medo de dizer não?",
            "2. O que aconteceria se você fizesse apenas o essencial hoje e deixasse o resto para amanhã?",
            "3. Você está tentando fazer tudo sozinho por perfeccionismo ou desconfiança dos outros?"
        ],
        analisar: (respostas) => {
            const r = respostas.join(" ").toLowerCase();
            if (r.includes("agradar") || r.includes("medo")) 
                return "📊 **Feedback:** Você está sendo escravo da aprovação alheia. Dizer não para os outros é dizer sim para sua própria paz.";
            return "📊 **Feedback:** Você não é uma máquina. Aprenda a delegar e aceite que o 'bom o suficiente' já é o bastante para hoje.";
        }
    },
    solidao: {
        perguntas: [
            "1. Você está sozinho por falta de pessoas ou por medo de se abrir e ser julgado?",
            "2. O que essa solidão está tentando te dizer sobre o seu relacionamento consigo mesmo?",
            "3. Qual pequena ação de conexão você poderia fazer agora (uma mensagem ou um oi)?"
        ],
        analisar: (respostas) => {
            return "📊 **Feedback:** A solidão é um convite ao autoconhecimento, mas o isolamento é uma armadilha. Quebre o ciclo: estenda a mão para alguém agora.";
        }
    },
    panico: {
        perguntas: [
            "1. Onde você sente o desconforto no corpo agora e o que sua mente diz que vai acontecer?",
            "2. Você percebe que, apesar do medo, seus pulmões ainda estão funcionando e seu coração está batendo por você?",
            "3. O que aconteceria se você parasse de lutar contra a sensação e apenas deixasse ela passar?"
        ],
        analisar: () => "🚨 **Feedback:** O pânico é um alarme falso. Não lute contra ele. Sinta seus pés no chão e deixe a onda passar. Ela sempre passa."
    }
};

// 2. GERENCIAMENTO DE ESTADO
let estadoAtual = { tema: null, etapa: 0, respostas: [] };
let sosInterval;

// 3. FUNÇÕES DE INTERAÇÃO
function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    div.innerHTML = `${text}<div class="time">${time}</div>`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function responder(text, callback) {
    typingIndicator.style.display = 'block';
    setTimeout(() => {
        typingIndicator.style.display = 'none';
        addMessage(text, 'bot');
        if(callback) callback();
    }, 1200);
}

function exibirTopicos() {
    if (estadoAtual.tema) return;
    const topicos = [
        { t: "⚠️ Prevenção de Recaída", v: "recaida" },
        { t: "🌱 Reforma de Caráter", v: "carater" },
        { t: "😰 Ansiedade", v: "ansiedade" },
        { t: "🚨 Pânico", v: "panico" },
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
    responder(fluxos[tema].perguntas[0]);
}

// 4. MOTOR DE PROCESSAMENTO
function processarEntrada() {
    const text = userInput.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    userInput.value = '';
    const lower = text.toLowerCase();

    // --- FILTRO DE SEGURANÇA CRÍTICA ---
    const termosRisco = ["matar", "suicidio", "desistir de tudo", "vou usar agora", "beber agora", "fim da minha vida"];
    if (termosRisco.some(termo => lower.includes(termo))) {
        responder("🚨 DETECTADO RISCO IMEDIATO. Por favor, foque na sua respiração agora. Não tome nenhuma decisão.", () => {
            setTimeout(abrirSOS, 1500);
        });
        return;
    }

    // Fluxo de Perguntas
    if (estadoAtual.tema) {
        estadoAtual.respostas.push(text);
        estadoAtual.etapa++;
        const perguntas = fluxos[estadoAtual.tema].perguntas;

        if (estadoAtual.etapa < perguntas.length) {
            responder(perguntas[estadoAtual.etapa]);
        } else {
            const feedback = fluxos[estadoAtual.tema].analisar(estadoAtual.respostas);
            responder(feedback, () => {
                setTimeout(() => responder("Como se sente após essa reflexão? Escolha outro tema se precisar.", exibirTopicos), 2500);
            });
            estadoAtual.tema = null;
        }
    } else {
        // Tentativa de identificar tema por texto livre
        let identificado = false;
        for (let t in fluxos) {
            if (lower.includes(t)) { iniciarFluxo(t); identificado = true; break; }
        }
        if (!identificado) {
            responder("Como posso te apoiar agora? Escolha um tema abaixo:", exibirTopicos);
        }
    }
}

// 5. UTILITÁRIOS E SOS
function toggleTheme() { document.body.classList.toggle('dark-mode'); }

function reiniciarConversa() { 
    chatWindow.innerHTML = ''; 
    estadoAtual.tema = null; 
    inicializarChat(); 
}

function abrirSOS() {
    document.getElementById('sos-overlay').style.display = 'flex';
    let s = 0;
    sosInterval = setInterval(() => {
        const circle = document.getElementById('breath-circle');
        const text = document.getElementById('breath-text');
        if(circle) circle.style.transform = s === 0 ? "scale(1.4)" : "scale(1)";
        if(text) text.innerText = s === 0 ? "Inspirar" : "Expira";
        s = s === 0 ? 1 : 0;
    }, 4000);
}

function fecharSOS() {
    document.getElementById('sos-overlay').style.display = 'none';
    clearInterval(sosInterval);
}

function inicializarChat() {
    responder("Olá. Sou seu guia de apoio. Vamos analisar o que está acontecendo hoje?", exibirTopicos);
}

// 6. LISTENERS
userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") processarEntrada(); });
window.onload = inicializarChat;