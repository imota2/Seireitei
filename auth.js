// --- CONFIGURAÇÃO CENTRAL SUPABASE ---
const { createClient } = supabase;
const supabaseClient = createClient(
    'https://tvrmtouvgcngozpcmplh.supabase.co', 
    'sb_publishable_xcBUwC_LgbDkGj_7bMfbLw_-OksMik-'
);

const screenIntro = document.getElementById('screen-intro');
const screenLogin = document.getElementById('screen-login');

// Alterna entre a Intro e o Login internamente
function navegarPara(idTela) {
    if (screenIntro) screenIntro.classList.add('hidden');
    if (screenLogin) screenLogin.classList.add('hidden');
    
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
    toast.innerText = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.addEventListener('load', () => {
    // Efeito Shunpo inicial na Intro
    if (screenIntro) {
        setTimeout(() => {
            screenIntro.style.transition = "opacity 0.8s ease-out";
            screenIntro.style.opacity = "1";
        }, 50);
    }

    // 1. Avançar da Intro para o Login
    document.getElementById('btn-ir-para-login')?.addEventListener('click', () => {
        navegarPara('screen-login');
    });

    // 2. Executar login e mandar para a página separada
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

            mostrarPopup("Bem-vindo à Soul Society.");
            
            // Redireciona para o arquivo separado do Dashboard após sucesso!
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);

        } catch (err) {
            mostrarPopup("Erro inesperado ao conectar.");
        }
    });
});