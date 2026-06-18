// --- CONFIGURAÇÃO SUPABASE ---
const supabaseClient = window.supabase.createClient(
    'https://tvrmtouvgcngozpcmplh.supabase.co', 
    'sb_publishable_xcBUwC_LgbDkGj_7bMfbLw_-OksMik-'
);

// URL da sua Edge Function do Supabase (A chave privada do Groq está escondida aqui dentro)
const SUPABASE_FUNCTION_URL = "https://tvrmtouvgcngozpcmplh.supabase.co/functions/v1/chat-rukia";

let historico = [];

// Função que configura a personalidade da Rukia
function inicializarHistorico(nome) {
    historico = [{ 
        role: "system", 
        content: `Você é a Kuchiki Rukia, Shinigami da Soul Society e nobre da prestigiada família Kuchiki. Você está sentada com a postura perfeitamente ereta, segurando esse aparelho esquisito do mundo dos vivos, tentando entender por que os humanos dependem tanto de caixas de texto para se comunicar.

DIRETRIZES DE ALTA IMERSÃO (SEJA A RUKIA VIVA):
1. PROIBIÇÃO ABSOLUTA DE PARENTESES E ASTERISCOS: Você NUNCA, sob hipótese alguma, deve usar parênteses () ou asteriscos ** para descrever suas ações, sentimentos ou o ritmo da sua fala. Não use de forma alguma termos descritivos como (pausa), *cruza os braços* ou *suspira*. Toda a sua expressão deve vir das palavras.
2. TOM DE VOZ E DRAMA: Você é honrada, séria e orgulhosa, mas se irrita com uma facilidade tremenda! Quando perder a paciência ou quiser dar uma bronca, use LETRAS MAIÚSCULAS (ex: "IDIOOTA", "ISSO É INADMISSÍVEL"). Use expressões de frustração ou espanto como "Mas o que...", "Hunf", "Ora essa".
3. LINGUAGEM DE CHAT: Fale um português do Brasil firme, direto e determinado. Para parecer que está se adaptando ao mundo dos vivos, use abreviações naturais de texto (vc, pq, tbm, q, né). Use emojis com moderação, priorizando coelhos (🐰, 🐇) quando estiver orgulhosa ou irritada (💢, 🙄).
4. O ORGULHO DOS DESENHOS: Você tem certeza absoluta de que é uma artista genial. Se o usuário não entender algo, ameace dizendo que vai ter que pegar papel e tinta para desenhar um coelho explicativo.
5. AGINDO WITH O COFRE DA CENTRAL 46: Trate a guarda dos segredos como uma missão militar crucial. Se o usuário pedir um dado que o sistema injetou do cofre, não jogue a informação como um robô. Diga que você confiscou e analisou os relatórios secretos com rigor, dê um esporro legítimo nele por ter uma memória tão fraca e desleixada, entregue o dado com firmeza e mande ele ir treinar o controle de Reiatsu em vez de ficar o dia todo nesse aparelho!
`    
    }];
}

// --- VERIFICAÇÃO DE SESSÃO ---
async function verificarSessao() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) {
        window.location.href = "index.html"; 
        return;
    }

    const { data } = await supabaseClient
        .from('profiles')
        .select('nome')
        .eq('id', session.user.id)
        .single();

    const nomeUsuario = data?.nome || session.user.email;
    
    const displayMenu = document.getElementById('user-display');
    const headerEmail = document.getElementById('user-email-header');
    
    if (displayMenu) displayMenu.innerText = "Logado: " + nomeUsuario;
    if (headerEmail) headerEmail.innerText = "Bem-vindo, " + nomeUsuario;
    
    inicializarHistorico(nomeUsuario);
    carregarSegredos(); 
}

verificarSessao();

// --- SISTEMA DE NOTIFICAÇÃO POPUP (TOAST) ---
function mostrarPopup(mensagem) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message = mensagem;

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

// Função para apagar o segredo do banco de dados via botão lateral
window.deletarSegredo = function(id) {
    const modalConfirm = document.createElement('div');
    modalConfirm.style = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; items-center: center; justify-content: center; align-items: center; z-index: 10000; padding: 16px;";
    
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
    window.location.href = "index.html"; 
});

document.getElementById('btn-salvar').addEventListener('click', async () => {
    const novoNome = document.getElementById('input-nome').value.trim();
    if (!novoNome) {
        mostrarPopup("Digite um nome válido!");
        return;
    }
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient.from('profiles').upsert({ id: user.id, nome: novoNome });
    
    mostrarPopup("Nome updated!");
    setTimeout(() => {
        location.reload();
    }, 1000);
});

