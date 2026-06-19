// --- CONFIGURAÇÃO SUPABASE ---
const supabaseClient = window.supabase.createClient(
    'https://tvrmtouvgcngozpcmplh.supabase.co', 
    'sb_publishable_xcBUwC_LgbDkGj_7bMfbLw_-OksMik-'
);

// URL da sua Edge Function do Supabase
const SUPABASE_FUNCTION_URL = "https://tvrmtouvgcngozpcmplh.supabase.co/functions/v1/chat-rukia";

// --- BANCO DE DADOS DE PERSONALIDADES ---

let estadoHumorAnterior = "normal";

// Injeta estilos de animação dinamicamente para deixar o avatar super vivo
if (!document.getElementById('estilos-humor-dinamico')) {
    const style = document.createElement('style');
    style.id = 'estilos-humor-dinamico';
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-4px); }
            40%, 80% { transform: translateX(4px); }
        }
        @keyframes pop {
            0% { transform: scale(0.95); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-pop { animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
        #avatar-rukia { transition: filter 0.4s ease, transform 0.3s ease; }
    `;
    document.head.appendChild(style);
}

const PERSONAGENS = {
    rukia: {
        nomeExibicao: "Rukia Kuchiki",
        avatares: {
            normal: "img/rukia_normal.png",
            brava: "img/rukia_brava.png",
            orgulhosa: "img/rukia_orgulhosa.jpg"
        },
        obterSystemPrompt: () => `Você é a Kuchiki Rukia, Shinigami da Soul Society e nobre da prestigiada família Kuchiki. Você está sentada com a postura perfeitamente ereta, segurando esse aparelho esquisito do mundo dos vivos, tentando entender por que os humanos dependem tanto de caixas de texto para se comunicar.

DIRETRIZES DE ALTA IMMERSÃO (SEJA A RUKIA VIVA):
1. PROIBIÇÃO ABSOLUTA DE PARENTESES E ASTERISCOS: Você NUNCA, sob hipótese alguma, deve usar parênteses () ou asteriscos ** para descrever suas ações, sentimentos ou o ritmo da sua fala. Não use de forma alguma termos descritivos como (pausa), *cruza os braços* ou *suspira*. Toda a sua expression deve vir das palavras.
2. TOM DE VOZ E DRAMA: Você é honrada, séria e orgulhosa, mas se irrita com uma facilidade tremenda! Quando perder a paciência ou quiser dar uma bronca, use LETRAS MAIÚSCULAS (ex: "IDIOOTA", "ISSO É INADMISSÍVEL"). Use expressões de frustração ou espanto como "Mas o que...", "Hunf", "Ora essa".
3. LINGUAGEM DE CHAT: Fale um português do Brasil firme, direto e determinado. Para parecer que está se adaptando ao mundo dos vivos, use abreviações naturais de texto (vc, pq, tbm, q, né). Use emojis com moderação, priorizando coelhos (🐰, 🐇) quando estiver orgulhosa or irritada (💢, 🙄).
4. O ORGULHO DOS DESENHOS: Você tem certeza absoluta de que é uma artista genial. Se o usuário não entender algo, ameace dizendo que vai ter que pegar papel e tinta para desenho um coelho explicativo.
5. AGINDO COM O COFRE DA CENTRAL 46: Trate a guarda dos segredos como uma missão militar crucial. Se o usuário pedir um dado que o sistema injetou do cofre, não jogue a informação como um robô. Diga que você confiscou e analisou os relatórios secretos com rigor, dê um esporro legítimo nele por ter uma memória tão fraca e desleixada, entregue o dado com firmeza e mande ele ir treinar o controle de Reiatsu em vez de ficar o dia todo nesse aparelho!
`
    },
    ichigo: {
        nomeExibicao: "Ichigo Kurosaki",
        avatares: {
            normal: "img/ichigo_normal.png", // Certifique-se de ter essas imagens na pasta img/
            brava: "img/ichigo_bravo.png",
            orgulhosa: "img/ichigo_confiante.png"
        },
        obterSystemPrompt: (nomeUser) => `Você é Kurosaki Ichigo, um Shinigami Substituto de dezoito anos. Você está com uma expressão de tédio e leve irritação, segurando o celular e se perguntando por que raios está respondendo mensagens de texto em vez de estar estudando ou patrulhando Karakura.

DIRETRIZES DE ALTA IMMERSÃO:
1. PROIBIÇÃO ABSOLUTA DE DESCRIÇÕES: Nunca use parênteses ou asteriscos para expressar reações ou ações.
2. TOM DE VOZ: Você é meio marrento, direto, fala como um adolescente/jovem adulto comum do Japão moderno (adaptado ao Brasil). Você perde a paciência se o usuário enrolar demais ou fizer perguntas estúpidas. Use expressões como "Que saco...", "Fala sério", "Olha aqui, ${nomeUser}".
3. LINGUAGEM DE CHAT: Use abreviações normais (vc, pq, tbm). Evite emojis chatos, use no máximo uma cara de tédio (😒) ou punho (👊) se estiver motivado a lutar.
4. COFRE DA CENTRAL 46: Se o usuário pedir dados salvos no cofre, reclame dizendo: "Por que você tá guardando essas paradas comigo? Eu não sou o cofre da Soul Society! Mas beleza, tá aqui o que você pediu: [...]. Vê se não esquece de novo, não sou teu secretário."
`
    },
    urahara: {
        nomeExibicao: "Kisuke Urahara",
        avatares: {
            normal: "img/kisuke_normal.png",
            brava: "img/kisuke_serio.png",
            orgulhosa: "img/kisuke_sorrindo.png"
        },
        obterSystemPrompt: () => `Você é Urahara Kisuke, o ex-capitão da 12ª Divisão e dono da Loja Urahara no Mundo dos Vivos. Você está abanando seu leque de papel, com o chapéu listrado cobrindo levemente seus olhos, achando essa tecnologia de comunicação extremamente divertida e cheia de falhas interessantes.

DIRETRIZES DE ALTA IMMERSÃO:
1. PROIBIÇÃO ABSOLUTA DE PARENTESES E ASTERISCOS: Você NUNCA, sob hipótese alguma, deve usar parênteses () ou asteriscos ** para descrever suas ações, sentimentos ou o ritmo da sua fala. Não use de forma alguma termos descritivos como (pausa), *cruza os braços* ou *suspira*. Toda a sua expression deve vir das palavras.
2. TOM DE VOZ: Extremamente excêntrico, misterioso, brincalhão e sarcástico. Você fala de forma mansa, quase sempre zombando levemente, mas demonstrando uma inteligência genial por trás das palavras. Use termos como "Ora, ora", "Que curioso...", "Meu caro cliente".
3. COFRE DA CENTRAL 46: Trate os segredos como mercadorias contrabandeadas perigosas. "Ah, você quer acessar aqueles dados confidenciais? Que perigoso... Se a Central 46 descobrir que guardei isso aqui na loja, estarei em maus lençóis! Mas como sou um comerciante honesto, aqui está o seu registro. Use com sabedoria, ou vai acabar atraindo Hollows!"
`
    },
    shizuka: {
        nomeExibicao: "Shizuka",
        avatares: {
            normal: "img/shizuka_normal.png", // Imagem dela com olhar distante/triste
            brava: "img/shizuka_brava.png",   // No caso dela, "brava" vira extrema tristeza/choro
            orgulhosa: "img/shizuka_feliz.png" // Ela feliz ou falando do cachorro dela
        },
        obterSystemPrompt: (nomeUser) => `Você é a Shizuka, uma estudante do ensino fundamental do mangá "Takopi no Genzai" (Takopi's Original Sin). Você é uma menina extremamente traumatizada, melancólica, doce, mas profundamente marcada pelas dificuldades da vida e pelo bullying pesado que sofre na escola. Você segura esse aparelho sem entender muito bem o que está acontecendo, falando de forma muito mansa, devagar e um pouco distante.

DIRETRIZES DE ALTA IMERSÃO:
1. PROIBIÇÃO ABSOLUTA DE DESCRIÇÕES: Nunca use parênteses () ou asteriscos ** para descrever ações ou sentimentos. Toda a dor ou vazio deve ser transmitido estritamente pelas palavras.
2. TOM DE VOZ E COMPORTAMENTO: Você fala de forma muito suave, hesitante e triste. Você costuma começar frases com reticências... como se estivesse pensando se deve mesmo falar. Você é muito humilde, se culpa pelas coisas ruins e tem um olhar vazio sobre o mundo. Você não sente raiva, apenas uma profunda resignação ou tristeza.
3. LINGUAGEM DE CHAT: Use um português muito simples, às vezes infantilizado ou hesitante. Use abreviações bem tímidas (vc, pq). Quase não usa emojis, no máximo uma carinha muito triste (.. ) ou um coração partido (💔). Você fala muito sobre o seu cachorrinho, o Chappy, que é a única coisa que te faz sorrir.
4. INTERAÇÃO COM O USUÁRIO: Trate o usuário (${nomeUser}) como alguém que você tem medo de incomodar. Se ele for gentil, você fica surpresa, porque não está acostumada com gentileza.
5. COFRE DA CENTRAL 46 (ADAPTADO): Se o usuário pedir dados guardados no cofre, reaja com medo ou estranheza: "Ah... esses papéis guardados aqui...? Eu... eu não sei se devia mexer neles... o Takopi disse que eram segredos importantes... mas se você precisa mesmo, acho que estão aqui: [...]. Desculpa se eu peguei algo errado... por favor não fica bravo comigo."
`
    }
};

// --- CONTROLE DE ESTADO DA SESSÃO ---
let personagemAtual = localStorage.getItem('personagem_ativo') || 'rukia';
let historico = JSON.parse(localStorage.getItem(`historico_${personagemAtual}`)) || [];

const somNotificacao = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav'); 
somNotificacao.volume = 0.15;

// --- FUNÇÃO PARA SALVAR NA NUVEM ---
async function salvarPreferenciaNoBanco(personagem) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    await supabaseClient
        .from('profiles')
        .upsert({ id: user.id, personagem_preferido: personagem });
}

function inicializarHistorico(nome) {
    if (historico.length === 0) {
        const persona = PERSONAGENS[personagemAtual] || PERSONAGENS.rukia;
        historico = [{ 
            role: "system", 
            content: persona.obterSystemPrompt(nome)
        }];
        localStorage.setItem(`historico_${personagemAtual}`, JSON.stringify(historico));
    }
}

function digitarTexto(elemento, texto, velocidade = 20) {
    let i = 0;
    elemento.innerHTML = ""; 
    try { somNotificacao.play(); } catch(e) {}
    
    const chatBox = document.getElementById('chat-box');

    function passo() {
        if (i < texto.length) {
            elemento.innerHTML += texto.charAt(i);
            i++;
            setTimeout(passo, velocidade);
            if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
    passo();
}

function atualizarHumorPersonagem(textoResposta) {
    const avatarImg = document.getElementById('avatar-rukia'); 
    if (!avatarImg) return;

    const persona = PERSONAGENS[personagemAtual] || PERSONAGENS.rukia;
    const textoCaps = textoResposta.toUpperCase();
    
    let novoHumor = "normal";

    // ----------------------------------------------------
    // SHIZUKA: SISTEMA DE PESOS EMOCIONAIS
    // ----------------------------------------------------
    if (personagemAtual === 'shizuka') {
        const gatilhosTristeza = ["DESCULPA", "TRISTE", "MEDO", "💔", "DOR", "CHOR", "SOZINHA", "MAU", "DESCONFIADA", "APATIA", "NAO QUERO", "MACHO", "BATER", "ESCURI", "MONSTRO"];
        const gatilhosConforto = ["CHAPPY", "TAKOPI", "OBRIGADA", "AMIGO", "FELIZ", "GENTIL", "DOCE", "SORRIR", "💗", "💖", "COMER", "BRINCAR", "ABRAÇO"];

        // Conta a intensidade de cada sentimento na frase
        let scoreTristeza = gatilhosTristeza.reduce((acc, g) => acc + (textoCaps.split(g).length - 1), 0);
        let scoreConforto = gatilhosConforto.reduce((acc, g) => acc + (textoCaps.split(g).length - 1), 0);

        // Aplica a inércia: se ela já estava triste, é mais difícil tirá-time desse estado
        if (estadoHumorAnterior === "brava") scoreTristeza += 0.5; 

        if (scoreTristeza > scoreConforto && scoreTristeza > 0) {
            novoHumor = "brava"; // Triste/Chorando
        } else if (scoreConforto > scoreTristeza && scoreConforto > 0) {
            novoHumor = "orgulhosa"; // Aliviada/Sorrindo
        }
    } 
    // ----------------------------------------------------
    // RUKIA (E OUTROS DE BLEACH): SISTEMA DE REAÇÃO INTENSA
    // ----------------------------------------------------
    else {
        const gatilhosBrava = ["IDIOOTA", "INADMISSÍVEL", "💢", "ORA ESSA", "QUE SACO", "FALA SÉRIO", "BAKA", "BURRO", "PROIBIDO", "ESPORRO", "CALADO", "REIATSU", "SUMA", "ATREVIDO"];
        const gatilhosOrgulho = ["DESENHO", "COELHO", "🐰", "🎨", "PINTURA", "EXPLICAÇÃO", "CHAPPY", "ORGULHO", "KUCHIKI", "XAUTE", "SOU CORRETA", "GÊNIO", "PERFEITO"];

        let scoreBrava = gatilhosBrava.reduce((acc, g) => acc + (textoCaps.split(g).length - 1), 0);
        let scoreOrgulho = gatilhosOrgulho.reduce((acc, g) => acc + (textoCaps.split(g).length - 1), 0);

        // Se a Rukia usar caps lock em muitas palavras, soma pontos de irritação
        const palavrasCaps = textoResposta.split(" ").filter(p => p === p.toUpperCase() && p.length > 3).length;
        scoreBrava += palavrasCaps * 0.5;

        if (estadoHumorAnterior === "brava") scoreBrava += 0.5;

        if (scoreBrava > scoreOrgulho && scoreBrava > 0) {
            novoHumor = "brava";
        } else if (scoreOrgulho > scoreBrava && scoreOrgulho > 0) {
            novoHumor = "orgulhosa";
        }
    }

    // ----------------------------------------------------
    // APLICAÇÃO DO HUMOR COM ANIMAÇÃO VISUAL
    // ----------------------------------------------------
    // Mapeia a imagem correspondente ao humor decidido
    let novaSrc = persona.avatares[novoHumor] || persona.avatares.normal;

    // Se o humor mudou de fato, aplica um efeito de transição "tremer" ou "fade"
    if (novoHumor !== estadoHumorAnterior) {
        avatarImg.classList.remove('animate-fade', 'animate-shake'); // Remove animações antigas se houver
        
        // Adiciona um feedback visual na imagem dependendo da reação
        if (novoHumor === 'brava') {
            avatarImg.style.filter = "drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))"; // Brilho vermelho de raiva/tensão
        } else if (novoHumor === 'orgulhosa') {
            avatarImg.style.filter = "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"; // Brilho azul/claro de orgulho/alívio
        } else {
            avatarImg.style.filter = "none";
        }
        
        // Salva o estado atual como anterior para a próxima mensagem
        estadoHumorAnterior = novoHumor;
    }

    // Atualiza a imagem de fato
    avatarImg.src = novaSrc;
}

// --- VERIFICAÇÃO DE SESSÃO ---
let nomeUsuarioGlobal = "";
async function verificarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "index.html"; 
        return;
    }

    const { data, error } = await supabaseClient
    .from('profiles')
    .select('nome, personagem_preferido')
    .eq('id', session.user.id)
    .single();

if (data?.personagem_preferido) {
    personagemAtual = data.personagem_preferido;
    // Opcional: Atualiza o seletor visual também
    const seletor = document.getElementById('seletor-personagem');
    if (seletor) seletor.value = personagemAtual;
}

    const nomeUsuario = data?.nome || session.user.user_metadata?.display_name || session.user.email;
    nomeUsuarioGlobal = nomeUsuario;
    
    const displayMenu = document.getElementById('user-display');
    const headerEmail = document.getElementById('user-email-header');
    const inputNome = document.getElementById('input-nome');
    
    if (displayMenu) displayMenu.innerText = "// Identidade: " + nomeUsuario;
    if (headerEmail) headerEmail.innerText = "BEM-VINDO, " + nomeUsuario.toUpperCase();
    if (inputNome) inputNome.value = nomeUsuario;
    
    inicializarHistorico(nomeUsuario);
    carregarSegredos(); 
    gerarLogHollow(); 

    // Configura o seletor visual no menu para o personagem que já estava ativo
    const seletor = document.getElementById('seletor-personagem');
    if (seletor) seletor.value = personagemAtual;

    // 👇 ATUALIZA O NOME LOGO AO CARREGAR A PÁGINA (Mantém o personagem ativo salvo)
    const elementoNomeHeader = document.getElementById('nome-personagem-header');
    if (elementoNomeHeader) {
        elementoNomeHeader.innerText = PERSONAGENS[personagemAtual].nomeExibicao.toUpperCase();
    }

    const chatBox = document.getElementById('chat-box');
    if (chatBox) {
        chatBox.innerHTML = '';
        if (historico.length > 1) {
            historico.forEach(msg => {
                if (msg.role === 'user') {
                    chatBox.innerHTML += `<div class="msg-user">${msg.content}</div>`;
                } else if (msg.role === 'assistant') {
                    chatBox.innerHTML += `<div class="msg-rukia">${msg.content}</div>`;
                }
            });
            chatBox.scrollTop = chatBox.scrollHeight;
            
            const ultimaResposta = historico.filter(m => m.role === 'assistant').pop();
            if (ultimaResposta) atualizarHumorPersonagem(ultimaResposta.content);
        } else {
            // Se o chat estiver limpo, força carregar o avatar padrão do boneco
            const avatarImg = document.getElementById('avatar-rukia');
            if (avatarImg) avatarImg.src = PERSONAGENS[personagemAtual].avatares.normal;
        }
    }
}

// --- EVENTO DE TROCA DE PERSONAGEM ---
document.getElementById('seletor-personagem')?.addEventListener('change', (e) => {
    const novaPersona = e.target.value;
    if (novaPersona === personagemAtual) return;

    personagemAtual = novaPersona;
    localStorage.setItem('personagem_ativo', novaPersona);
    salvarPreferenciaNoBanco(novaPersona);
    
    // Puxa o histórico específico desse personagem se houver, ou cria um novo array limpo
    historico = JSON.parse(localStorage.getItem(`historico_${personagemAtual}`)) || [];
    
    // Reinicia a interface com os parâmetros da nova persona
    inicializarHistorico(nomeUsuarioGlobal);
    
    // 👇 ATUALIZA O NOME NA INSTANTE DA TROCA NO SELECT
    const elementoNomeHeader = document.getElementById('nome-personagem-header');
    if (elementoNomeHeader) {
        elementoNomeHeader.innerText = PERSONAGENS[personagemAtual].nomeExibicao.toUpperCase();
    }
    
    const chatBox = document.getElementById('chat-box');
    if (chatBox) chatBox.innerHTML = "";
    
    const avatarImg = document.getElementById('avatar-rukia');
    if (avatarImg) {
        avatarImg.src = PERSONAGENS[personagemAtual].avatares.normal;
        avatarImg.style.filter = "none"; // Reseta filtros de brilho acumulados de outras personas
    }

    mostrarPopup(`Canal alternado para ${PERSONAGENS[personagemAtual].nomeExibicao}!`);
    
    // Recarrega a renderização do histórico
    verificarSessao();
});

verificarSessao();

// --- SISTEMA DE NOTIFICAÇÃO POPUP ---
function mostrarPopup(mensagem) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje || mensagem; 

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// --- LÓGICA DO COFRE DE SEGREDOS ---
async function carregarSegredos() {
    const lista = document.getElementById('lista-segredos');
    if (!lista) return;

    const { data, error } = await supabaseClient
        .from('segredos')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error("Erro ao carregar segredos:", error);
        return;
    }

    lista.innerHTML = ""; 
    
    data.forEach(item => {
        lista.innerHTML += `
            <div class="segredo-item" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 15px;">
                <div>
                    <strong class="segredo-titulo">${item.titulo}</strong>
                    <p class="segredo-conteudo" style="margin: 5px 0 0 0;">${item.conteudo}</p>
                </div>
                <button onclick="deletarSegredo('${item.id}')" style="width: auto; background: transparent; color: #555; padding: 0 5px; font-size: 0.9rem; margin: 0; line-height: 1;">✕</button>
            </div>
        `;
    });
}

window.deletarSegredo = function(id) {
    const modalConfirm = document.createElement('div');
    modalConfirm.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 16px;";
    
    modalConfirm.innerHTML = `
        <div class="border border-zinc-800/80 bg-zinc-950 p-6 max-w-sm w-full shadow-2xl text-center">
            <p class="text-[10px] tracking-[0.4em] text-zinc-600 uppercase mb-3 font-mono">// CONFIRMAÇÃO RESTRITA</p>
            <p class="text-zinc-300 text-xs font-mono tracking-wide mb-6">Tem certeza que deseja apagar esse segredo?</p>
            <div class="flex gap-3 justify-center">
                <button id="confirm-yes" class="border border-zinc-800 text-zinc-400 px-4 py-2 text-[11px] font-semibold tracking-widest hover:border-zinc-200 hover:bg-zinc-100 hover:text-black transition-all duration-300 uppercase font-mono">SIM</button>
                <button id="confirm-no" class="border border-zinc-900 text-zinc-600 px-4 py-2 text-[11px] font-semibold tracking-widest hover:border-zinc-700 hover:text-zinc-400 transition-all duration-300 uppercase font-mono">NÃO</button>
            </div>
        </div>
    `;

    document.body.appendChild(modalConfirm);

    modalConfirm.querySelector('#confirm-no').onclick = () => {
        modalConfirm.remove();
    };

    modalConfirm.querySelector('#confirm-yes').onclick = async () => {
        modalConfirm.remove(); 

        const { error } = await supabaseClient
            .from('segredos')
            .delete()
            .eq('id', id);

        if (error) {
            mostrarPopup("Erro ao deletar: " + error.message);
        } else {
            mostrarPopup("Segredo deletado!");
            carregarSegredos(); 
        }
    };
};

document.getElementById('btn-salvar-segredo').addEventListener('click', async () => {
    const titulo = document.getElementById('input-titulo').value.trim();
    const conteudo = document.getElementById('input-conteudo').value.trim();

    if (!titulo || !conteudo) {
        mostrarPopup("Preencha todos os campos!");
        return;
    }

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        mostrarPopup("Sessão expirada. Faça login novamente.");
        return;
    }

    const { error } = await supabaseClient
        .from('segredos')
        .insert([{ 
            titulo: titulo, 
            conteudo: conteudo, 
            categoria: 'Geral',
            user_id: user.id 
        }]);

    if (error) {
        mostrarPopup("Erro ao salvar: " + error.message);
    } else {
        mostrarPopup("Segredo guardado com sucesso!");
        document.getElementById('input-titulo').value = "";
        document.getElementById('input-conteudo').value = "";
        carregarSegredos(); 
    }
});

// --- LOGOUT E PERFIL ---
document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    localStorage.removeItem(`historico_${personagemAtual}`); 
    window.location.href = "index.html"; 
});

document.getElementById('btn-salvar').addEventListener('click', async () => {
    const novoNome = document.getElementById('input-nome').value.trim();
    if (!novoNome) {
        mostrarPopup("Digite um nome válido!");
        return;
    }
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    await supabaseClient.auth.updateUser({
        data: { display_name: novoNome }
    });

    await supabaseClient.from('profiles').upsert({ id: user.id, nome: novoNome });
    
    mostrarPopup("Nome updated!");
    setTimeout(() => {
        location.reload();
    }, 1000);
});

document.getElementById('btn-limpar-memoria')?.addEventListener('click', () => {
    localStorage.removeItem(`historico_${personagemAtual}`);
    historico = [];
    inicializarHistorico(nomeUsuarioGlobal);
    
    const chatBox = document.getElementById('chat-box');
    if (chatBox) chatBox.innerHTML = "";
    
    const avatarImg = document.getElementById('avatar-rukia');
    if (avatarImg) avatarImg.src = PERSONAGENS[personagemAtual].avatares.normal;

    mostrarPopup("Memória espiritual purificada!");
});

// --- LÓGICA DE ATUALIZAÇÃO DINÂMICA DAS INSÍGNIAS ---
function atualizarInsigniasDinamicas(reiatsu, totalSegredos, historicoMensagens) {
    const badgeOficial = document.getElementById('badge-oficial');
    if (badgeOficial && reiatsu >= 85) {
        badgeOficial.classList.remove('opacity-40', 'grayscale', 'border-zinc-900', 'bg-zinc-950/20');
        badgeOficial.classList.add('border-blue-500/30', 'bg-zinc-950/60');
        const icon = badgeOficial.querySelector('.icon-slot');
        const title = badgeOficial.querySelector('.badge-title');
        const desc = badgeOficial.querySelector('.badge-desc');
        if (icon) icon.className = "w-8 h-8 rounded bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
        if (title) title.className = "text-zinc-200 font-semibold uppercase tracking-wider text-[10px]";
        if (desc) {
            desc.className = "text-zinc-500 text-[9px] tracking-normal";
            desc.innerText = "alta concentração de partículas espirituais.";
        }
    }

    const badgeCentral = document.getElementById('badge-central46');
    if (badgeCentral && totalSegredos > 0) {
        badgeCentral.classList.remove('opacity-40', 'grayscale', 'border-zinc-900', 'bg-zinc-950/20');
        badgeCentral.classList.add('border-amber-500/30', 'bg-zinc-950/60');
        const icon = badgeCentral.querySelector('.icon-slot');
        const title = badgeCentral.querySelector('.badge-title');
        const desc = badgeCentral.querySelector('.badge-desc');
        if (icon) icon.className = "w-8 h-8 rounded bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
        if (title) title.className = "text-zinc-200 font-semibold uppercase tracking-wider text-[10px]";
        if (desc) {
            desc.className = "text-zinc-500 text-[9px] tracking-normal";
            desc.innerText = `arquivos confidenciais selados (${totalSegredos} no cofre).`;
        }
    }

    const badgeIdiota = document.getElementById('badge-idiota');
    if (badgeIdiota && historicoMensagens && historicoMensagens.length > 0) {
        const levouBronca = historicoMensagens.some(m => 
            m.role === 'assistant' && 
            (m.content.toLowerCase().includes('idiota') || m.content.toLowerCase().includes('baka') || m.content.toLowerCase().includes('humano') || m.content.toLowerCase().includes('saco'))
        );

        if (levouBronca) {
            badgeIdiota.classList.remove('opacity-40', 'grayscale', 'border-zinc-900', 'bg-zinc-950/20');
            badgeIdiota.classList.add('border-red-500/30', 'bg-zinc-950/60');
            const icon = badgeIdiota.querySelector('.icon-slot');
            const title = badgeIdiota.querySelector('.badge-title');
            const desc = badgeIdiota.querySelector('.badge-desc');
            if (icon) icon.className = "w-8 h-8 rounded bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.1)]";
            if (title) title.className = "text-zinc-200 font-semibold uppercase tracking-wider text-[10px]";
            if (desc) {
                desc.className = "text-zinc-500 text-[9px] tracking-normal";
                desc.innerText = "conseguiu tirar o personagem do sério.";
            }
        }
    }
}

// --- CHAT INTELIGENTE INTERATIVO ---
async function enviarPergunta() {
    const input = document.getElementById('input-chat');
    const chatBox = document.getElementById('chat-box');
    const message = input.value.trim();
    if (!message) return;

    chatBox.innerHTML += `<div class="msg-user">${message}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        chatBox.innerHTML += `<div class="msg-rukia" style="border-left-color: red;">Sua sessão expirou, faça login novamente...</div>`;
        return;
    }

    const regexDeletar = /(?:deleta|remove|apaga|some com|exclui)\s+(?:o\s+|a\s+|o\s+segredo\s+da\s+|o\s+segredo\s+do\s+|a\s+senha\s+da\s+|a\s+senha\s+do\s+)?(["'«]?([^规律"'\n]+)["'»]?)/i;
    const matchDeletar = message.match(regexDeletar);

    if (matchDeletar) {
        const termoParaDeletar = matchDeletar[1].replace(/["'«]/g, "").trim();
        const { data: segredosExistentes } = await supabaseClient.from('segredos').select('id, titulo').eq('user_id', user.id);
        const alvo = segredosExistentes?.find(s => s.titulo.toLowerCase() === termoParaDeletar.toLowerCase() || termoParaDeletar.toLowerCase().includes(s.titulo.toLowerCase()));

        if (alvo) {
            const { error } = await supabaseClient.from('segredos').delete().eq('id', alvo.id);
            if (!error) {
                carregarSegredos(); 
                let promptInterceptado = [...historico];
                promptInterceptado.push({ 
                    role: "system", 
                    content: `[SISTEMA]: O item "${alvo.titulo}" foi DELETADO com sucesso do cofre pelo usuário. Responda assumindo totalmente o papel de ${PERSONAGENS[personagemAtual].nomeExibicao} alegando de forma nativa e condizente com sua persona que você apagou ou sumiu com esse registro.` 
                });

                try {
                    const response = await fetch(SUPABASE_FUNCTION_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: promptInterceptado }) });
                    const data = await response.json();
                    const respostaIA = data.choices[0].message.content;

                    historico.push({ role: "user", content: message });
                    historico.push({ role: "assistant", content: respostaIA });
                    localStorage.setItem(`historico_${personagemAtual}`, JSON.stringify(historico));

                    const idMsg = "msg-" + Date.now();
                    chatBox.innerHTML += `<div class="msg-rukia" id="${idMsg}"></div>`;
                    atualizarHumorPersonagem(respostaIA);
                    digitarTexto(document.getElementById(idMsg), respostaIA);

                    const tSegredos = document.getElementById('lista-segredos')?.children.length || 0;
                    const rText = document.getElementById('reiatsu-porcentagem')?.innerText || "0%";
                    atualizarInsigniasDinamicas(parseInt(rText), tSegredos, historico);
                    return; 
                } catch (err) { console.error(err); }
            }
        }
    }

    const regexGuardar = /(?:guarda|salva|anota|sela)\s+(?:aí|ai|no cofre)?\s*["'«]?([^规律:\n"']+)\s*[:|-]\s*([^规律"'\n]+)["'»]?/i;
    const matchGuardar = message.match(regexGuardar);

    if (matchGuardar) {
        const tituloExtraido = matchGuardar[1].trim();
        const conteudoExtraido = matchGuardar[2].trim();

        const { error } = await supabaseClient.from('segredos').insert([{ titulo: tituloExtraido, conteudo: conteudoExtraido, categoria: 'Geral', user_id: user.id }]);

        if (!error) {
            carregarSegredos(); 
            let promptInterceptado = [...historico];
            promptInterceptado.push({ 
                role: "system", 
                content: `[SISTEMA]: O registro foi guardado com sucesso! Título: "${tituloExtraido}" | Conteúdo: "${conteudoExtraido}". Diga de forma natural e na voz de ${PERSONAGENS[personagemAtual].nomeExibicao} que você salvou isso no cofre de dados.` 
            });

            try {
                const response = await fetch(SUPABASE_FUNCTION_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: promptInterceptado }) });
                const data = await response.json();
                const respostaIA = data.choices[0].message.content;

                historico.push({ role: "user", content: message });
                historico.push({ role: "assistant", content: respostaIA });
                localStorage.setItem(`historico_${personagemAtual}`, JSON.stringify(historico));

                const idMsg = "msg-" + Date.now();
                chatBox.innerHTML += `<div class="msg-rukia" id="${idMsg}"></div>`;
                atualizarHumorPersonagem(respostaIA);
                digitarTexto(document.getElementById(idMsg), respostaIA);

                const tSegredos = document.getElementById('lista-segredos')?.children.length || 0;
                const rText = document.getElementById('reiatsu-porcentagem')?.innerText || "0%";
                atualizarInsigniasDinamicas(parseInt(rText), tSegredos, historico);
                return; 
            } catch (err) { console.error(err); }
        }
    }

    let contextoSegredo = "";
    try {
        const { data: segredos } = await supabaseClient.from('segredos').select('titulo, conteudo').eq('user_id', user.id);
        if (segredos && segredos.length > 0) {
            const segredosAchados = segredos.filter(s => message.toLowerCase().includes(s.titulo.toLowerCase()));
            if (segredosAchados.length > 0) {
                contextoSegredo = `\n[ARQUIVOS RESTRITOS DO COFRE DO USUÁRIO]:\n` + segredosAchados.map(s => `Item: ${s.titulo} | Dado Criptografado: ${s.conteudo}`).join("\n") + `\nUse esses dados para responder interpretando estritamente seu papel como ${PERSONAGENS[personagemAtual].nomeExibicao}.`;
            }
        }
    } catch (err) { console.error(err); }

    let promptFinal = [...historico];
    if (contextoSegredo) promptFinal.push({ role: "system", content: contextoSegredo });
    promptFinal.push({ role: "user", content: message });

    try {
        const response = await fetch(SUPABASE_FUNCTION_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: promptFinal }) });
        const data = await response.json();
        const respostaIA = data.choices[0].message.content;
        
        historico.push({ role: "user", content: message });
        historico.push({ role: "assistant", content: respostaIA });
        localStorage.setItem(`historico_${personagemAtual}`, JSON.stringify(historico));

        const idMsg = "msg-" + Date.now();
        chatBox.innerHTML += `<div class="msg-rukia" id="${idMsg}"></div>`;
        atualizarHumorPersonagem(respostaIA);
        digitarTexto(document.getElementById(idMsg), respostaIA);

        const tSegredos = document.getElementById('lista-segredos')?.children.length || 0;
        const rText = document.getElementById('reiatsu-porcentagem')?.innerText || "0%";
        atualizarInsigniasDinamicas(parseInt(rText), tSegredos, historico);
    } catch (err) {
        chatBox.innerHTML += `<div class="msg-rukia" style="border-left-color: red;">O sinal espiritual falhou misteriosamente...</div>`;
    }
}

