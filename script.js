// URL da API fornecida em config.js
// Copie config.example.js para config.js e defina a URL localmente.
// config.js não deve ser commitado no GitHub.

// =================== STARTUP LOGIC ===================
document.addEventListener("DOMContentLoaded", () => {
    // Popup inicial
    const welcomePopup = document.getElementById('welcome-popup');
    const btnClosePopup = document.getElementById('btn-close-popup');
    if (welcomePopup && btnClosePopup) {
        btnClosePopup.addEventListener('click', () => {
            welcomePopup.classList.add('hidden');
        });
    }

    const btnTutorial = document.getElementById('btn-tutorial-7me');
    const tutorialContainer = document.getElementById('tutorial-7me');
    if (btnTutorial && tutorialContainer) {
        btnTutorial.addEventListener('click', () => {
            tutorialContainer.classList.toggle('hidden');
        });
    }

});

// =================== NAVIGATION LOGIC ===================
function nextStep(step) {
    const errorBox = document.getElementById('error-message');
    if (errorBox) errorBox.classList.add('hidden');

    if (step === 2) {
        // Validações básicas da etapa 1
        if(!document.getElementById('nome-crianca').value || !document.getElementById('data-nasc').value || 
           !document.getElementById('idade').value || !document.getElementById('genero').value || 
           !document.getElementById('tam-camiseta').value || !document.getElementById('nome-mae').value || 
           !document.getElementById('nome-pai').value || !document.getElementById('telefone-contato').value || 
           !document.getElementById('email-responsavel').value || !document.getElementById('cpf-responsavel').value ||
           !document.getElementById('telefone-emergencia').value || !document.getElementById('nome-emergencia').value) {
            alert('Por favor, preencha todos os campos obrigatórios da Etapa 1.');
            return;
        }
    }
    
    if (step === 3) {
        if(!document.getElementById('plano-saude').value || !document.getElementById('tem-alergia').value || 
           !document.getElementById('tem-medicacao').value || !document.getElementById('tem-deficiencia').value || 
           !document.getElementById('tem-cirurgia').value) {
            alert('Por favor, responda todas as perguntas obrigatórias da Etapa 2.');
            return;
        }
    }

    // Ocultar todas as etapas
    document.getElementById('etapa-1').classList.add('step-hidden');
    document.getElementById('etapa-2').classList.add('step-hidden');
    document.getElementById('etapa-3').classList.add('step-hidden');
    
    // Mostrar a etapa desejada
    document.getElementById(`etapa-${step}`).classList.remove('step-hidden');

    // Atualizar UI de progresso
    document.getElementById('indicador-1').className = "flex items-center justify-center w-10 h-10 rounded-full font-bold " + (step >= 1 ? "bg-primary text-white" : "bg-surface-container border-2 border-outline-variant text-outline");
    document.getElementById('linha-1-2').className = "w-12 md:w-24 h-1 rounded-full " + (step >= 2 ? "bg-primary" : "bg-outline-variant");
    
    document.getElementById('indicador-2').className = "flex items-center justify-center w-10 h-10 rounded-full font-bold " + (step >= 2 ? "bg-primary text-white" : "bg-surface-container border-2 border-outline-variant text-outline");
    document.getElementById('linha-2-3').className = "w-12 md:w-24 h-1 rounded-full " + (step >= 3 ? "bg-primary" : "bg-outline-variant");
    
    document.getElementById('indicador-3').className = "flex items-center justify-center w-10 h-10 rounded-full font-bold " + (step >= 3 ? "bg-primary text-white" : "bg-surface-container border-2 border-outline-variant text-outline");

    // Atualizar Título
    const titulos = ["", "Dados do Aventureiro", "Ficha Médica Exaustiva", "Autorizações e Termo"];
    const subs = ["", "Preencha as informações básicas da criança e dos responsáveis.", "Precisamos dessas informações para garantir a segurança no clube.", "Leia e assine os termos para concluir a inscrição."];
    document.getElementById('titulo-etapa').textContent = titulos[step];
    document.getElementById('subtitulo-etapa').textContent = subs[step];
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =================== TOGGLE LOGIC ===================
function toggleIgreja() {
    const val = document.getElementById('religiao').value;
    document.getElementById('div-igreja').classList.toggle('hidden', val !== 'Adventista do Sétimo Dia');
    document.getElementById('div-batizado').classList.toggle('hidden', val !== 'Adventista do Sétimo Dia');
}
function togglePlano() {
    document.getElementById('div-nome-plano').classList.toggle('hidden', document.getElementById('plano-saude').value !== 'Sim');
}
function toggleAlergia() {
    document.getElementById('div-qual-alergia').classList.toggle('hidden', document.getElementById('tem-alergia').value !== 'Sim');
}
function toggleMedicacao() {
    document.getElementById('div-qual-medicacao').classList.toggle('hidden', document.getElementById('tem-medicacao').value !== 'Sim');
}
function toggleDeficiencia() {
    document.getElementById('div-qual-deficiencia').classList.toggle('hidden', document.getElementById('tem-deficiencia').value !== 'Sim');
}
function toggleCirurgia() {
    document.getElementById('div-qual-cirurgia').classList.toggle('hidden', document.getElementById('tem-cirurgia').value !== 'Sim');
}
function toggleOutroResponsavel() {
    const val = document.getElementById('vinculo-responsavel').value;
    const divOutro = document.getElementById('div-nome-outro-responsavel');
    const inputOutro = document.getElementById('nome-outro-responsavel');
    if (val === 'Outro') {
        divOutro.classList.remove('hidden');
        inputOutro.required = true;
    } else {
        divOutro.classList.add('hidden');
        inputOutro.required = false;
        inputOutro.value = '';
    }
}
function toggleExtraTshirts() {
    const isChecked = document.getElementById('wantExtraTshirts').checked;
    const container = document.getElementById('extraTshirtsContainer');
    const extraTshirtsData = document.getElementById('extraTshirtsData');
    if (isChecked) {
        container.classList.remove('hidden');
        if (document.getElementById('extraTshirtsList').children.length === 0) {
            addExtraTshirtRow();
        }
    } else {
        container.classList.add('hidden');
        extraTshirtsData.value = "";
    }
}
function addExtraTshirtRow() {
    const list = document.getElementById('extraTshirtsList');
    const row = document.createElement('div');
    row.className = 'extra-tshirts-row flex gap-2 items-center';
    row.innerHTML = `
        <input type="number" min="1" value="1" class="extra-qty input-field" style="width: 80px;">
        <select class="extra-size input-field flex-1">
            <option value="2">Tamanho 2</option><option value="4">Tamanho 4</option>
            <option value="6">Tamanho 6</option><option value="8">Tamanho 8</option>
            <option value="10">Tamanho 10</option><option value="12">Tamanho 12</option><option value="14">Tamanho 14</option>
            <option value="P">P (Adulto)</option><option value="M">M (Adulto)</option><option value="G">G (Adulto)</option>
            <option value="Babylook P">Babylook P</option><option value="Babylook M">Babylook M</option><option value="Babylook G">Babylook G</option>
        </select>
        <button type="button" class="remove-btn text-error hover:bg-error-container p-2 rounded-full" title="Remover"><span class="material-symbols-outlined">close</span></button>
    `;
    row.querySelector('.remove-btn').addEventListener('click', () => {
        row.remove();
        updateExtraTshirtsData();
    });
    row.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('change', updateExtraTshirtsData);
    });
    list.appendChild(row);
    updateExtraTshirtsData();
}
function updateExtraTshirtsData() {
    const rows = document.querySelectorAll('.extra-tshirts-row');
    const extras = [];
    rows.forEach(row => {
        const qty = row.querySelector('.extra-qty').value;
        const size = row.querySelector('.extra-size').value;
        if (qty > 0) extras.push(`${qty}x ${size}`);
    });
    document.getElementById('extraTshirtsData').value = extras.join(' | ');
}