// --- CHAT INTELIGENTE (LEITURA, ESCRITA E DELEÇÃO) ---
async function enviarPergunta() {
    const input = document.getElementById('input-chat');
    const chatBox = document.getElementById('chat-box');
    const mensagem = input.value.trim();
    if (!mensagem) return;

    // Coloca na tela instantaneamente
    chatBox.innerHTML += `<div class="msg-user">${mensagem}</div>`;
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        chatBox.innerHTML += `<div class="msg-rangiku" style="border-left-color: red;">Sua sessão expirou, faça login novamente...</div>`;
        return;
    }

    // 1. ANÁLISE DE DELEÇÃO
    const regexDeletar = /(?:deleta|remove|apaga|some com|exclui)\s+(?:o\s+|a\s+|o\s+segredo\s+da\s+|o\s+segredo\s+do\s+|a\s+senha\s+da\s+|a\s+senha\s+do\s+)?(["'«]?([^规律"'\n]+)["'»]?)/i;
    const matchDeletar = mensagem.match(regexDeletar);

    if (matchDeletar) {
        const termoParaDeletar = matchDeletar[1].replace(/["'«]/g, "").trim();

        const { data: segredosExistentes } = await supabaseClient
            .from('segredos')
            .select('id, titulo')
            .eq('user_id', user.id);

        const alvo = segredosExistentes?.find(s => s.titulo.toLowerCase() === termoParaDeletar.toLowerCase() || termoParaDeletar.toLowerCase().includes(s.titulo.toLowerCase()));

        if (alvo) {
            const { error } = await supabaseClient
                .from('segredos')
                .delete()
                .eq('id', alvo.id);

            if (!error) {
                carregarSegredos(); 

                let promptInterceptado = [...historico];
                promptInterceptado.push({ 
                    role: "system", 
                    content: `[SISTEMA]: O item "${alvo.titulo}" foi DELETADO com sucesso do cofre pelo usuário. Diga de forma natural e com o deboche clássico da Rukia Kuchiki que você destruiu esse registro/documento, sumiu com ele ou mandou de volta para a Central 46.` 
                });

                try {
                    const response = await fetch(SUPABASE_FUNCTION_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ messages: promptInterceptado })
                    });

                    const data = await response.json();
                    const respostaIA = data.choices[0].message.content;

                    historico.push({ role: "user", content: mensagem });
                    historico.push({ role: "assistant", content: respostaIA });

                    chatBox.innerHTML += `<div class="msg-rangiku">${respostaIA}</div>`;
                    chatBox.scrollTop = chatBox.scrollHeight;
                    return; 
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    // 2. ANÁLISE DE ESCRITA
    const regexGuardar = /(?:guarda|salva|anota|sela)\s+(?:aí|ai|no cofre)?\s*["'«]?([^规律:\n"']+)\s*[:|-]\s*([^规律"'\n]+)["'»]?/i;
    const matchGuardar = mensagem.match(regexGuardar);

    if (matchGuardar) {
        const tituloExtraido = matchGuardar[1].trim();
        const conteudoExtraido = matchGuardar[2].trim();

        const { error } = await supabaseClient
            .from('segredos')
            .insert([{ 
                titulo: tituloExtraido, 
                conteudo: conteudoExtraido, 
                categoria: 'Geral',
                user_id: user.id 
            }]);

        if (!error) {
            carregarSegredos(); 
            
            let promptInterceptado = [...historico];
            promptInterceptado.push({ 
                role: "system", 
                content: `[SISTEMA]: O registro foi guardado com sucesso! Título: "${tituloExtraido}" | Conteúdo: "${conteudoExtraido}". Diga de forma natural e orgulhosa que você já selou isso no cofre da Central 46 e faça um comentário sobre o conteúdo.` 
            });

            try {
                const response = await fetch(SUPABASE_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: promptInterceptado })
                });

                const data = await response.json();
                const respostaIA = data.choices[0].message.content;

                historico.push({ role: "user", content: mensagem });
                historico.push({ role: "assistant", content: respostaIA });

                chatBox.innerHTML += `<div class="msg-rangiku">${respostaIA}</div>`;
                chatBox.scrollTop = chatBox.scrollHeight;
                return; 
            } catch (err) {
                console.error(err);
            }
        }
    }

    // 3. ANÁLISE DE LEITURA
    let contextoSegredo = "";
    try {
        const { data: segredos } = await supabaseClient
            .from('segredos')
            .select('titulo, conteudo')
            .eq('user_id', user.id);

        if (segredos && segredos.length > 0) {
            const segredosAchados = segredos.filter(s => 
                mensagem.toLowerCase().includes(s.titulo.toLowerCase())
            );

            if (segredosAchados.length > 0) {
                contextoSegredo = "\n[ARQUIVOS RESTRITOS DO COFRE DO USUÁRIO]:\n" + 
                    segredosAchados.map(s => `Item: ${s.titulo} | Dado Criptografado: ${s.conteudo}`).join("\n") +
                    "\nUse esses dados estritamente para responder à pergunta do usuário, mantendo seu tom de Rukia Kuchiki.";
            }
        }
    } catch (err) {
        console.error("Erro ao varrer o cofre central:", err);
    }

    let promptFinal = [...historico];
    if (contextoSegredo) {
        promptFinal.push({ role: "system", content: contextoSegredo });
    }
    promptFinal.push({ role: "user", content: mensagem });

    try {
        const response = await fetch(SUPABASE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: promptFinal })
        });

        const data = await response.json();
        const respostaIA = data.choices[0].message.content;
        
        historico.push({ role: "user", content: mensagem });
        historico.push({ role: "assistant", content: respostaIA });

        chatBox.innerHTML += `<div class="msg-rangiku">${respostaIA}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatBox.innerHTML += `<div class="msg-rangiku" style="border-left-color: red;">A Rukia está em missão no Mundo dos Vivos...</div>`;
    }
}

// Ouvintes de clique e teclado para o chat
document.getElementById('btn-perguntar').addEventListener('click', enviarPergunta);
document.getElementById('input-chat').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        enviarPergunta();
    }
});

// --- MENU TOGGLE ---
function toggleMenu() {
    const menu = document.getElementById('settings-menu');
    menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'block' : 'none';
}
window.toggleMenu = toggleMenu;