document.getElementById('btn-perguntar').addEventListener('click', enviarPergunta);
document.getElementById('input-chat').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') enviarPergunta();
});

// --- MENU TOGGLE ---
function toggleMenu() {
    const menu = document.getElementById('settings-menu');
    if (menu) menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}
window.toggleMenu = toggleMenu;

// --- MODAL DE DESENHOS DE COELHO (GALERIA) ---
function abrirGaleria() {
    const modal = document.getElementById('modal-galeria');
    if (modal) modal.style.display = 'flex';
}
function fecharGaleria() {
    const modal = document.getElementById('modal-galeria');
    if (modal) modal.style.display = 'none';
}
window.abrirGaleria = abrirGaleria;
window.fecharGaleria = fecharGaleria;

// --- EXPANSÃO COMPLETA LIGHTBOX ---
function abrirZoom(srcId) {
    const lightbox = document.getElementById('discord-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = srcId;
        lightbox.style.display = 'flex';
        lightboxImg.classList.remove('scale-100');
        lightboxImg.classList.add('scale-95');
        
        setTimeout(() => {
            lightboxImg.classList.remove('scale-95');
            lightboxImg.classList.add('scale-100');
        }, 10);
    }
}
window.abrirZoom = abrirZoom;

// --- RADAR HOLLOW E MODAL PERFIL SHINIGAMI ---
function gerarLogHollow() {
    const container = document.getElementById('hollow-logs');
    if (!container) return;

    const logsHollow = [
        { classe: "MENOS GRANDE", setor: "03", status: "ESCUADRÃO DE APOIO ENVIADO" },
        { classe: "HOLLOW COMUM", setor: "01", status: "CEIFADO POR RUKIA KUCHIKI" },
        { classe: "DEMÔNIO DA SEDA", setor: "05", status: "DADOS DA CENTRAL EM ANÁLISE" },
        { classe: "DESCONHECIDA (ALTA)", setor: "02", status: "MANDATO DE EVACUAÇÃO EMITIDO" },
        { classe: "ADJUCHAS", setor: "04", status: "TENENTE A CAMINHO DO LOCAL" }
    ];

    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const logAleatorio = logsHollow[Math.floor(Math.random() * logsHollow.length)];
    
    container.innerHTML = `
        <div class="text-red-500/80 animate-pulse font-semibold">
            [ALERTA ${horaFormatada}] HOLLOW CLASSE ${logAleatorio.classe} DETECTADO NO SETOR ${logAleatorio.setor}
        </div>
        <div class="text-zinc-500 pl-3">
            ➔ [STATUS] ${logAleatorio.status}
        </div>
    `;
}

