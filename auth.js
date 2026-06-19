// --- CONFIGURAÇÃO CENTRAL SUPABASE ---
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://tvrmtouvgcngozpcmplh.supabase.co', 
    'sb_publishable_xcBUwC_LgbDkGj_7bMfbLw_-OksMik-'
);

const screenIntro = document.getElementById('screen-intro');
const screenLogin = document.getElementById('screen-login');
const screenName = document.getElementById('screen-name');

function navegarPara(idTela) {
    if (screenIntro) screenIntro.classList.add('hidden');
    if (screenLogin) screenLogin.classList.add('hidden');
    if (screenName) screenName.classList.add('hidden');
    
    const telaAtiva = document.getElementById(idTela);
    if (telaAtiva) {
        telaAtiva.classList.remove('hidden');
        telaAtiva.style.opacity = "0";
        setTimeout(() => {
            telaAtiva.style.transition = "opacity 0.6s ease-out";
            telaAtiva.style.opacity = "1";
        }, 50);
    }
}

function mostrarPopup(mensagem) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.addEventListener('load', () => {
    if (screenIntro) {
        setTimeout(() => {
            screenIntro.style.transition = "opacity 0.8s ease-out";
            screenIntro.style.opacity = "1";
        }, 50);
    }

    document.getElementById('btn-ir-para-login')?.addEventListener('click', () => {
        navegarPara('screen-login');
    });

    // Executar login e verificar o nome do Shinigami
    document.getElementById('btn-executar-login')?.addEventListener('click', async () => {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            mostrarPopup("Preencha todos os campos!");
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                mostrarPopup("" + error.message);
                return;
            }

            // Verifica se o usuário já tem um nome cadastrado nos metadados
            const userMetadata = data.user?.user_metadata;
            if (userMetadata && userMetadata.display_name) {
                mostrarPopup("Bem-vindo de volta à Soul Society.");
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 1200);
            } else {
                // Se não tiver nome, abre a tela de registro de nome
                mostrarPopup("Identidade pendente. Registre seu nome.");
                setTimeout(() => {
                    navegarPara('screen-name');
                }, 1000);
            }

        } catch (err) {
            mostrarPopup("Erro inesperado ao conectar.");
        }
    });

    // Salvar o nome escolhido no Supabase Auth e redirecionar
    document.getElementById('btn-salvar-nome')?.addEventListener('click', async () => {
        const nomeEscolhido = document.getElementById('escolher-nome').value.trim();

        if (!nomeEscolhido) {
            mostrarPopup("Sua alma precisa de uma assinatura! Digite um nome.");
            return;
        }

        try {
            // Atualiza os metadados do usuário atual no Supabase Auth
            const { error } = await supabaseClient.auth.updateUser({
                data: { display_name: nomeEscolhido }
            });

            if (error) {
                mostrarPopup("Erro ao selar nome: " + error.message);
                return;
            }

            mostrarPopup("Reiatsu Sincronizada! Entrando no painel...");
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } catch (err) {
            mostrarPopup("Erro ao processar assinatura.");
        }
    });
});