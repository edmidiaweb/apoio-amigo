const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const typingIndicator = document.getElementById('typing-indicator');

let estadoAtual = { tema: null, etapa: 0, respostas: [] };
let sosInterval;

const fluxos = {
    recaida: {
        perguntas: [
            {
                q: "1. Qual pensamento ou sentimento 'perigoso' você está alimentando agora?",
                sugestoes: ["Raiva de alguém", "Tédio profundo", "Acho que ninguém me entende", "Vontade de fugir de tudo"]
            },
            {
                q: "2. Do que você está tentando fugir ou o que está tentando anestesiar agora?",
                sugestoes: ["Uma dor do passado", "Frustração com o trabalho", "Medo do futuro", "Solidão insuportável"]
            },
            {
                q: "3. Se você agir por impulso agora, como vai se sentir daqui a 15 minutos?",
                sugestoes: ["Arrependido e culpado", "Fracassado", "Com medo das consequências", "Terei que recomeçar do zero"]
            }
        ],
        analisar: (res) => {
            const r = res.join(" ").toLowerCase();
            let base = "Amigo, eu te entendo perfeitamente... Eu sei como você está se sentindo agora, essa pressão parece insuportável. Eu já passei por momentos onde a única vontade era parar de sentir. ";
            
            if (r.includes("cansei") || r.includes("fugir")) 
                return `🚨 ${base} Mas escute: o cansaço está mentindo para você. Não tome uma decisão permanente por causa de um sentimento temporário. Apenas respire, isso vai passar.`;
            
            return `🚨 ${base} Você já deu o passo mais difícil que é admitir o que está sentindo. Agora, não lute sozinho. Desmonte essa arma, mude de lugar e fale com alguém que você confia.`;
        }
    },
    carater: {
        perguntas: [
            {
                q: "1. Onde você permitiu que o egoísmo ou o medo guiassem suas ações hoje?",
                sugestoes: ["Menti para evitar conflito", "Fui rude com alguém", "Pensei só no meu benefício", "Fui preguiçoso"]
            },
            {
                q: "2. Você agiu com desonestidade ou tentou manipular algo hoje?",
                sugestoes: ["Omiti uma verdade", "Exagerei uma história", "Tentei controlar alguém", "Fui totalmente honesto"]
            },
            {
                q: "3. O seu orgulho impediu você de ser útil ou de admitir um erro?",
                sugestoes: ["Não pedi desculpas", "Achei que era melhor que os outros", "Não aceitei uma crítica", "Fiquei com raiva"]
            }
        ],
        analisar: (res) => {
            const r = res.join(" ").toLowerCase();
            let base = "Eu te entendo... Olhar para nossas falhas dói muito e eu sei o peso que esse desconforto traz. Eu também já tentei esconder meus erros por medo. ";
            
            if (r.includes("menti") || r.includes("omiti")) 
                return `📊 ${base} Mas a verdade é a única coisa que vai te dar o sono tranquilo de volta. Repare esse erro assim que puder; você vai sentir um alívio enorme.`;
            
            return `📊 ${base} Ter coragem de fazer esse inventário já mostra que você é uma pessoa incrível em busca de melhora. Continue firme, a honestidade liberta a gente.`;
        }
    },
    ansiedade: {
        perguntas: [
            {
                q: "1. O que exatamente você está tentando controlar no futuro agora?",
                sugestoes: ["Finanças/Contas", "Opinião dos outros", "Saúde/Doença", "O resultado de algo"]
            },
            {
                q: "2. Esse medo é sobre algo real ou é um pensamento repetitivo?",
                sugestoes: ["Pensamento em loop", "Problema real", "Não sei dizer", "Medo do que pode vir"]
            },
            {
                q: "3. O que de pior aconteceria se você soltasse esse controle por 5 minutos?",
                sugestoes: ["Ficaria sem rumo", "Nada mudaria", "Teria que aceitar", "Teria paz"]
            }
        ],
        analisar: (res) => {
            let base = "Eu sei exatamente como é esse aperto no peito... Eu te entendo, parece que o mundo vai desabar se a gente não resolver tudo agora. Eu já passei por noites em claro exatamente assim. ";
            return `📊 ${base} Mas tente lembrar: você não precisa resolver a sua vida inteira hoje. Foque apenas no próximo minuto. Você está seguro agora.`;
        }
    },
    panico: {
        perguntas: [
            {
                q: "1. Onde você sente o desconforto no corpo agora?",
                sugestoes: ["Peito apertado", "Falta de ar", "Tremores/Suor", "Tontura"]
            },
            {
                q: "2. Você percebe que, apesar do medo, você ainda está respirando?",
                sugestoes: ["Sim, mas é difícil", "Estou tentando focar", "Não consigo sentir", "Vou observar"]
            },
            {
                q: "3. O que aconteceria se você apenas observasse a sensação sem lutar contra ela?",
                sugestoes: ["Passaria mais rápido", "Sentiria menos medo", "Teria mais controle", "Tenho medo de tentar"]
            }
        ],
        analisar: () => {
            return "🚨 **Eu estou aqui com você...** Eu sei como essa sensação é assustadora, eu já senti esse medo de perder o controle. Mas olhe para mim: seu corpo só está tentando te proteger, ele não vai te machucar. Respire comigo, isso vai passar em instantes, eu prometo.";
        }
    },
    sobrecarga: {
        perguntas: [
            {
                q: "1. O que você está fazendo apenas para agradar aos outros?",
                sugestoes: ["Trabalho extra", "Dizendo sim sem querer", "Assumindo erros alheios", "Tentando ser perfeito"]
            },
            {
                q: "2. O que aconteceria se você fizesse apenas o essencial hoje?",
                sugestoes: ["Alguém ficaria bravo", "Eu teria descanso", "O mundo não pararia", "Me sentiria culpado"]
            },
            {
                q: "3. Você está tentando fazer tudo sozinho?",
                sugestoes: ["Sim, não confio", "Sim, não quero incomodar", "Sim, do meu jeito", "Ninguém ajuda"]
            }
        ],
        analisar: (res) => {
            let base = "Eu te entendo tanto... Eu sei como é carregar o mundo nas costas e sentir que, se você soltar, tudo quebra. Eu já me senti exausto tentando ser tudo para todos. ";
            return `📊 ${base} Mas você não é uma máquina. Descansar não é um erro, é uma necessidade. Comece a dizer 'não' por você. Sua paz vale muito.`;
        }
    },
    solidao: {
        perguntas: [
            {
                q: "1. Você está sozinho por falta de pessoas ou por medo de se abrir?",
                sugestoes: ["Medo de julgamento", "Ninguém me procura", "Me sinto diferente", "Prefiro ficar na minha"]
            },
            {
                q: "2. O que essa solidão diz sobre seu relacionamento com você mesmo?",
                sugestoes: ["Não gosto da minha companhia", "Me cobro demais", "Me sinto vazio", "Preciso de alguém"]
            },
            {
                q: "3. Qual pequena conexão você poderia fazer hoje?",
                sugestoes: ["Mandar um oi", "Ligar para alguém", "Falar com vizinho", "Sorrir para alguém"]
            }
        ],
        analisar: () => {
            return "📊 **Você não está sozinho nessa...** Eu te entendo, esse silêncio em volta da gente às vezes machuca. Eu já passei por dias em que parecia que ninguém se importava. Mas saiba que você tem um valor imenso. Tente uma conexão pequena hoje, apenas para quebrar esse gelo. Eu acredito em você.";
        }
    }
};