// =================== SUBMIT LOGIC ===================
document.getElementById('formInscricao').addEventListener('submit', async function(e) {
    e.preventDefault();

    if(!document.getElementById('aceito-termos').checked) {
        alert("Você deve aceitar os termos de LGPD e imagem.");
        return;
    }

    // Mostrar o loader
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('loader').classList.add('flex');

    const checkboxes = document.querySelectorAll('input[name="doencas"]:checked');
    const doencas = Array.from(checkboxes).map(cb => cb.value).join(', ');

    // Mapear telefone e email com base no vínculo para preencher corretamente a planilha
    const vinculo = document.getElementById('vinculo-responsavel').value;
    const telPrincipal = document.getElementById('telefone-contato').value;
    const emailPrincipal = document.getElementById('email-responsavel').value;

    let fatherPhone = '';
    let fatherEmail = '';
    let motherPhone = '';
    let motherEmail = '';

    if (vinculo === 'Pai') {
        fatherPhone = telPrincipal;
        fatherEmail = emailPrincipal;
    } else if (vinculo === 'Mãe') {
        motherPhone = telPrincipal;
        motherEmail = emailPrincipal;
    } else {
        motherPhone = telPrincipal;
        motherEmail = emailPrincipal;
    }

    const payload = {
        action: 'addInscricao',
        data: {
            childName: document.getElementById('nome-crianca').value,
            fatherName: document.getElementById('nome-pai').value,
            motherName: document.getElementById('nome-mae').value,
            cpfResponsavel: document.getElementById('cpf-responsavel').value,
            vinculoResponsavel: vinculo,
            nomeOutroResponsavel: document.getElementById('nome-outro-responsavel') ? document.getElementById('nome-outro-responsavel').value : '',
            escolaridadePai: document.getElementById('escolaridade-pai').value,
            cursoPai: '',
            escolaridadeMae: document.getElementById('escolaridade-mae').value,
            cursoMae: '',
            profSaudePai: document.getElementById('saude-pai').value,
            qualProfPai: document.getElementById('prof-pai').value,
            profSaudeMae: document.getElementById('saude-mae').value,
            qualProfMae: document.getElementById('prof-mae').value,
            childDob: document.getElementById('data-nasc').value,
            childAge: document.getElementById('idade').value,
            childSex: document.getElementById('genero').value,
            fatherPhone: fatherPhone,
            fatherEmail: fatherEmail,
            motherPhone: motherPhone,
            motherEmail: motherEmail,
            baptized: document.getElementById('batizado') ? document.getElementById('batizado').value : 'Não',
            tshirtSize: document.getElementById('tam-camiseta').value,
            extraTshirtsData: document.getElementById('extraTshirtsData') ? document.getElementById('extraTshirtsData').value : '',
            emergencyName: document.getElementById('nome-emergencia').value,
            emergencyPhone: document.getElementById('telefone-emergencia').value,
            healthPlan: document.getElementById('plano-saude').value === 'Sim' ? document.getElementById('nome-plano').value : 'Não',
            bloodType: document.getElementById('tipoSanguineo').value,
            doencas: doencas,
            allergies: document.getElementById('tem-alergia').value === 'Sim' ? document.getElementById('qual-alergia').value : 'Não',
            remediosAlergia: document.getElementById('remedios-alergia') ? document.getElementById('remedios-alergia').value : '',
            ferimento: document.getElementById('ferimento') ? document.getElementById('ferimento').value : '',
            fratura: document.getElementById('fratura') ? document.getElementById('fratura').value : '',
            imobilizado: document.getElementById('imobilizado') ? document.getElementById('imobilizado').value : '',
            cirurgias: document.getElementById('qual-cirurgia') ? document.getElementById('qual-cirurgia').value : '',
            internacao: document.getElementById('internacao') ? document.getElementById('internacao').value : '',
            medications: document.getElementById('tem-medicacao').value === 'Sim' ? document.getElementById('qual-medicacao').value : 'Não',
            deficiencias: document.getElementById('tem-deficiencia').value === 'Sim' ? document.getElementById('qual-deficiencia').value : 'Não',
            obsMedica: document.getElementById('obs-medica') ? document.getElementById('obs-medica').value : ''
        }
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });

        document.getElementById('loader').classList.add('hidden');
        document.getElementById('loader').classList.remove('flex');
        
        // Mostrar modal de sucesso customizado
        mostrarModalSucesso();
        
    } catch (error) {
        console.error('Erro na Inscrição:', error);
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('loader').classList.remove('flex');
        const errBox = document.getElementById('error-message');
        if (errBox) {
            errBox.innerHTML = `Houve um erro ao enviar os dados.<br><span class="text-xs font-mono">Erro: ${error.message}</span><br>Se o erro persistir, verifique as configurações do seu navegador ou de extensões de bloqueio (como AdBlock/Brave).`;
            errBox.classList.remove('hidden');
        } else {
            alert('Erro de conexão: ' + error.message);
        }
    }
});

// Funções para controle do Modal de Sucesso
function mostrarModalSucesso() {
    const modal = document.getElementById('modal-sucesso');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.querySelector('.transform').classList.remove('scale-95');
        modal.querySelector('.transform').classList.add('scale-100');
    }, 10);
}

function fecharSucesso() {
    window.location.href = 'index.html';
}
