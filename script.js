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
        const tipoCadastro = document.getElementById('tipo-cadastro') ? document.getElementById('tipo-cadastro').value : 'Aventureiro';
        let requiredFields = [];
        
        if (tipoCadastro !== 'Aventureiro(a)') {
            requiredFields = [
                'nome-crianca', 'cpf-cadastro', 'adulto-email', 'adulto-telefone', 'adulto-profissao', 'adulto-escolaridade',
                'telefone-emergencia', 'nome-emergencia',
                'cep', 'rua', 'numero-end', 'bairro', 'cidade', 'estado'
            ];
        } else {
            requiredFields = [
                'nome-crianca', 'data-nasc', 'idade', 'genero', 'tam-camiseta', 'cpf-cadastro',
                'nome-mae', 'cpf-mae', 'prof-mae', 'telefone-mae', 'email-mae',
                'nome-pai', 'cpf-pai', 'prof-pai', 'telefone-contato', 'email-responsavel', 
                'cpf-responsavel', 'telefone-emergencia', 'nome-emergencia',
                'cep', 'rua', 'numero-end', 'bairro', 'cidade', 'estado'
            ];
        }

        // Limpar estilos de erro anteriores
        requiredFields.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.borderColor = '';
                el.style.boxShadow = '';
            }
        });

        // Validar e destacar
        let missingField = null;
        for (const id of requiredFields) {
            const el = document.getElementById(id);
            if (el) {
                // Verificar se o elemento está visível
                const isVisible = el.offsetWidth > 0 || el.offsetHeight > 0 || el.offsetParent !== null;
                if (isVisible && (!el.value || el.value.trim() === '')) {
                    missingField = el;
                    break;
                }
            }
        }

        if (missingField) {
            missingField.focus();
            missingField.style.borderColor = '#ba1a1a'; // Cor de erro
            missingField.style.boxShadow = '0 0 0 4px rgba(186, 26, 26, 0.15)';
            
            // Tenta pegar o label correspondente
            let labelText = '';
            const label = document.querySelector(`label[for="${missingField.id}"]`) || missingField.previousElementSibling;
            if (label) {
                labelText = label.textContent.replace('*', '').trim();
            } else {
                labelText = missingField.placeholder || missingField.id;
            }
            
            alert(`Por favor, preencha o campo obrigatório: "${labelText}"`);
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

    // Ler telefones e e-mails direto dos campos dedicados
    const fatherPhone = document.getElementById('telefone-pai') ? document.getElementById('telefone-pai').value : '';
    const fatherEmail = document.getElementById('email-pai') ? document.getElementById('email-pai').value : '';
    const motherPhone = document.getElementById('telefone-mae') ? document.getElementById('telefone-mae').value : '';
    const motherEmail = document.getElementById('email-mae') ? document.getElementById('email-mae').value : '';

    // Ler foto se selecionada
    const fotoInput = document.getElementById('foto-input');
    let fotoBase64 = '';
    if (fotoInput && fotoInput.files && fotoInput.files[0]) {
        try {
            fotoBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = () => reject('');
                reader.readAsDataURL(fotoInput.files[0]);
            });
        } catch(e) { fotoBase64 = ''; }
    }

    const vinculo = document.getElementById('vinculo-responsavel') ? document.getElementById('vinculo-responsavel').value : '';
    const tipoCadastro = document.getElementById('tipo-cadastro') ? document.getElementById('tipo-cadastro').value : 'Aventureiro';
    const classeCalculada = document.getElementById('classe') ? document.getElementById('classe').value : '';
    const idadeCalculada = document.getElementById('idade') ? document.getElementById('idade').value : '';

    const isAdulto = tipoCadastro !== 'Aventureiro(a)';
    const cpfVal = isAdulto 
        ? (document.getElementById('cpf-cadastro') ? document.getElementById('cpf-cadastro').value : '')
        : (document.getElementById('cpf-responsavel') ? document.getElementById('cpf-responsavel').value : '');
    const emailVal = isAdulto 
        ? (document.getElementById('adulto-email') ? document.getElementById('adulto-email').value : '')
        : (document.getElementById('email-responsavel') ? document.getElementById('email-responsavel').value : '');

    const payload = {
        action: 'addInscricao',
        data: {
            'TipoInscricao': tipoCadastro,
            'Cargo': tipoCadastro,
            'Escolaridade': isAdulto ? (document.getElementById('adulto-escolaridade') ? document.getElementById('adulto-escolaridade').value : '') : '',
            'Profissão': isAdulto ? (document.getElementById('adulto-profissao') ? document.getElementById('adulto-profissao').value : '') : '',
            'Nome Criança': document.getElementById('nome-crianca') ? document.getElementById('nome-crianca').value : '',
            'Nome Pai': document.getElementById('nome-pai') ? document.getElementById('nome-pai').value : '',
            'CPF Pai': document.getElementById('cpf-pai') ? document.getElementById('cpf-pai').value : '',
            'Nome Mãe': document.getElementById('nome-mae') ? document.getElementById('nome-mae').value : '',
            'CPF Mãe': document.getElementById('cpf-mae') ? document.getElementById('cpf-mae').value : '',
            'CPF': document.getElementById('cpf-cadastro') ? document.getElementById('cpf-cadastro').value : '',
            'CPF Responsável': cpfVal,
            'Vínculo Responsável': isAdulto ? 'Próprio' : vinculo,
            'Nome Outro Responsável': document.getElementById('nome-outro-responsavel') ? document.getElementById('nome-outro-responsavel').value : '',
            'Escolaridade Pai': document.getElementById('escolaridade-pai') ? document.getElementById('escolaridade-pai').value : '',
            'Curso Pai': '',
            'Escolaridade Mãe': document.getElementById('escolaridade-mae') ? document.getElementById('escolaridade-mae').value : '',
            'Curso Mãe': '',
            'Profissional Saúde Pai': document.getElementById('saude-pai') ? document.getElementById('saude-pai').value : '',
            'Qual Profissão Pai': document.getElementById('prof-pai') ? document.getElementById('prof-pai').value : '',
            'Profissional Saúde Mãe': document.getElementById('saude-mae') ? document.getElementById('saude-mae').value : '',
            'Qual Profissão Mãe': document.getElementById('prof-mae') ? document.getElementById('prof-mae').value : '',
            'Data Nasc': document.getElementById('data-nasc') ? document.getElementById('data-nasc').value : '',
            'Idade': idadeCalculada,
            'Classe': classeCalculada,
            'Sexo': document.getElementById('genero') ? document.getElementById('genero').value : '',
            'Telefone Pai': fatherPhone,
            'Email Pai': fatherEmail,
            'Telefone Mãe': motherPhone,
            'Email Mãe': motherEmail,
            'Email Responsável': emailVal,
            'Telefone Responsável': isAdulto 
                ? (document.getElementById('adulto-telefone') ? document.getElementById('adulto-telefone').value : '')
                : (document.getElementById('telefone-contato') ? document.getElementById('telefone-contato').value : ''),
            'ReceberEmailEm': isAdulto ? 'Responsável Legal' : (document.getElementById('receber-email-em') ? document.getElementById('receber-email-em').value : 'Responsável Legal'),
            'Batizado': document.getElementById('batizado') ? document.getElementById('batizado').value : 'Não',
            'CEP': document.getElementById('cep') ? document.getElementById('cep').value : '',
            'Rua': document.getElementById('rua') ? document.getElementById('rua').value : '',
            'Número': document.getElementById('numero-end') ? document.getElementById('numero-end').value : '',
            'Complemento': document.getElementById('complemento') ? document.getElementById('complemento').value : '',
            'Bairro': document.getElementById('bairro') ? document.getElementById('bairro').value : '',
            'Cidade': document.getElementById('cidade') ? document.getElementById('cidade').value : '',
            'Estado': document.getElementById('estado') ? document.getElementById('estado').value : '',
            'Tamanho Camiseta': document.getElementById('tam-camiseta') ? document.getElementById('tam-camiseta').value : '',
            'Camisetas Extras': document.getElementById('extraTshirtsData') ? document.getElementById('extraTshirtsData').value : '',
            'Contato Emergência Nome': document.getElementById('nome-emergencia') ? document.getElementById('nome-emergencia').value : '',
            'Contato Emergência Fone': document.getElementById('telefone-emergencia') ? document.getElementById('telefone-emergencia').value : '',
            'Cartão SUS/Plano': document.getElementById('plano-saude') && document.getElementById('plano-saude').value === 'Sim' ? document.getElementById('nome-plano').value : 'Não',
            'Tipagem Sanguínea': document.getElementById('tipoSanguineo') ? document.getElementById('tipoSanguineo').value : '',
            'Doenças Prévias': doencas,
            'Alergias': document.getElementById('tem-alergia') && document.getElementById('tem-alergia').value === 'Sim' ? document.getElementById('qual-alergia').value : 'Não',
            'Remédios para Alergias': document.getElementById('remedios-alergia') ? document.getElementById('remedios-alergia').value : '',
            'Ferimento recente': document.getElementById('ferimento') ? document.getElementById('ferimento').value : '',
            'Fratura recente': document.getElementById('fratura') ? document.getElementById('fratura').value : '',
            'Tempo imobilizado': document.getElementById('imobilizado') ? document.getElementById('imobilizado').value : '',
            'Cirurgias': document.getElementById('qual-cirurgia') ? document.getElementById('qual-cirurgia').value : '',
            'Motivo Internação': document.getElementById('internacao') ? document.getElementById('internacao').value : '',
            'Medicamentos Contínuos': document.getElementById('tem-medicacao') && document.getElementById('tem-medicacao').value === 'Sim' ? document.getElementById('qual-medicacao').value : 'Não',
            'Deficiência/Condição': document.getElementById('tem-deficiencia') && document.getElementById('tem-deficiencia').value === 'Sim' ? document.getElementById('qual-deficiencia').value : 'Não',
            'Observação Médica': document.getElementById('obs-medica') ? document.getElementById('obs-medica').value : '',
            'FotoBase64': fotoBase64
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
    const tipo = document.getElementById('tipo-cadastro') ? document.getElementById('tipo-cadastro').value : 'Aventureiro(a)';
    const msgEl = document.getElementById('sucesso-mensagem');
    if (msgEl) {
        if (tipo !== 'Aventureiro(a)') {
            msgEl.textContent = 'Os dados foram salvos com sucesso. A diretoria do clube fará contato em breve!';
        } else {
            msgEl.textContent = 'Os dados do aventureiro foram salvos com sucesso na nossa planilha. A diretoria do clube fará a avaliação em breve!';
        }
    }
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

// Função para preview da foto da criança
function previewFoto(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('foto-preview');
        const placeholder = document.getElementById('foto-placeholder');
        if (preview) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        }
        if (placeholder) placeholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// =================== IDADE E CLASSE ===================
function calcularIdadeEClasse() {
    const dataNascInput = document.getElementById('data-nasc');
    const idadeInput = document.getElementById('idade');
    const classeInput = document.getElementById('classe');
    const infoDiv = document.getElementById('info-idade-classe');
    if (!dataNascInput || !dataNascInput.value) return;

    const hoje = new Date();
    const nasc = new Date(dataNascInput.value);
    let anos = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;

    let classe = '';
    let icone = '';
    if (anos <= 5)      { classe = 'Bebes/Baby'; icone = '👶'; }
    else if (anos === 6) { classe = 'Abelhinhas Laboriosas'; icone = '🐝'; }
    else if (anos === 7) { classe = 'Luminares'; icone = '⭐'; }
    else if (anos === 8) { classe = 'Edificadores'; icone = '🏗️'; }
    else if (anos === 9) { classe = 'Mãos Ajudadoras'; icone = '🤜'; }
    else                { classe = 'Visitante'; icone = '👤'; }

    if (idadeInput) idadeInput.value = anos;
    if (classeInput) classeInput.value = classe;
    if (infoDiv) {
        infoDiv.innerHTML = `<span class="material-symbols-outlined text-base text-primary">child_care</span>
            <strong>${anos} anos</strong> &mdash; Classe: <strong class="text-primary">${icone} ${classe}</strong>`;
        infoDiv.classList.remove('text-on-surface-variant', 'italic');
        infoDiv.classList.add('text-on-surface', 'font-medium');
    }
}

// =================== BUSCA CEP ===================
async function buscarCEP(cep) {
    const numeros = cep.replace(/\D/g, '');
    if (numeros.length !== 8) return;
    try {
        const res = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
        const data = await res.json();
        if (data.erro) return;
        if (document.getElementById('rua')) document.getElementById('rua').value = data.logradouro || '';
        if (document.getElementById('bairro')) document.getElementById('bairro').value = data.bairro || '';
        if (document.getElementById('cidade')) document.getElementById('cidade').value = data.localidade || '';
        if (document.getElementById('estado')) document.getElementById('estado').value = data.uf || '';
    } catch(e) { /* silencia erro de rede */ }
}