function addMessage(text, type) {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    div.innerHTML = `${text}<div class="time">${time}</div>`;
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
        btn.onclick = () => {
            userInput.value = sug;
            processarEntrada();
            container.remove();
        };
        container.appendChild(btn);
    });
    chatWindow.appendChild(container);
    chatWindow.scrollTop = chatWindow.scrollHeight;
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
    const primeiraPerg = fluxos[tema].perguntas[0];
    responder(primeiraPerg.q, null, primeiraPerg.sugestoes);
}

function processarEntrada() {
    const text = userInput.value.trim();
    if(!text) return;

    // Remover sugestões antigas da tela ao enviar manualmente
    const antigas = document.querySelector('.sugestoes-container');
    if (antigas) antigas.remove();

    addMessage(text, 'user');
    userInput.value = '';
    const lower = text.toLowerCase();

    // Filtro de Risco
    const termosRisco = ["matar", "suicidio", "fim da minha vida", "vou usar agora", "beber agora"];
    if (termosRisco.some(t => lower.includes(t))) {
        responder("🚨 RISCO DETECTADO. Foque na sua respiração e peça ajuda agora.", () => setTimeout(abrirSOS, 1000));
        return;
    }

    if (estadoAtual.tema) {
        estadoAtual.respostas.push(text);
        estadoAtual.etapa++;
        const perguntas = fluxos[estadoAtual.tema].perguntas;

        if (estadoAtual.etapa < perguntas.length) {
            const prox = perguntas[estadoAtual.etapa];
            responder(prox.q, null, prox.sugestoes);
        } else {
            const feedback = fluxos[estadoAtual.tema].analisar(estadoAtual.respostas);
            responder(feedback, () => {
                setTimeout(() => responder("Espero que fique bem. Eu acredito em você.", exibirTopicos), 2000);
            });
            estadoAtual.tema = null;
        }
    } else {
        let identificado = false;
        for (let t in fluxos) {
            if (lower.includes(t)) { iniciarFluxo(t); identificado = true; break; }
        }
        if (!identificado) responder("Como posso ajudar?", exibirTopicos);
    }
}

function toggleTheme() { document.body.classList.toggle('dark-mode'); }
function reiniciarConversa() { chatWindow.innerHTML = ''; estadoAtual.tema = null; inicializarChat(); }

function abrirSOS() {
    document.getElementById('sos-overlay').style.display = 'flex';
    let s = 0;
    sosInterval = setInterval(() => {
        const circle = document.getElementById('breath-circle');
        const text = document.getElementById('breath-text');
        if(circle) circle.style.transform = s === 0 ? "scale(1.4)" : "scale(1)";
        if(text) text.innerText = s === 0 ? "Inspirar" : "Expirar";
        s = s === 0 ? 1 : 0;
    }, 4000);
}

function fecharSOS() { document.getElementById('sos-overlay').style.display = 'none'; clearInterval(sosInterval); }

function inicializarChat() {
    responder("Olá. Sou seu guia. Vamos analisar o que está acontecendo hoje?", exibirTopicos);
}

userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") processarEntrada(); });
window.onload = inicializarChat;