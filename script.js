// ====================================================
// VARIÁVEIS E ELEMENTOS DO JOGO
// ====================================================

// VARIÁVEIS DE DADOS (MANTIDO)
let saldo = 100;
let jogosFeitos = 0; 
let userName = "Explorador";
let userId = "#000000"; 

// Variáveis de Recarga
const intervaloRecarga = 60; 
let tempoRestante = 0;

// Elementos UI (MANTIDO)
const elementoSaldo = document.getElementById('saldo-virtual');
const elementoMensagem = document.getElementById('mensagem-resultado');
const missoesMensagem = document.getElementById('missoes-mensagem');
const btnRecarregar = document.getElementById('btn-recarregar');
const elementoTimer = document.getElementById('timer-recarregar');

// Elementos de Perfil (MANTIDO)
const nomeUsuarioElement = document.getElementById('user-name');
const idUsuarioElement = document.getElementById('user-id');

// Botões de Jogos (MANTIDO)
const btnSlotMachine = document.getElementById('btn-slot-machine');
const btnAbrirBau = document.getElementById('btn-abrir-bau');
const btnLancarDado = document.getElementById('btn-lancar-dado');

// Elementos de Animação e Símbolos (MANTIDO)
const slotReels = [
    document.getElementById('slot-r1'),
    document.getElementById('slot-r2'),
    document.getElementById('slot-r3')
];
const bauSimbolo = document.getElementById('bau-simbolo');
const dadoSimbolo = document.getElementById('dado-simbolo');

// NOVO: Elementos do Panda
const pandaArea = document.getElementById('panda-area');
const pandaSimbolo = document.getElementById('panda-simbolo');
const pandaCarta = document.getElementById('panda-carta');


// Símbolos do Caça-Níqueis (MANTIDO)
const simbolosSlot = ['🍒', '⭐', '💰', '7️⃣', '🔔']; 

// ====================================================
// FUNÇÕES DE LÓGICA DE JOGO
// ====================================================

// Lógica Genérica para qualquer jogo
function processarJogada(custo, resultado, elementoSimbolo) {
    if (saldo < custo) {
        elementoMensagem.textContent = "❌ Cash Insuficiente para esta aventura!";
        elementoMensagem.className = "text-error mb-0 fw-bold";
        return false;
    }

    saldo -= custo;
    jogosFeitos++; 
    
    document.querySelectorAll('.btn-lg').forEach(btn => btn.disabled = true);
    
    // NOVO: Esconde o panda no início da jogada, caso esteja visível
    pandaArea.style.display = 'none';

    setTimeout(() => {
        
        const { ganho, mensagem, tipo, simboloFinal } = resultado;
        
        saldo += ganho;
        
        // ACIONAMENTO DO PANDA
        if (tipo === 'JACKPOT') {
            pandaArea.style.display = 'flex'; // Mostra o panda
            // Define o emoji da carta de acordo com o jogo
            pandaCarta.textContent = (custo === 10) ? '🏆' : '🎁'; 
            setTimeout(() => {
                 pandaArea.style.display = 'none'; // Esconde após 3 segundos
            }, 3000);
        }

        if (elementoSimbolo) {
             elementoSimbolo.textContent = simboloFinal || '';
        }
        elementoMensagem.textContent = mensagem;
        
        // Estilo de acordo com o resultado
        elementoMensagem.className = `text-light mb-0 fw-bold ${tipo === 'JACKPOT' ? 'text-jackpot' : tipo === 'VITORIA' ? 'text-success' : 'text-error'}`;

        verificarMissao();
        atualizarProgressoUI();

        document.querySelectorAll('.btn-lg').forEach(btn => btn.disabled = false);

    }, 2000); // Suspense de 2 segundos

    return true;
}