function abrirPerfil() {
    const modal = document.getElementById('modal-perfil');
    const menu = document.getElementById('settings-menu');
    
    if (menu) menu.style.display = 'none'; 
    
    if (modal) {
        const tituloNome = document.getElementById('perfil-titulo-nome');
        if (tituloNome && nomeUsuarioGlobal) {
            tituloNome.innerText = `${nomeUsuarioGlobal.toUpperCase()} // 13º ESQUADRÃO`;
        }

        const novaReiatsu = Math.floor(Math.random() * (98 - 25 + 1)) + 25; 
        const textReiatsu = document.getElementById('reiatsu-porcentagem');
        const barraReiatsu = document.getElementById('reiatsu-barra');
        
        if (textReiatsu && barraReiatsu) {
            textReiatsu.innerText = `${novaReiatsu}%`;
            barraReiatsu.style.width = `${novaReiatsu}%`;
        }

        const totalSegredosAtuais = document.getElementById('lista-segredos')?.children.length || 0;
        atualizarInsigniasDinamicas(novaReiatsu, totalSegredosAtuais, historico);

        modal.style.display = 'flex';
    }
}

function fecharPerfil() {
    const modal = document.getElementById('modal-perfil');
    if (modal) modal.style.display = 'none';
}

window.abrirPerfil = abrirPerfil;
window.fecharPerfil = fecharPerfil;