// ----------------------------------------------------
// JOGO 1: CAÇA-NÍQUEIS (Lógica Mantida, Animação Melhorada no CSS)
// ----------------------------------------------------
function checarCombinacaoSlot(r1, r2, r3) {
    const s = (sym) => sym; // Função simplificada para checar símbolos

    // Tabela de Pagamentos
    if (r1 === r2 && r2 === r3) {
        // Usa o SÍMBOLO '7️⃣' diretamente
        if (r1 === '7️⃣') return { tipo: 'JACKPOT', ganho: 200, mensagem: "👑 TRIPLO 7! MEGA JACKPOT de 200 Cash!", simboloFinal: r1 }; 
        if (r1 === '💰') return { tipo: 'JACKPOT', ganho: 100, mensagem: "💰 TRIPLO CASH! +100 Cash!", simboloFinal: r1 };
        return { tipo: 'GRANDE_VITORIA', ganho: 50, mensagem: `🎉 TRIPLO ${r1}! +50 Cash!`, simboloFinal: r1 };
    }
    
    if (r1 === r2 || r2 === r3 || r1 === r3) {
        if ((r1 === '🔔' && r2 === '🔔') || (r2 === '🔔' && r3 === '🔔') || (r1 === '🔔' && r3 === '🔔')) {
             return { tipo: 'VITORIA_MEDIA', ganho: 20, mensagem: "🔔🔔 Duas Sinos! +20 Cash!", simboloFinal: '🔔' };
        }
    }

    if (r1 === '🍒' || r2 === '🍒' || r3 === '🍒') { 
        return { tipo: 'VITORIA_MINIMA', ganho: 12, mensagem: "🍒 Uma Cereja! Recuperou 12 Cash.", simboloFinal: '🍒' };
    }
    
    return { tipo: 'PERDA', ganho: 0, mensagem: "😭 Sem Combinação. Tente de Novo!", simboloFinal: '❌' };
}

btnSlotMachine.addEventListener('click', () => {
    const custo = parseInt(btnSlotMachine.dataset.custo);
    
    // Animação de Giro
    slotReels.forEach(reel => reel.classList.add('spinning'));

    // Geração dos símbolos
    const r1 = simbolosSlot[Math.floor(Math.random() * simbolosSlot.length)];
    const r2 = simbolosSlot[Math.floor(Math.random() * simbolosSlot.length)];
    const r3 = simbolosSlot[Math.floor(Math.random() * simbolosSlot.length)];

    const resultado = checarCombinacaoSlot(r1, r2, r3);

    const resultadoProcessado = {
        ...resultado,
        simboloFinal: resultado.simboloFinal || '?' 
    };
    
    const sucesso = processarJogada(custo, resultadoProcessado, null);
    
    if (sucesso) {
         // Para a animação e mostra os resultados reais
        setTimeout(() => {
            slotReels.forEach(reel => reel.classList.remove('spinning'));
            slotReels[0].textContent = r1;
            slotReels[1].textContent = r2;
            slotReels[2].textContent = r3;
        }, 1500); 
    } else {
        slotReels.forEach(reel => reel.classList.remove('spinning'));
    }
});


// ----------------------------------------------------
// JOGO 2: ABERTURA DO BAÚ (Lógica Mantida)
// ----------------------------------------------------
btnAbrirBau.addEventListener('click', () => {
    const custo = parseInt(btnAbrirBau.dataset.custo);
    const sorteio = Math.random();
    let resultado;

    if (sorteio < 0.50) { 
        resultado = { tipo: 'JACKPOT', ganho: custo * 4, mensagem: "✨ Tesouro Encontrado! Ganhou 20 Cash!", simboloFinal: "👑" };
    } else { 
        resultado = { tipo: 'PERDA', ganho: 0, mensagem: "🏴‍☠️ Baú Vazio. Cash perdido!", simboloFinal: "💀" };
    }
    bauSimbolo.textContent = "🔓";
    processarJogada(custo, resultado, bauSimbolo);
});


// ----------------------------------------------------
// JOGO 3: DADO 3D SIMULADO (Lógica Mantida)
// ----------------------------------------------------
btnLancarDado.addEventListener('click', () => {
    const custo = parseInt(btnLancarDado.dataset.custo);
    const dado = Math.floor(Math.random() * 6) + 1; 
    let resultado;

    if (dado >= 4) { 
        resultado = { tipo: 'VITORIA', ganho: custo * 2, mensagem: `🎉 Dado ${dado}! Ganhou 4 Cash!`, simboloFinal: `${dado}🎲` };
    } else if (dado === 3) { 
        resultado = { tipo: 'NEUTRO', ganho: custo, mensagem: `😐 Dado ${dado}. Recuperou o Cash.`, simboloFinal: `${dado}🎲` };
    } else { 
        resultado = { tipo: 'PERDA', ganho: 0, mensagem: `😭 Dado ${dado}. Perdeu o Cash!`, simboloFinal: `${dado}🎲` };
    }
    
    // Animação de Lançamento
    dadoSimbolo.textContent = '...'; 
    dadoSimbolo.classList.add('rolling-effect');

    const sucesso = processarJogada(custo, resultado, dadoSimbolo);
    
    if (sucesso) {
        setTimeout(() => {
             dadoSimbolo.classList.remove('rolling-effect');
        }, 2000); 
    } else {
        dadoSimbolo.classList.remove('rolling-effect');
    }
});


// ====================================================
// SISTEMAS DE PROGRESSÃO E INICIALIZAÇÃO (MANTIDO)
// ====================================================

function atualizarProgressoUI() {
    elementoSaldo.textContent = saldo;
    nomeUsuarioElement.textContent = userName;
    idUsuarioElement.textContent = userId;
}

function verificarMissao() {
    const meta = 5;
    if (jogosFeitos >= meta) {
        saldo += 50;
        missoesMensagem.textContent = `✅ Missão COMPLETA! Ganhou 50 Cash!`;
        missoesMensagem.classList.add('text-success');
        jogosFeitos = 0; 
        alert("DESAFIO DIÁRIO COMPLETO! Cash Bônus Adicionado!");
    } else {
        missoesMensagem.textContent = `Jogue mais ${meta - jogosFeitos}x no Caça-Níqueis para ganhar 50 Cash!`;
    }
}

btnRecarregar.addEventListener('click', concederRecarga);

function concederRecarga() {
    const bonus = 10; 
    saldo += bonus;
    localStorage.setItem('saldo', saldo);

    elementoMensagem.textContent = `🔋 RECUPERADO! Você ganhou ${bonus} Cash!`;
    elementoMensagem.className = "text-light mb-0 fw-bold text-success";

    tempoRestante = intervaloRecarga;
    localStorage.setItem('tempoRestanteRecarga', tempoRestante); 
    btnRecarregar.disabled = true;
    
    iniciarContagemRegressiva();
    atualizarProgressoUI();
}

function iniciarContagemRegressiva() {
    if (window.recargaTimerInterval) {
        clearInterval(window.recargaTimerInterval);
    }
    const timerID = setInterval(() => {
        if (tempoRestante > 0) {
            tempoRestante--;
            localStorage.setItem('tempoRestanteRecarga', tempoRestante);
            const minutos = Math.floor(tempoRestante / 60);
            const segundos = tempoRestante % 60;
            const segundosFormatados = segundos < 10 ? `0${segundos}` : segundos;
            elementoTimer.textContent = `${minutos}:${segundosFormatados}`;
        } else {
            clearInterval(timerID); 
            btnRecarregar.disabled = false;
            elementoTimer.textContent = "Pronta!";
            elementoMensagem.textContent = "Recarga Grátis disponível!";
        }
    }, 1000); 
    window.recargaTimerInterval = timerID; 
}

function gerarUserIdSimulado() {
    return `#${Math.floor(Math.random() * 900000 + 100000)}`;
}

function iniciarJogo() {
    // 1. Tentar Carregar dados salvos no navegador (LocalStorage)
    saldo = parseInt(localStorage.getItem('saldo')) || 100;
    userName = localStorage.getItem('userName') || "Explorador " + Math.floor(Math.random() * 100);
    userId = localStorage.getItem('userId') || gerarUserIdSimulado();

    jogosFeitos = parseInt(localStorage.getItem('jogosFeitos')) || 0;
    tempoRestante = parseInt(localStorage.getItem('tempoRestanteRecarga')) || 0;

    // 2. Iniciar UI e Timers
    atualizarProgressoUI();
    verificarMissao();

    if (tempoRestante > 0) {
        iniciarContagemRegressiva();
    } else {
        btnRecarregar.disabled = false;
        elementoTimer.textContent = "Pronta!";
    }
    
    // 3. O Panda começa escondido
    pandaArea.style.display = 'none';

    // 4. Salvamento periódico
    setInterval(() => {
        localStorage.setItem('saldo', saldo);
        localStorage.setItem('userName', userName);
        localStorage.setItem('userId', userId);
        localStorage.setItem('jogosFeitos', jogosFeitos);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', iniciarJogo);