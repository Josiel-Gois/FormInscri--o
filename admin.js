// URL da API fornecida em config.js
// Copie config.example.js para config.js e defina a URL localmente.
// config.js não deve ser commitado no GitHub.

let appData = {
    inscricoes: [],
    apontamentos: [],
    atividades: [],
    apoiadores: [],
    calendario: []
};

document.addEventListener('DOMContentLoaded', () => {
    checkLogin();

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-submit-btn') || e.target.querySelector('button');
        const errEl = document.getElementById('login-error');
        
        btn.innerHTML = '<span>Carregando...</span> <span class="animate-spin material-symbols-outlined">progress_activity</span>';
        btn.disabled = true;
        if (errEl) errEl.classList.add('hidden');

        try {
            const res = await fetchGET('login', `&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
            if (res && res.success && res.user) {
                localStorage.setItem('icebergUser', JSON.stringify(res.user));
                checkLogin();
            } else {
                if (errEl) {
                    errEl.textContent = (res && res.error) ? res.error : 'E-mail ou senha incorretos.';
                    errEl.classList.remove('hidden');
                }
                btn.innerHTML = '<span>Entrar</span> <span class="material-symbols-outlined">trending_flat</span>';
                btn.disabled = false;
            }
        } catch (err) {
            console.error("Erro ao autenticar", err);
            if (errEl) {
                errEl.textContent = 'Erro ao conectar ao servidor. Tente novamente.';
                errEl.classList.remove('hidden');
            }
            btn.innerHTML = '<span>Entrar</span> <span class="material-symbols-outlined">trending_flat</span>';
            btn.disabled = false;
        }
    });

    const tabs = document.querySelectorAll('.nav-links li');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.nav-links li').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            tab.classList.add('active');
            const targetContent = document.getElementById(tab.dataset.tab);
            if (targetContent) targetContent.classList.remove('hidden');
            
            // Fechar sidebar drawer se aberto (apenas no mobile)
            if (window.innerWidth < 1024 && typeof isDrawerOpen !== 'undefined' && isDrawerOpen) {
                toggleDrawer();
            }
        });
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('icebergUser');
        window.location.reload();
    });

    // Clique no banner do dashboard redireciona para Calendário
    const banner = document.getElementById('banner-guia-atividade');
    if (banner) {
        banner.addEventListener('click', () => {
            const calTab = document.querySelector('[data-tab="tab-calendario"]');
            if (calTab) calTab.click();
        });
    }

    // Handlers para novos formulários
    const formUsuario = document.getElementById('form-usuario');
    if (formUsuario) {
        formUsuario.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoader(true);
            
            const row = document.getElementById('usuario-row-id').value;
            const nome = document.getElementById('usuario-nome').value;
            const email = document.getElementById('usuario-email').value;
            const senha = document.getElementById('usuario-senha').value;
            const nivel = document.getElementById('usuario-nivel').value;
            const fileInput = document.getElementById('usuario-foto');
            
            let fotoBase64 = '';
            if (fileInput && fileInput.files.length > 0) {
                try {
                    fotoBase64 = await getBase64(fileInput.files[0]);
                } catch (err) {
                    console.error("Erro ao ler imagem", err);
                }
            }
            
            const payload = { nome, email, senha, nivel, fotoBase64 };
            
            if (row) {
                await fetchPOST({ action: 'updateUsuario', row: parseInt(row), data: payload });
            } else {
                await fetchPOST({ action: 'addUsuario', data: payload });
            }
            
            closeModal('modal-usuario');
            e.target.reset();
            setTimeout(loadAllData, 1500);
        });
    }

    const formFinEntrada = document.getElementById('form-financeiro-entrada');
    if (formFinEntrada) {
        formFinEntrada.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoader(true);
            
            const row = document.getElementById('entrada-row-id').value;
            const data = document.getElementById('entrada-data').value;
            const categoria = document.getElementById('entrada-categoria').value;
            const crianca = document.getElementById('entrada-crianca').value;
            const valor = document.getElementById('entrada-valor').value;
            const descricao = document.getElementById('entrada-descricao').value;
            const detalheOutros = document.getElementById('entrada-detalhe-outros').value;
            
            let responsavelDoador;
            if (categoria === 'Mensalidade' || categoria === 'Inscrição') {
                responsavelDoador = document.getElementById('entrada-doador-select').value;
            } else if (categoria === 'Doação') {
                responsavelDoador = document.getElementById('entrada-doador').value;
            } else {
                responsavelDoador = document.getElementById('entrada-responsavel').value;
            }
            
            const action = row ? 'updateFinanceiro' : 'addFinanceiro';
            
            await fetchPOST({
                action,
                row: row ? parseInt(row) : undefined,
                data: {
                    data,
                    tipo: 'Entrada',
                    categoria,
                    crianca: (categoria === 'Mensalidade' || categoria === 'Inscrição') ? crianca : '',
                    responsavelDoador,
                    valor: parseFloat(valor),
                    descricao,
                    detalheOutros: categoria === 'Outros' ? detalheOutros : '',
                    nf: ''
                }
            });
            
            closeModal('modal-financeiro-entrada');
            e.target.reset();
            setTimeout(loadAllData, 1500);
        });
    }

    const formFinSaida = document.getElementById('form-financeiro-saida');
    if (formFinSaida) {
        formFinSaida.addEventListener('submit', async (e) => {
            e.preventDefault();
            showLoader(true);
            
            const row = document.getElementById('saida-row-id').value;
            const data = document.getElementById('saida-data').value;
            const categoria = document.getElementById('saida-categoria').value;
            const valor = document.getElementById('saida-valor').value;
            const nf = document.getElementById('saida-nf').value;
            const descricao = document.getElementById('saida-descricao').value;
            const responsavel = document.getElementById('saida-responsavel').value;
            
            const action = row ? 'updateFinanceiro' : 'addFinanceiro';
            
            await fetchPOST({
                action,
                row: row ? parseInt(row) : undefined,
                data: {
                    data,
                    tipo: 'Saída',
                    categoria,
                    crianca: '',
                    responsavelDoador: responsavel,
                    valor: parseFloat(valor),
                    descricao,
                    detalheOutros: '',
                    nf
                }
            });
            
            closeModal('modal-financeiro-saida');
            e.target.reset();
            setTimeout(loadAllData, 1500);
        });
    }

    const formFinRelatorio = document.getElementById('form-financeiro-relatorio');
    if (formFinRelatorio) {
        formFinRelatorio.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const deVal = document.getElementById('fin-relatorio-de').value;
            const ateVal = document.getElementById('fin-relatorio-ate').value;
            
            const startDate = new Date(deVal);
            const endDate = new Date(ateVal);
            
            const filtered = appData.financeiro.filter(f => {
                const d = new Date(f.Data);
                return d >= startDate && d <= endDate;
            });
            
            let entries = 0;
            let withdrawals = 0;
            
            filtered.forEach(f => {
                const valor = parseFloat(f.Valor || 0);
                if (f.Tipo === 'Entrada') {
                    entries += valor;
                } else {
                    withdrawals += valor;
                }
            });
            
            const balance = entries - withdrawals;
            
            const summaryGrid = document.getElementById('fin-relatorio-summary-grid');
            if (summaryGrid) {
                summaryGrid.innerHTML = `
                    <div class="bg-surface-container p-3 rounded-xl">
                        <span class="text-xs text-on-surface-variant block">Período</span>
                        <span class="text-sm font-bold text-primary">${new Date(deVal).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - ${new Date(ateVal).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                    </div>
                    <div class="bg-green-50 p-3 rounded-xl">
                        <span class="text-xs text-green-700 block">Entradas</span>
                        <span class="text-sm font-bold text-green-600">${entries.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div class="bg-red-50 p-3 rounded-xl">
                        <span class="text-xs text-red-700 block">Saídas</span>
                        <span class="text-sm font-bold text-red-600">${withdrawals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div class="${balance >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-xl">
                        <span class="text-xs ${balance >= 0 ? 'text-green-800' : 'text-red-800'} block">Saldo Período</span>
                        <span class="text-sm font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}">${balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                `;
            }
            
            document.getElementById('financeiro-relatorio-view').classList.remove('hidden');
            
            const ctx = document.getElementById('chartFinanceiroRelatorio').getContext('2d');
            if (chartRelatorioInstance) chartRelatorioInstance.destroy();
            
            chartRelatorioInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Entradas', 'Saídas'],
                    datasets: [{
                        data: [entries, withdrawals],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
            
            closeModal('modal-financeiro-relatorio');
        });
    }
});

async function fetchGET(action, params = '') {
    const url = `${API_URL}?action=${action}${params}`;
    const response = await fetch(url);
    return await response.json();
}

async function fetchPOST(payload) {
    await fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
    });
    return { success: true };
}

function checkLogin() {
    const user = JSON.parse(localStorage.getItem('icebergUser'));
    if (user) {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        document.getElementById('user-name-display').textContent = `Olá, ${user.name || user.Nome || 'Usuário'}`;
        
const welcomeEl = document.getElementById('user-greeting');
        if (welcomeEl) {
            const gender = String(user.gender || user.genero || user.sexo || '').toLowerCase();
            const prefix = /(masculino|male|m)$/i.test(gender) ? 'Bem-vindo' : 'Bem-vinda';
            welcomeEl.textContent = `${prefix}, ${user.name || user.Nome || 'usuário'}`;
        }
        
        // Renderizar avatar dinâmico do usuário e aplicar RBAC
        renderUserAvatar(user);
        applyRoleAccess(user.role);
        
        loadAllData();
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
    }
}

function renderUserAvatar(user) {
    const container = document.getElementById('user-avatar-container');
    if (!container) return;
    const photo = user.foto || user.Foto || user.photo || user.image || user.avatar || user.fotoBase64 || user.FotoBase64;
    const name = user.name || user.Nome || 'Usuário';
    if (photo) {
        container.innerHTML = `<img src="${photo}" alt="${name}" class="w-full h-full object-cover">`;
        return;
    }

    const userName = name.toString().toLowerCase();
    if (userName.includes('daiane') || userName.includes('maria') || userName.includes('ana') || userName.includes('luana')) {
        container.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" class="w-7 h-7 text-primary" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.3"/>
                <path d="M12 12C9.33333 12 4 13.3333 4 16V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V16C20 13.3333 14.6667 12 12 12Z" fill="currentColor"/>
                <path d="M9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7Z" fill="currentColor"/>
                <path d="M6 10C6 10 7.5 7.5 9 6C10.5 4.5 13.5 4.5 15 6C16.5 7.5 18 10 18 10C18 10 18.5 7 17 5C15.5 3 12.5 2 12 2C11.5 2 8.5 3 7 5C5.5 7 6 10 6 10Z" fill="currentColor"/>
            </svg>
        `;
        return;
    }

    container.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6 text-primary" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor" opacity="0.3"/>
            <path d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
        </svg>
    `;
}

function hasFullAccess() {
    const user = JSON.parse(localStorage.getItem('icebergUser'));
    return user && (user.role === 'Admin' || user.role === 'Diretor');
}

function applyRoleAccess(role) {
    const isFullAccess = (role === 'Admin' || role === 'Diretor');
    
    // Oculta/mostra guias no sidebar
    const sidebarItems = document.querySelectorAll('.nav-links li');
    sidebarItems.forEach(item => {
        const tabName = item.dataset.tab;
        if (!isFullAccess && tabName !== 'tab-dashboard' && tabName !== 'tab-calendario') {
            item.classList.add('hidden');
        } else {
            item.classList.remove('hidden');
        }
    });

    // Se o usuário não tem acesso total e está em uma aba restrita, redireciona para o dashboard
    if (!isFullAccess) {
        const activeItem = document.querySelector('.nav-links li.active');
        if (activeItem) {
            const activeTab = activeItem.dataset.tab;
            if (activeTab !== 'tab-dashboard' && activeTab !== 'tab-calendario') {
                const dashTab = document.querySelector('[data-tab="tab-dashboard"]');
                if (dashTab) {
                    dashTab.click();
                }
            }
        }
    }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if(show) loader.classList.remove('hidden');
    else loader.classList.add('hidden');
}

async function loadAllData() {
    showLoader(true);
    try {
        const allData = await fetchGET('getAllData');
        appData.inscricoes = allData.inscricoes || [];
        appData.atividades = allData.atividades || [];
        appData.apontamentos = allData.apontamentos || [];
        appData.apoiadores = allData.apoiadores || [];
        appData.calendario = allData.calendario || [];
        appData.usuarios = allData.usuarios || [];
        appData.financeiro = allData.financeiro || [];
        
        populateChildDropdown();
        
        renderDashboard();
        renderInscricoes();
        renderAtividades();
        renderApontamentos();
        renderApoiadores();
        renderCalendario();
        renderFinanceiro();
        renderUsuarios();
    } catch (error) {
        console.error("Erro ao carregar dados", error);
    }
    showLoader(false);
}

// ================= RENDER FUNCTIONS =================

function renderDashboard() {
    const total = appData.inscricoes.length;
    document.getElementById('stat-total').textContent = total;
    
    const activeInscricoes = appData.inscricoes.filter(i => String(i.Status || '').trim() !== 'Cancelada');
    const recebidas = activeInscricoes.filter(i => String(i.Status).trim() === 'Recebida').length;
    const aceitas = activeInscricoes.filter(i => String(i.Status).trim() === 'Aceita').length;
    const finalizadas = activeInscricoes.filter(i => String(i.Status).trim() === 'Cadastro finalizado').length;
    
    document.getElementById('stat-recebidas').textContent = recebidas;
    document.getElementById('stat-aceitas').textContent = aceitas;
    const finEl = document.getElementById('stat-finalizadas');
    if (finEl) finEl.textContent = finalizadas;

    // Apoiadores do Mês (doadores únicos + total de doações no mês corrente)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const doacoesMes = (appData.financeiro || []).filter(f => {
        if (f.Tipo !== 'Entrada' || f.Categoria !== 'Doação') return false;
        const d = new Date(f.Data);
        return !isNaN(d.getTime()) && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
    });
    const doadoresUnicos = new Set(doacoesMes.map(f => (f.ResponsavelDoador || '').trim()).filter(n => n)).size;
    const totalDoadoMes = doacoesMes.reduce((acc, f) => acc + parseFloat(f.Valor || 0), 0);
    
    document.getElementById('stat-apoiadores').textContent = doadoresUnicos;
    const apoiValEl = document.getElementById('stat-apoiadores-valor');
    if (apoiValEl) apoiValEl.textContent = totalDoadoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) + ' doados';

    // Calculate percentages
    const pctRecebidas = total ? Math.round((recebidas / total) * 100) : 0;
    const pctAceitas = total ? Math.round((aceitas / total) * 100) : 0;
    const pctFinalizadas = total ? Math.round((finalizadas / total) * 100) : 0;

    const pctRecebidasEl = document.getElementById('pct-recebidas');
    const pctAceitasEl = document.getElementById('pct-aceitas');
    const pctFinalizadasEl = document.getElementById('pct-finalizadas');

    if (pctRecebidasEl) pctRecebidasEl.textContent = `${pctRecebidas}%`;
    if (pctAceitasEl) pctAceitasEl.textContent = `${pctAceitas}%`;
    if (pctFinalizadasEl) pctFinalizadasEl.textContent = `${pctFinalizadas}%`;

    renderChartStatus(recebidas, aceitas, finalizadas);
    renderChartCargos();
}

let chartStatusInstance = null;
function renderChartStatus(r, a, f) {
    const ctx = document.getElementById('chartStatus').getContext('2d');
    if(chartStatusInstance) chartStatusInstance.destroy();
    
    // Check if we have data to display, if not use placeholder
    const dataValues = (r === 0 && a === 0 && f === 0) ? [1, 1, 1] : [r, a, f];
    const borderColors = ['#eab308', '#22c55e', '#004bc3'];
    
    chartStatusInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { 
            labels: ['Recebidas', 'Aceitas', 'Finalizadas'], 
            datasets: [{ 
                data: dataValues, 
                backgroundColor: borderColors,
                borderWidth: 2,
                hoverOffset: 4
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // We use our own customized dynamic list underneath
                }
            },
            cutout: '70%'
        }
    });
}

let chartCargosInstance = null;
function renderChartCargos() {
    const cargosCount = {};
    appData.inscricoes.filter(i => String(i.Status || '').trim() !== 'Cancelada').forEach(i => { 
        let c = i.Cargo || 'Aventureiro(a)'; 
        cargosCount[c] = (cargosCount[c] || 0) + 1; 
    });
    
    const ctx = document.getElementById('chartCargos').getContext('2d');
    if(chartCargosInstance) chartCargosInstance.destroy();
    
    chartCargosInstance = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: Object.keys(cargosCount), 
            datasets: [{ 
                label: 'Quantidade', 
                data: Object.values(cargosCount), 
                backgroundColor: '#004bc3',
                borderRadius: 8,
                borderSkipped: false
            }] 
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11,
                            weight: '600'
                        },
                        color: '#424655'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(195, 198, 215, 0.3)'
                    },
                    ticks: {
                        font: {
                            family: 'Plus Jakarta Sans',
                            size: 11
                        },
                        color: '#424655',
                        precision: 0
                    }
                }
            }
        }
    });
}

function renderInscricoes() {
    const tbody = document.querySelector('#table-inscricoes tbody');
    const selectNome = document.getElementById('apontamento-nome');
    tbody.innerHTML = '';
    selectNome.innerHTML = '';

    const filterVal = document.getElementById('filter-status').value;
    const searchVal = document.getElementById('search-inscricao').value.toLowerCase();

    appData.inscricoes.forEach(insc => {
        const nome = String(insc['Nome Criança'] || '');
        const responsavel = String(insc['Nome Pai'] || insc['Nome Mãe'] || insc['Nome do Responsável'] || insc['Responsável'] || '');
        const status = String(insc.Status || 'Recebida');
        
        if (filterVal && status !== filterVal) return;
        if (searchVal && !nome.toLowerCase().includes(searchVal) && !responsavel.toLowerCase().includes(searchVal)) return;

        const opt = document.createElement('option');
        opt.value = nome; opt.textContent = nome;
        selectNome.appendChild(opt);

        let badgeClass = 'status-recebida';
        if (status === 'Aceita') badgeClass = 'status-aceita';
        if (status === 'Cadastro finalizado') badgeClass = 'status-finalizado';
        if (status === 'Cancelada') badgeClass = 'status-cancelada';

        let actionHtml = '';
        if (hasFullAccess()) {
            actionHtml += `<button class="btn btn-sm btn-edit" onclick="openEditStatus(${insc._row}, '${nome}', '${status}', '${insc.Cargo}')">Editar</button> `;
        }
        actionHtml += `<button class="btn btn-sm" onclick="printFichaSingle(${insc._row})">Imprimir</button>`;
        if (hasFullAccess()) {
            actionHtml += ` <button class="btn btn-sm btn-danger" onclick="deleteRow('Inscricoes', ${insc._row})">Excluir</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td><strong>${nome}</strong></td>
                <td>${insc.Idade || ''} anos</td>
                <td>${responsavel}</td>
                <td><span class="status-badge ${badgeClass}">${status}</span></td>
                <td>${insc.Cargo || 'Aventureiro(a)'}</td>
                <td>
                    ${actionHtml}
                </td>
            </tr>
        `;
    });
}

document.getElementById('filter-status').addEventListener('change', renderInscricoes);
document.getElementById('search-inscricao').addEventListener('input', renderInscricoes);

function renderAtividades() {
    const tbody = document.querySelector('#table-atividades tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    appData.atividades.forEach(a => {
        const actionsHtml = hasFullAccess() ? `
            <button class="btn btn-sm btn-outline" onclick="openEditAtividade(${a._row}, '${a['Data da Reunião']}', '${a['Atividade Realizada']}', '${a['Observações']}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteRow('Atividades', ${a._row})">Excluir</button>
        ` : '---';

        tbody.innerHTML += `<tr>
            <td>${new Date(a['Data da Reunião']).toLocaleDateString('pt-BR')}</td>
            <td>${a['Atividade Realizada']}</td>
            <td>${a['Observações'] || ''}</td>
            <td>${actionsHtml}</td>
        </tr>`;
    });
}

function renderApontamentos() {
    const tbody = document.querySelector('#table-apontamentos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    appData.apontamentos.forEach(a => {
        let pts = 0;
        if(a['Pontualidade']) pts++;
        if(a['Trouxe Material']) pts++;
        if(a['De Uniforme']) pts++;
        if(a['De Lenço']) pts++;
        if(a['Participativo']) pts++;

        const actionsHtml = hasFullAccess() ? `
            <button class="btn btn-sm btn-outline" onclick="openEditApontamento(${a._row}, '${a.Data}', '${a['Nome Aventureiro']}', ${a['Pontualidade']}, ${a['Trouxe Material']}, ${a['De Uniforme']}, ${a['De Lenço']}, ${a['Participativo']}, '${a.Observação || ''}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteRow('Apontamentos', ${a._row})">Del</button>
        ` : '---';

        tbody.innerHTML += `
            <tr>
                <td>${new Date(a.Data).toLocaleDateString('pt-BR')}</td>
                <td>${a['Nome Aventureiro']}</td>
                <td>${a['Pontualidade'] ? '✅' : '❌'}</td>
                <td>${a['Trouxe Material'] ? '✅' : '❌'}</td>
                <td>${a['De Uniforme'] ? '✅' : '❌'}</td>
                <td>${a['De Lenço'] ? '✅' : '❌'}</td>
                <td>${a['Participativo'] ? '✅' : '❌'}</td>
                <td><strong>${pts} pts</strong></td>
                <td>
                    ${actionsHtml}
                </td>
            </tr>
        `;
    });
}

function renderApoiadores() {
    const tbody = document.querySelector('#table-apoiadores tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    appData.apoiadores.forEach(a => {
        const actionsHtml = hasFullAccess() ? `
            <button class="btn btn-sm btn-outline" onclick="openEditApoiador(${a._row}, '${a['Nome do Apoiador']}', '${a['Empresa/Detalhe']}', '${a['Telefone']}', '${a['Email']}')">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="deleteRow('Apoiadores', ${a._row})">Excluir</button>
        ` : '---';

        tbody.innerHTML += `
            <tr>
                <td>${new Date(a['Data Cadastro']).toLocaleDateString('pt-BR')}</td>
                <td><strong>${a['Nome do Apoiador']}</strong></td>
                <td>${a['Empresa/Detalhe'] || ''}</td>
                <td>
                    ${actionsHtml}
                </td>
            </tr>
        `;
    });
}

function renderCalendario() {
    const user = JSON.parse(localStorage.getItem('icebergUser'));
    const isFullAccess = user && (user.role === 'Admin' || user.role === 'Diretor');
    
    const btnSeed = document.getElementById('btn-seed-calendario');
    const btnNovo = document.getElementById('btn-novo-evento');
    
    if (btnSeed) {
        if (!isFullAccess) btnSeed.style.setProperty('display', 'none', 'important');
        else if (appData.calendario.length === 0) btnSeed.style.display = 'inline-block';
        else btnSeed.style.display = 'none';
    }
    
    if (btnNovo) {
        if (!isFullAccess) btnNovo.classList.add('hidden');
        else btnNovo.classList.remove('hidden');
    }

    const tableHeader = document.querySelector('#table-calendario thead tr');
    if (tableHeader) {
        const headers = tableHeader.querySelectorAll('th');
        if (headers.length === 5) {
            headers[4].style.display = isFullAccess ? '' : 'none';
        }
    }

    const tbody = document.querySelector('#table-calendario tbody');
    tbody.innerHTML = '';
    
    const sorted = [...appData.calendario].sort((a,b) => new Date(a['Data do Evento']) - new Date(b['Data do Evento']));

    sorted.forEach(c => {
        let catColor = '#000';
        const cat = c.Categoria;
        if(cat === 'Reunião Regular') catColor = '#f59e0b';
        if(cat === 'Passeios e Atividades') catColor = '#10b981';
        if(cat === 'Prova do Clube') catColor = '#ef4444';
        if(cat === 'Eventos Especiais') catColor = '#6366f1';
        if(cat === 'Folga') catColor = '#6b7280';

        let actionHtml = isFullAccess ? `
            <td>
                <button class="btn btn-sm btn-outline" onclick="openEditCalendario(${c._row}, '${c['Data do Evento']}', '${c.Evento}', '${cat}', '${c.Detalhes || ''}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRow('Calendario', ${c._row})">Del</button>
            </td>
        ` : '';

        tbody.innerHTML += `
            <tr>
                <td><strong>${new Date(c['Data do Evento']).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</strong></td>
                <td>${c.Evento}</td>
                <td><span style="background-color: ${catColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${cat}</span></td>
                <td>${c.Detalhes || ''}</td>
                ${actionHtml}
            </tr>
        `;
    });
}

// ================= MODALS & ACTIONS =================

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

function openNewEntradaModal() {
    document.getElementById('entrada-row-id').value = '';
    const form = document.getElementById('form-financeiro-entrada');
    if (form) form.reset();
    toggleEntradaFields();
    
    const title = document.querySelector('#modal-financeiro-entrada h3');
    const btn = document.querySelector('#modal-financeiro-entrada button[type="submit"]');
    if (title) title.textContent = 'Lançar Entrada Financeira';
    if (btn) btn.textContent = 'Confirmar Lançamento';
    
    openModal('modal-financeiro-entrada');
}

function openNewSaidaModal() {
    document.getElementById('saida-row-id').value = '';
    const form = document.getElementById('form-financeiro-saida');
    if (form) form.reset();
    
    const title = document.querySelector('#modal-financeiro-saida h3');
    const btn = document.querySelector('#modal-financeiro-saida button[type="submit"]');
    if (title) title.textContent = 'Lançar Saída / Despesa';
    if (btn) {
        btn.textContent = 'Confirmar Saída';
        btn.className = 'btn btn-danger';
    }
    
    openModal('modal-financeiro-saida');
}

function openEditFinanceiro(row) {
    const record = appData.financeiro.find(f => f._row === row);
    if (!record) return;
    
    if (record.Tipo === 'Entrada') {
        document.getElementById('entrada-row-id').value = row;
        document.getElementById('entrada-data').value = record.Data ? new Date(record.Data).toISOString().split('T')[0] : '';
        document.getElementById('entrada-categoria').value = record.Categoria || 'Inscrição';
        
        toggleEntradaFields();
        
        if (record.Categoria === 'Mensalidade' || record.Categoria === 'Inscrição') {
            document.getElementById('entrada-crianca').value = record.Crianca || '';
            const selectDoador = document.getElementById('entrada-doador-select');
            if (selectDoador) selectDoador.value = record.ResponsavelDoador || '';
        } else if (record.Categoria === 'Doação') {
            document.getElementById('entrada-doador').value = record.ResponsavelDoador || '';
        } else if (record.Categoria === 'Outros') {
            document.getElementById('entrada-detalhe-outros').value = record.DetalheOutros || '';
        }
        
        document.getElementById('entrada-valor').value = record.Valor || '';
        document.getElementById('entrada-descricao').value = record.Descricao || '';
        document.getElementById('entrada-responsavel').value = record.ResponsavelDoador || '';
        
        const title = document.querySelector('#modal-financeiro-entrada h3');
        const btn = document.querySelector('#modal-financeiro-entrada button[type="submit"]');
        if (title) title.textContent = 'Editar Entrada Financeira';
        if (btn) btn.textContent = 'Salvar Alterações';
        
        openModal('modal-financeiro-entrada');
    } else {
        document.getElementById('saida-row-id').value = row;
        document.getElementById('saida-data').value = record.Data ? new Date(record.Data).toISOString().split('T')[0] : '';
        document.getElementById('saida-categoria').value = record.Categoria || 'Materiais';
        document.getElementById('saida-valor').value = record.Valor || '';
        document.getElementById('saida-nf').value = record.NF || '';
        document.getElementById('saida-descricao').value = record.Descricao || '';
        document.getElementById('saida-responsavel').value = record.ResponsavelDoador || '';
        
        const title = document.querySelector('#modal-financeiro-saida h3');
        const btn = document.querySelector('#modal-financeiro-saida button[type="submit"]');
        if (title) title.textContent = 'Editar Saída / Despesa';
        if (btn) {
            btn.textContent = 'Salvar Alterações';
            btn.className = 'btn';
        }
        
        openModal('modal-financeiro-saida');
    }
}

function openEditStatus(row, nome, status, cargo) {
    document.getElementById('edit-row-id').value = row;
    document.getElementById('edit-child-name').textContent = `Inscrito: ${nome}`;
    document.getElementById('edit-status').value = status;
    document.getElementById('edit-cargo').value = cargo || 'Aventureiro(a)';
    openModal('modal-edit-status');
}

function openEditApoiador(row, nome, detalhe, telefone, email) {
    document.getElementById('edit-apoiador-row').value = row;
    document.getElementById('edit-apoiador-nome').value = nome || '';
    document.getElementById('edit-apoiador-detalhe').value = detalhe || '';
    document.getElementById('edit-apoiador-telefone').value = telefone || '';
    document.getElementById('edit-apoiador-email').value = email || '';
    openModal('modal-editar-apoiador');
}

function openEditAtividade(row, data, nome, obs) {
    document.getElementById('edit-atividade-row').value = row;
    document.getElementById('edit-atividade-data').value = data ? new Date(data).toISOString().split('T')[0] : '';
    document.getElementById('edit-atividade-nome').value = nome || '';
    document.getElementById('edit-atividade-obs').value = obs || '';
    openModal('modal-editar-atividade');
}

function openEditApontamento(row, data, nome, pont, mat, uni, len, part, obs) {
    document.getElementById('edit-apontamento-row').value = row;
    document.getElementById('edit-apontamento-data').value = data ? new Date(data).toISOString().split('T')[0] : '';
    document.getElementById('edit-apontamento-nome').value = nome || '';
    document.getElementById('edit-apontamento-pontual').checked = pont;
    document.getElementById('edit-apontamento-material').checked = mat;
    document.getElementById('edit-apontamento-uniforme').checked = uni;
    document.getElementById('edit-apontamento-lenco').checked = len;
    document.getElementById('edit-apontamento-participativo').checked = part;
    document.getElementById('edit-apontamento-obs').value = obs || '';
    openModal('modal-editar-apontamento');
}

function openEditCalendario(row, data, nome, cat, det) {
    document.getElementById('edit-calendario-row').value = row;
    document.getElementById('edit-calendario-data').value = data ? new Date(data).toISOString().split('T')[0] : '';
    document.getElementById('edit-calendario-nome').value = nome || '';
    document.getElementById('edit-calendario-categoria').value = cat || 'Reunião Regular';
    document.getElementById('edit-calendario-detalhes').value = det || '';
    openModal('modal-editar-calendario');
}

// Respective submit handlers
document.getElementById('form-edit-status').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'updateInscricao', 
        row: document.getElementById('edit-row-id').value, 
        status: document.getElementById('edit-status').value, 
        cargo: document.getElementById('edit-cargo').value 
    });
    closeModal('modal-edit-status');
    setTimeout(loadAllData, 1500);
});

document.getElementById('form-editar-apoiador').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'updateApoiador', 
        row: document.getElementById('edit-apoiador-row').value, 
        nome: document.getElementById('edit-apoiador-nome').value, 
        detalhe: document.getElementById('edit-apoiador-detalhe').value,
        telefone: document.getElementById('edit-apoiador-telefone').value,
        email: document.getElementById('edit-apoiador-email').value
    });
    closeModal('modal-editar-apoiador');
    setTimeout(loadAllData, 1500);
});

document.getElementById('form-editar-atividade').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'updateAtividade', 
        row: document.getElementById('edit-atividade-row').value, 
        dataReuniao: document.getElementById('edit-atividade-data').value, 
        atividade: document.getElementById('edit-atividade-nome').value,
        observacoes: document.getElementById('edit-atividade-obs').value
    });
    closeModal('modal-editar-atividade');
    setTimeout(loadAllData, 1500);
});

document.getElementById('form-editar-apontamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'updateApontamento', 
        row: document.getElementById('edit-apontamento-row').value, 
        data: document.getElementById('edit-apontamento-data').value, 
        nome: document.getElementById('edit-apontamento-nome').value,
        pontualidade: document.getElementById('edit-apontamento-pontual').checked,
        material: document.getElementById('edit-apontamento-material').checked,
        uniforme: document.getElementById('edit-apontamento-uniforme').checked,
        lenco: document.getElementById('edit-apontamento-lenco').checked,
        participativo: document.getElementById('edit-apontamento-participativo').checked,
        obs: document.getElementById('edit-apontamento-obs').value
    });
    closeModal('modal-editar-apontamento');
    setTimeout(loadAllData, 1500);
});

document.getElementById('form-editar-calendario').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'updateCalendario', 
        row: document.getElementById('edit-calendario-row').value, 
        dataEvento: document.getElementById('edit-calendario-data').value, 
        evento: document.getElementById('edit-calendario-nome').value,
        categoria: document.getElementById('edit-calendario-categoria').value,
        detalhes: document.getElementById('edit-calendario-detalhes').value
    });
    closeModal('modal-editar-calendario');
    setTimeout(loadAllData, 1500);
});

// Create Apontamento & Apoiador etc...
document.getElementById('form-apoiador').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'addApoiador', 
        nome: document.getElementById('apoiador-nome').value, 
        detalhe: document.getElementById('apoiador-detalhe').value, 
        telefone: document.getElementById('apoiador-telefone').value, 
        email: document.getElementById('apoiador-email').value 
    });
    closeModal('modal-apoiador'); e.target.reset(); setTimeout(loadAllData, 1500);
});

document.getElementById('form-atividade').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({ 
        action: 'addAtividade', 
        dataReuniao: document.getElementById('atividade-data').value, 
        atividade: document.getElementById('atividade-nome').value, 
        observacoes: document.getElementById('atividade-obs').value 
    });
    closeModal('modal-atividade'); e.target.reset(); setTimeout(loadAllData, 1500);
});

document.getElementById('form-apontamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({
        action: 'addApontamento',
        data: document.getElementById('apontamento-data').value,
        nome: document.getElementById('apontamento-nome').value,
        pontualidade: document.getElementById('apontamento-pontual').checked,
        material: document.getElementById('apontamento-material').checked,
        uniforme: document.getElementById('apontamento-uniforme').checked,
        lenco: document.getElementById('apontamento-lenco').checked,
        participativo: document.getElementById('apontamento-participativo').checked,
        obs: document.getElementById('apontamento-obs').value
    });
    closeModal('modal-apontamento'); e.target.reset(); setTimeout(loadAllData, 1500);
});

document.getElementById('form-calendario').addEventListener('submit', async (e) => {
    e.preventDefault();
    showLoader(true);
    await fetchPOST({
        action: 'addCalendario',
        dataEvento: document.getElementById('calendario-data').value,
        evento: document.getElementById('calendario-nome').value,
        categoria: document.getElementById('calendario-categoria').value,
        detalhes: document.getElementById('calendario-detalhes').value
    });
    closeModal('modal-calendario'); e.target.reset(); setTimeout(loadAllData, 1500);
});

window.seedCalendario = async () => {
    if(!confirm("Isso irá importar os eventos do Cronograma Oficial 2026. Deseja continuar?")) return;
    showLoader(true);
    
    const eventos = [
        { d: '2026-06-27', e: 'Abertura do Clube', c: 'Eventos Especiais' },
        { d: '2026-07-04', e: 'Folga', c: 'Folga' },
        { d: '2026-07-05', e: 'Prova de líder', c: 'Prova do Clube' },
        { d: '2026-07-11', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-07-18', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-07-25', e: 'Passeio no Zoológico', c: 'Passeios e Atividades' },
        { d: '2026-08-01', e: 'Passeio Bosque Reinhard', c: 'Passeios e Atividades' },
        { d: '2026-08-07', e: 'Folga - encontro distrital', c: 'Folga' },
        { d: '2026-08-15', e: 'Folga - Concurso bom de bíblia', c: 'Folga' },
        { d: '2026-08-22', e: 'Quebrando o Silêncio', c: 'Eventos Especiais' },
        { d: '2026-08-29', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-09-05', e: 'Folga', c: 'Folga' },
        { d: '2026-09-12', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-09-19', e: 'Folga - Dia mundial dos desbravadores', c: 'Folga' },
        { d: '2026-09-26', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-09-30', e: 'Prazo Final de entrega pasta de líder', c: 'Eventos Especiais' },
        { d: '2026-10-03', e: 'Folga', c: 'Folga' },
        { d: '2026-10-10', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-10-17', e: 'Folga', c: 'Folga' },
        { d: '2026-10-18', e: 'Dia do Pastor - homenagem aventureiros', c: 'Eventos Especiais' },
        { d: '2026-10-24', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-10-31', e: 'Folga', c: 'Folga' },
        { d: '2026-11-06', e: 'Encerramento ranking - Investidura (6-7 nov)', c: 'Eventos Especiais' },
        { d: '2026-11-14', e: 'Doação de Sangue - Pais e diretoria', c: 'Eventos Especiais' },
        { d: '2026-11-21', e: 'Reunião Regular', c: 'Reunião Regular' },
        { d: '2026-11-28', e: 'Folga', c: 'Folga' },
        { d: '2026-12-05', e: 'Passeio Cavernas Bacaetava - Encerramento', c: 'Passeios e Atividades' }
    ];

    for (let ev of eventos) {
        await fetchPOST({ action: 'addCalendario', dataEvento: ev.d, evento: ev.e, categoria: ev.c, detalhes: '' });
    }
    loadAllData();
};

async function deleteRow(sheetName, row) {
    if(confirm('Tem certeza que deseja excluir?')) {
        showLoader(true);
        await fetchPOST({ action: 'deleteRow', sheetName, row });
        setTimeout(loadAllData, 1500);
    }
}

// ================= REPORTS & PDF GENERATION =================

document.getElementById('form-pdf-atividades').addEventListener('submit', (e) => {
    e.preventDefault();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Relatório de Atividades - Iceberg Kids", 105, 20, null, null, "center");
    
    // Filtro simplificado, aqui pega tudo, mas o certo seria filtrar pelo período, 
    // mas o usuário pediu para calendario especificamente, vou seguir como estava para atividades
    const tableData = appData.atividades.map(a => [new Date(a['Data da Reunião']).toLocaleDateString('pt-BR'), a['Atividade Realizada'], a['Observações']]);
    doc.autoTable({ startY: 35, head: [['Data', 'Atividade', 'Observações']], body: tableData });
    doc.save(`Relatorio_Atividades.pdf`);
    closeModal('modal-pdf-atividades');
});

// Relatório de Calendário
document.getElementById('form-pdf-calendario').addEventListener('submit', (e) => {
    e.preventDefault();
    const periodo = document.getElementById('pdf-calendario-periodo').value;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Relatório de Calendário - Iceberg Kids", 105, 20, null, null, "center");

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let filtered = appData.calendario.filter(c => {
        if(!c['Data do Evento']) return false;
        const d = new Date(c['Data do Evento']);
        
        if (periodo === 'mensal') {
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        } else if (periodo === 'semestral') {
            // Próximos 6 meses a partir de hoje
            const sixMonthsLater = new Date();
            sixMonthsLater.setMonth(now.getMonth() + 6);
            return d >= now && d <= sixMonthsLater;
        } else if (periodo === 'anual') {
            return d.getFullYear() === currentYear;
        }
        return true; // tudo
    });

    // Ordenar
    filtered.sort((a,b) => new Date(a['Data do Evento']) - new Date(b['Data do Evento']));

    const tableData = filtered.map(c => [
        new Date(c['Data do Evento']).toLocaleDateString('pt-BR', {timeZone: 'UTC'}), 
        c.Evento, 
        c.Categoria, 
        c.Detalhes || ''
    ]);

    let titleText = `Período: ${periodo.toUpperCase()}`;
    doc.setFontSize(12);
    doc.text(titleText, 105, 28, null, null, "center");

    doc.autoTable({ 
        startY: 35, 
        head: [['Data', 'Evento', 'Categoria', 'Detalhes']], 
        body: tableData 
    });
    
    doc.save(`Relatorio_Calendario_${periodo}.pdf`);
    closeModal('modal-pdf-calendario');
});

// Relatório de Pontuação com Gráfico
document.getElementById('form-relatorio-pontos').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Calcula pontos
    const pontosMap = {};
    appData.apontamentos.forEach(a => {
        let pts = 0;
        if(a['Pontualidade']) pts++; if(a['Trouxe Material']) pts++; if(a['De Uniforme']) pts++; if(a['De Lenço']) pts++; if(a['Participativo']) pts++;
        const nome = a['Nome Aventureiro'];
        pontosMap[nome] = (pontosMap[nome] || 0) + pts;
    });

    const ranking = Object.keys(pontosMap).map(nome => ({ nome, pts: pontosMap[nome] })).sort((a,b) => b.pts - a.pts);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Relatório de Pontuação (Ranking)", 105, 20, null, null, "center");

    // Gerar gráfico escondido e capturar imagem
    const canvas = document.createElement('canvas');
    canvas.width = 600; canvas.height = 300;
    document.body.appendChild(canvas);
    canvas.style.display = 'none';
    
    new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ranking.map(r => r.nome),
            datasets: [{ label: 'Total de Pontos', data: ranking.map(r => r.pts), backgroundColor: '#0d6efd' }]
        },
        options: { animation: false, responsive: false }
    });

    setTimeout(() => {
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 15, 30, 180, 90);
        
        const tableData = ranking.map((r, i) => [`${i+1}º`, r.nome, `${r.pts} pts`]);
        doc.autoTable({ startY: 130, head: [['Posição', 'Nome', 'Pontuação']], body: tableData });
        
        doc.save(`Ranking_Pontuacao.pdf`);
        canvas.remove();
        closeModal('modal-relatorio-pontos');
    }, 500); // Wait for chart render
});

// Ficha PDF Engine
function drawFichaFields(doc, insc) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(13, 110, 253);
    doc.text("Ficha de Inscrição Oficial - Iceberg Kids", 105, 15, null, null, "center");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0,0,0);
    
    let startY = 25;
    const lineSpace = 6;
    
    const addLine = (label, value) => {
        if(startY > 280) { doc.addPage(); startY = 20; }
        doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 15, startY);
        doc.setFont("helvetica", "normal"); doc.text(`${value || '---'}`, 60, startY);
        startY += lineSpace;
    };
    const addSection = (title) => {
        if(startY > 270) { doc.addPage(); startY = 20; }
        startY += 4;
        doc.setFont("helvetica", "bold"); doc.setTextColor(13, 110, 253);
        doc.text(title, 15, startY);
        doc.setTextColor(0,0,0);
        startY += lineSpace;
    };

    addSection("Dados Básicos");
    addLine("Nome da Criança", insc['Nome Criança']);
    addLine("Data Nascimento", insc['Data Nasc'] ? new Date(insc['Data Nasc']).toLocaleDateString('pt-BR') : '');
    addLine("Idade / Sexo", `${insc.Idade} anos / ${insc.Sexo}`);
    addLine("Camiseta / Extra", `${insc['Tamanho Camiseta']} / ${insc['Camisetas Extras']}`);
    
    addSection("Filiação");
    addLine("Responsável Legal", insc['Nome Pai']);
    addLine("CPF Responsável", insc['CPF Responsável']);
    addLine("Contato/E-mail", `${insc['Telefone Pai']} / ${insc['Email Pai']}`);
    addLine("Escolaridade (Pai)", `${insc['Escolaridade Pai']} - ${insc['Curso Pai']}`);
    addLine("Prof Saúde (Pai)", `${insc['Profissional Saúde Pai']} - ${insc['Qual Profissão Pai']}`);
    
    addLine("Mãe", insc['Nome Mãe']);
    addLine("Contato Mãe", `${insc['Telefone Mãe']} / ${insc['Email Mãe']}`);
    addLine("Escolaridade (Mãe)", `${insc['Escolaridade Mãe']} - ${insc['Curso Mãe']}`);
    addLine("Prof Saúde (Mãe)", `${insc['Profissional Saúde Mãe']} - ${insc['Qual Profissão Mãe']}`);
    
    addSection("Ficha Médica");
    addLine("Emergência", `${insc['Contato Emergência Nome']} (${insc['Contato Emergência Fone']})`);
    addLine("Plano/SUS", insc['Cartão SUS/Plano']);
    addLine("Tipagem Sanguínea", insc['Tipagem Sanguínea']);
    
    // Multi-line fields
    const addTextWrapped = (label, text) => {
        if(!text) return;
        doc.setFont("helvetica", "bold"); doc.text(`${label}:`, 15, startY);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(String(text), 130);
        doc.text(lines, 60, startY);
        startY += (lines.length * lineSpace);
    };

    addTextWrapped("Doenças Prévias", insc['Doenças Prévias']);
    addTextWrapped("Alergias", insc['Alergias']);
    addTextWrapped("Remédio Alergia", insc['Remédios para Alergias']);
    addLine("Ferimento", insc['Ferimento recente']);
    addLine("Fratura / Imobil", `${insc['Fratura recente']} / ${insc['Tempo imobilizado']}`);
    addLine("Cirurgias", insc['Cirurgias']);
    addTextWrapped("Internação", insc['Motivo Internação']);
    addTextWrapped("Med. Contínuos", insc['Medicamentos Contínuos']);
    addTextWrapped("Deficiência", insc['Deficiência/Condição']);
    addTextWrapped("Obs. Médica", insc['Observação Médica']);
}

// Master PDF logic - Gera Ficha Médica (sem termo embutido)
async function drawTermoAdesao(doc, insc) {
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(13, 110, 253);
    doc.text('Autorização - Termo de Adesão', 105, 20, null, null, 'center');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const now = new Date();
    const dateText = now.toLocaleDateString('pt-BR');
    const lines = [
        'Clube: ICEBERG KIDS',
        'Igreja: 225 - PLANTA SÃO MARCOS',
        'Distrito: PLANTA SÃO MARCOS',
        'Associação/Missão: ASSOCIAÇÃO SUL PARANAENSE',
        `Nome completo: ${insc['Nome Criança'] || '---'}`,
        `Nome do Responsável: ${insc['Nome Pai'] || insc['Nome Mãe'] || insc['Nome do Responsável'] || insc['Responsável'] || '---'}`,
        `Documento (CPF ou RG): ${insc['CPF Responsável'] || insc['CPF'] || insc['Documento'] || '---'}`
    ];
    let cursorY = 32;
    lines.forEach(line => {
        doc.text(line, 15, cursorY);
        cursorY += 6;
    });
    cursorY += 4;

    const termoText = `Autorizo meu filho/dependente legal a participar do "ICEBERG KIDS" , organização vinculada a IGREJA ADVENTISTA DO SÉTIMO DIA que tem o objetivo de promover o desenvolvimento físico, mental e espiritual das crianças e adolescentes, através de atividades didáticas e lúdicas que ocorrem semanalmente, além de acampamentos, caminhadas e atividades cívicas. O programa do é destinado a meninos e meninas de a anos sem qualquer distinção de etnia, religião ou classe social. Me comprometo a conhecer e respeitar as normas do "ICEBERG KIDS" e a auxiliar que meu filho/dependente legal também as cumpra. Para garantir a segurança do meu filho/dependente legal autorizo o registro, armazenamento e tratamento dos dados contidos nessa ficha de matrícula, bem como do histórico de conquistas e de participações em eventos. O "ICEBERG KIDS" utiliza esses dados para efetivar seguros, agilizar atendimentos de emergência, e proporcionar acesso às ferramentas e aplicativos. O armazenamento e tratamento dos dados dos membros do "ICEBERG KIDS" é feito de acordo com a Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD) e a Política de Privacidade de Dados da IGREJA ADVENTISTA DO SÉTIMO DIA, conforme descrito em https://adv.st/privacidade/.`;
    const termoLines = doc.splitTextToSize(termoText, 180);
    doc.text(termoLines, 15, cursorY);
    cursorY += termoLines.length * 5 + 6;

    const autorizacaoText = `___________________________________________________ VISTO`;
    doc.text(autorizacaoText, 15, cursorY);
    cursorY += 8;

    const voiceText = `Autorização de Uso de Voz e Imagem`;
    doc.setFont('helvetica', 'bold');
    doc.text(voiceText, 15, cursorY);
    doc.setFont('helvetica', 'normal');
    cursorY += 6;

    const voiceBody = `Voz e Imagem: Autorizo a utilização de voz e imagem do meu filho/dependente legal, para divulgação das atividades do "ICEBERG KIDS", por meio físico ou digital, nas redes sociais e páginas oficiais ligadas ao e demais meios de comunicação, de forma gratuita, servindo este documento como Instrumento de Cessão. ( ) AUTORIZO ( ) NÃO AUTORIZO Estou ciente que posso solicitar que algum dado seja acrescentado, alterado ou excluído pelo "ICEBERG KIDS" através do e-mail`;
    const voiceLines = doc.splitTextToSize(voiceBody, 180);
    doc.text(voiceLines, 15, cursorY);
    cursorY += voiceLines.length * 5 + 8;

    const footerLines = [`DATA: ${dateText}, SÃO JOSÉ DOS PINHAIS - PR`, '________________________________________________', 'ASSINATURA'];
    footerLines.forEach(line => {
        doc.text(line, 15, cursorY);
        cursorY += 8;
    });
}

async function buildPdfAndMergeTermo(filteredInscricoes, fileName) {
    showLoader(true);
    try {
        const { PDFDocument } = PDFLib;
        const finalPdf = await PDFDocument.create();

        for (const insc of filteredInscricoes) {
            const { jsPDF } = window.jspdf;
            const tempDoc = new jsPDF();
            drawFichaFields(tempDoc, insc);
            drawTermoAdesao(tempDoc, insc);
            const jsPdfBytes = tempDoc.output('arraybuffer');
            
            const fichaPdf = await PDFDocument.load(jsPdfBytes);
            const fichaPages = await finalPdf.copyPages(fichaPdf, fichaPdf.getPageIndices());
            fichaPages.forEach(p => finalPdf.addPage(p));
        }

        const pdfBytes = await finalPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = fileName; link.click();
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error(e);
        alert('Erro ao gerar PDF. Verifique o console para detalhes.');
    }
    showLoader(false);
}

// Single Print
window.printFichaSingle = async (rowId) => {
    const insc = appData.inscricoes.find(i => i._row === rowId);
    if (insc) await buildPdfAndMergeTermo([insc], `Inscricao_${insc['Nome Criança'].replace(/\s/g, '_')}.pdf`);
};

// ================= MODAL DE SELEÇÃO PARA IMPRESSÃO EM LOTE =================

function openSelecaoImpressaoModal() {
    document.getElementById('selecao-filtro-status').value = '';
    document.getElementById('selecao-todos').checked = false;
    renderSelecaoLista();
    openModal('modal-selecao-impressao');
}

function openTshirtSummaryModal() {
    renderTshirtSummary();
    openModal('modal-tshirt-summary');
}

function renderTshirtSummary() {
    const active = appData.inscricoes.filter(i => String(i.Status || '').trim() !== 'Cancelada');
    const mainSizes = {};
    const extraSizes = {};
    active.forEach(insc => {
        const main = String(insc['Tamanho Camiseta'] || insc['tam-camiseta'] || '').trim();
        if (main) mainSizes[main] = (mainSizes[main] || 0) + 1;
        const extras = String(insc['Camisetas Extras'] || '').trim();
        if (extras) {
            extras.split('|').forEach(item => {
                const match = item.trim().match(/(\d+)x\s*(.+)/i);
                if (match) {
                    const qty = parseInt(match[1], 10);
                    const size = match[2].trim();
                    if (qty && size) extraSizes[size] = (extraSizes[size] || 0) + qty;
                }
            });
        }
    });

    const mainHtml = Object.keys(mainSizes).length ? Object.entries(mainSizes).map(([size, qty]) => `<li class="py-1">${qty}x ${size}</li>`).join('') : '<li class="py-1 text-on-surface-variant">Nenhuma camiseta principal registrada.</li>';
    const extraHtml = Object.keys(extraSizes).length ? Object.entries(extraSizes).map(([size, qty]) => `<li class="py-1">${qty}x ${size}</li>`).join('') : '<li class="py-1 text-on-surface-variant">Nenhuma camiseta extra solicitada.</li>';

    document.getElementById('tshirt-summary-main').innerHTML = mainHtml;
    document.getElementById('tshirt-summary-extras').innerHTML = extraHtml;
}

function renderSelecaoLista() {
    const filtroStatus = document.getElementById('selecao-filtro-status').value;
    const lista = document.getElementById('lista-selecao-impressao');
    if (!lista) return;

    const filtered = appData.inscricoes.filter(i => {
        if (filtroStatus && String(i.Status || '').trim() !== filtroStatus) return false;
        return true;
    }).sort((a, b) => String(a['Nome Criança'] || '').localeCompare(String(b['Nome Criança'] || '')));

    if (filtered.length === 0) {
        lista.innerHTML = '<p class="text-sm text-on-surface-variant italic py-4 text-center">Nenhuma inscrição encontrada.</p>';
        return;
    }

    lista.innerHTML = filtered.map(i => {
        const nome = i['Nome Criança'] || '---';
        const status = i.Status || 'Recebida';
        const badgeColor = status === 'Aceita' ? 'text-green-700 bg-green-50' : status === 'Cadastro finalizado' ? 'text-blue-700 bg-blue-50' : 'text-yellow-700 bg-yellow-50';
        return `<label class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-container cursor-pointer border border-transparent hover:border-outline-variant transition-colors">
            <input type="checkbox" class="checkbox-inscricao w-4 h-4 accent-primary cursor-pointer" data-row="${i._row}">
            <span class="flex-1 font-semibold text-sm text-on-surface">${nome}</span>
            <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold ${badgeColor}">${status}</span>
        </label>`;
    }).join('');
}

function toggleSelecionarTodos(checked) {
    document.querySelectorAll('.checkbox-inscricao').forEach(cb => cb.checked = checked);
}

async function imprimirSelecionados() {
    const selecionados = [];
    document.querySelectorAll('.checkbox-inscricao:checked').forEach(cb => {
        const row = parseInt(cb.dataset.row);
        const insc = appData.inscricoes.find(i => i._row === row);
        if (insc) selecionados.push(insc);
    });

    if (selecionados.length === 0) {
        return alert('Selecione ao menos uma inscrição para imprimir.');
    }

    closeModal('modal-selecao-impressao');
    await buildPdfAndMergeTermo(selecionados, `Inscricoes_Selecionadas_${selecionados.length}.pdf`);
}

// ================= NOVOS MÓDULOS: USUÁRIOS E FINANCEIRO =================

let chartMensalidadesInstance = null;
let chartInscricoesInstance = null;
let chartFluxoCaixaInstance = null;
let chartRelatorioInstance = null;
let chartApontamentosPopupInstance = null;

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function openNewUsuarioModal() {
    document.getElementById('usuario-row-id').value = '';
    document.getElementById('usuario-nome').value = '';
    document.getElementById('usuario-email').value = '';
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-nivel').value = 'Conselheiro';
    const foto = document.getElementById('usuario-foto');
    if (foto) foto.value = '';
    
    document.getElementById('usuario-modal-title').textContent = 'Cadastrar Usuário';
    document.getElementById('btn-salvar-usuario').textContent = 'Cadastrar';
    openModal('modal-usuario');
}

function openEditUsuario(row, nome, email, senha, nivel) {
    document.getElementById('usuario-row-id').value = row;
    document.getElementById('usuario-nome').value = nome || '';
    document.getElementById('usuario-email').value = email || '';
    document.getElementById('usuario-senha').value = senha || '';
    document.getElementById('usuario-nivel').value = nivel || 'Conselheiro';
    const foto = document.getElementById('usuario-foto');
    if (foto) foto.value = '';
    
    document.getElementById('usuario-modal-title').textContent = 'Editar Usuário';
    document.getElementById('btn-salvar-usuario').textContent = 'Salvar Alterações';
    openModal('modal-usuario');
}

function populateChildDropdown() {
    const selectChild = document.getElementById('entrada-crianca');
    const selectDoador = document.getElementById('entrada-doador-select');
    if (!selectChild || !selectDoador) return;
    
    selectChild.innerHTML = '<option value="">-- Selecione o Aventureiro --</option>';
    selectDoador.innerHTML = '<option value="">-- Selecione o Doador/Inscrito --</option>';
    
    const sorted = [...appData.inscricoes].sort((a, b) => {
        const nameA = String(a['Nome Criança'] || '').toUpperCase();
        const nameB = String(b['Nome Criança'] || '').toUpperCase();
        return nameA.localeCompare(nameB);
    });
    
    sorted.forEach(c => {
        const nome = c['Nome Criança'];
        if (nome) {
            selectChild.innerHTML += `<option value="${nome}">${nome}</option>`;
            selectDoador.innerHTML += `<option value="${nome}">${nome}</option>`;
        }
    });
}

function renderUsuarios() {
    const tbody = document.querySelector('#table-usuarios tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    appData.usuarios.forEach(u => {
        let fotoHtml = '';
        if (u.Foto) {
            fotoHtml = `<img src="${u.Foto}" class="w-8 h-8 rounded-full object-cover border border-outline-variant">`;
        } else {
            const initials = u.Nome ? u.Nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
            fotoHtml = `<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">${initials}</div>`;
        }
        
        const actionsHtml = hasFullAccess() ? `
            <button class="btn btn-sm btn-edit" onclick="openEditUsuario(${u._row}, '${u.Nome}', '${u.Email}', '${u.Senha}', '${u.Nivel}')">Editar</button>
            <button class="btn btn-sm btn-danger animate-pulse-once" onclick="deleteRow('Usuarios', ${u._row})">Excluir</button>
        ` : '---';

        tbody.innerHTML += `
            <tr>
                <td>${fotoHtml}</td>
                <td><strong>${u.Nome}</strong></td>
                <td>${u.Email}</td>
                <td><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${u.Nivel === 'Admin' || u.Nivel === 'Diretor' ? 'bg-primary-container text-primary' : 'bg-surface-container-highest text-on-surface-variant'}">${u.Nivel}</span></td>
                <td>
                    ${actionsHtml}
                </td>
            </tr>
        `;
    });
}

function toggleEntradaFields() {
    const cat = document.getElementById('entrada-categoria').value;
    const divOutros = document.getElementById('div-entrada-detalhe-outros');
    const divChild = document.getElementById('div-entrada-desbravador');
    const divDoador = document.getElementById('div-entrada-doador');
    const inputDoador = document.getElementById('entrada-doador');
    const selectDoador = document.getElementById('entrada-doador-select');
    
    if (!divOutros || !divChild || !divDoador || !inputDoador || !selectDoador) return;
    
    if (cat === 'Mensalidade' || cat === 'Inscrição') {
        divChild.classList.remove('hidden');
        divDoador.classList.remove('hidden');
        inputDoador.classList.add('hidden');
        selectDoador.classList.remove('hidden');
        divOutros.classList.add('hidden');
    } else if (cat === 'Doação') {
        divChild.classList.add('hidden');
        divDoador.classList.remove('hidden');
        inputDoador.classList.remove('hidden');
        selectDoador.classList.add('hidden');
        divOutros.classList.add('hidden');
    } else if (cat === 'Outros') {
        divChild.classList.add('hidden');
        divDoador.classList.add('hidden');
        divOutros.classList.remove('hidden');
    } else {
        divChild.classList.add('hidden');
        divDoador.classList.add('hidden');
        divOutros.classList.add('hidden');
    }
}

function renderFinanceiro() {
    const tbody = document.querySelector('#table-financeiro tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let totalEntradas = 0;
    let totalSaidas = 0;
    
    const sorted = [...appData.financeiro].sort((a, b) => new Date(b.Data) - new Date(a.Data));
    
    sorted.forEach(f => {
        const valor = parseFloat(f.Valor || 0);
        const isEntrada = f.Tipo === 'Entrada';
        
        if (isEntrada) {
            totalEntradas += valor;
        } else {
            totalSaidas += valor;
        }
        
        let detailsHtml = '';
        if (f.Categoria === 'Mensalidade' || f.Categoria === 'Inscrição') {
            detailsHtml = `Aventureiro: <strong>${f.Crianca || '---'}</strong>`;
        } else if (f.Categoria === 'Doação') {
            detailsHtml = `Doador: <strong>${f.ResponsavelDoador || '---'}</strong>`;
        } else if (f.Categoria === 'Outros') {
            detailsHtml = `Projeto: <strong>${f.DetalheOutros || '---'}</strong>`;
        } else if (f.NF) {
            detailsHtml = `NF: <strong>${f.NF}</strong>`;
        }
        
        if (f.ResponsavelDoador && f.Tipo === 'Saída') {
            detailsHtml += (detailsHtml ? ' | ' : '') + `Resp: ${f.ResponsavelDoador}`;
        }
        
        const badgeClass = isEntrada ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const valorFormatted = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        const actionsHtml = hasFullAccess() ? `
            <button class="btn btn-sm btn-edit" onclick="openEditFinanceiro(${f._row})">Editar</button>
            <button class="btn btn-sm btn-danger animate-pulse-once" onclick="deleteRow('Financeiro', ${f._row})">Del</button>
        ` : '---';

        tbody.innerHTML += `
            <tr>
                <td>${new Date(f.Data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td><span class="px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">${f.Tipo}</span></td>
                <td><strong>${f.Categoria}</strong></td>
                <td>${f.Descricao || '---'}</td>
                <td><strong class="${isEntrada ? 'text-green-600' : 'text-red-600'}">${isEntrada ? '+' : '-'} ${valorFormatted}</strong></td>
                <td>${detailsHtml || '---'}</td>
                <td>
                    ${actionsHtml}
                </td>
            </tr>
        `;
    });
    
    const saldo = totalEntradas - totalSaidas;
    
    const entriesEl = document.getElementById('fin-total-entradas');
    const exitsEl = document.getElementById('fin-total-saidas');
    const balanceEl = document.getElementById('fin-saldo-atual');
    const saldoCard = document.getElementById('fin-saldo-card');
    
    if (entriesEl) entriesEl.textContent = totalEntradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    if (exitsEl) exitsEl.textContent = totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    if (balanceEl) {
        balanceEl.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (saldo >= 0) {
            balanceEl.className = 'font-stat-display text-2xl font-extrabold text-green-600';
            if (saldoCard) saldoCard.className = 'bg-green-50/50 p-5 rounded-2xl border border-green-200 shadow-sm text-left';
        } else {
            balanceEl.className = 'font-stat-display text-2xl font-extrabold text-red-600';
            if (saldoCard) saldoCard.className = 'bg-red-50/50 p-5 rounded-2xl border border-red-200 shadow-sm text-left';
        }
    }

    renderFinanceCharts();
}

function renderFinanceCharts() {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    // 1. Mensalidades por Mês
    const monthlyFeesByMonth = new Array(12).fill(0);
    appData.financeiro.forEach(f => {
        if (f.Tipo === 'Entrada' && f.Categoria === 'Mensalidade') {
            const d = new Date(f.Data);
            if (!isNaN(d.getTime())) {
                monthlyFeesByMonth[d.getUTCMonth()] += 1;
            }
        }
    });
    
    const ctx1 = document.getElementById('chartMensalidadesMes');
    if (ctx1) {
        if (chartMensalidadesInstance) chartMensalidadesInstance.destroy();
        chartMensalidadesInstance = new Chart(ctx1.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Mensalidades Recebidas',
                    data: monthlyFeesByMonth,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { precision: 0 } }
                }
            }
        });
    }
    
    // 2. Inscrições Pagas
    const registrationsByMonth = new Array(12).fill(0);
    appData.financeiro.forEach(f => {
        if (f.Tipo === 'Entrada' && f.Categoria === 'Inscrição') {
            const d = new Date(f.Data);
            if (!isNaN(d.getTime())) {
                registrationsByMonth[d.getUTCMonth()] += 1;
            }
        }
    });
    
    const ctx2 = document.getElementById('chartInscricoesPagas');
    if (ctx2) {
        if (chartInscricoesInstance) chartInscricoesInstance.destroy();
        chartInscricoesInstance = new Chart(ctx2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Inscrições Pagas',
                    data: registrationsByMonth,
                    backgroundColor: '#004bc3',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { precision: 0 } }
                }
            }
        });
    }
    
    // 3. Fluxo de Caixa (Grouped Bar + Line)
    const entriesByMonth = new Array(12).fill(0);
    const withdrawalsByMonth = new Array(12).fill(0);
    appData.financeiro.forEach(f => {
        const d = new Date(f.Data);
        if (!isNaN(d.getTime())) {
            const m = d.getUTCMonth();
            const valor = parseFloat(f.Valor || 0);
            if (f.Tipo === 'Entrada') {
                entriesByMonth[m] += valor;
            } else {
                withdrawalsByMonth[m] += valor;
            }
        }
    });
    
    const balanceByMonth = new Array(12).fill(0);
    let cumulative = 0;
    for (let i = 0; i < 12; i++) {
        cumulative += (entriesByMonth[i] - withdrawalsByMonth[i]);
        balanceByMonth[i] = cumulative;
    }
    
    const ctx3 = document.getElementById('chartFluxoCaixa');
    if (ctx3) {
        if (chartFluxoCaixaInstance) chartFluxoCaixaInstance.destroy();
        chartFluxoCaixaInstance = new Chart(ctx3.getContext('2d'), {
            type: 'bar',
            data: {
                labels: months,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Entradas',
                        data: entriesByMonth,
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    },
                    {
                        type: 'bar',
                        label: 'Saídas',
                        data: withdrawalsByMonth,
                        backgroundColor: '#ef4444',
                        borderRadius: 4
                    },
                    {
                        type: 'line',
                        label: 'Saldo Acumulado',
                        data: balanceByMonth,
                        borderColor: '#6366f1',
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                scales: {
                    x: { grid: { display: false } },
                    y: { ticks: { callback: value => 'R$ ' + value } }
                }
            }
        });
    }
}

function closeFinanceiroRelatorioView() {
    document.getElementById('financeiro-relatorio-view').classList.add('hidden');
    if (chartRelatorioInstance) {
        chartRelatorioInstance.destroy();
        chartRelatorioInstance = null;
    }
}

function openApontamentosChartPopup() {
    const pontosMap = {};
    
    appData.inscricoes.forEach(i => {
        const nome = i['Nome Criança'];
        if (nome) pontosMap[nome] = 0;
    });
    
    appData.apontamentos.forEach(a => {
        let pts = 0;
        if (a['Pontualidade']) pts++;
        if (a['Trouxe Material']) pts++;
        if (a['De Uniforme']) pts++;
        if (a['De Lenço']) pts++;
        if (a['Participativo']) pts++;
        
        const nome = a['Nome Aventureiro'];
        if (nome) {
            pontosMap[nome] = (pontosMap[nome] || 0) + pts;
        }
    });
    
    const ranking = Object.keys(pontosMap)
        .map(nome => ({ nome, pts: pontosMap[nome] }))
        .sort((a, b) => b.pts - a.pts);
        
    openModal('modal-apontamentos-grafico');
    
    const ctx = document.getElementById('chartApontamentosPopup').getContext('2d');
    if (chartApontamentosPopupInstance) chartApontamentosPopupInstance.destroy();
    
    chartApontamentosPopupInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranking.map(r => r.nome),
            datasets: [{
                label: 'Pontuação Total Acumulada',
                data: ranking.map(r => r.pts),
                backgroundColor: '#004bc3',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: { ticks: { precision: 0 } }
            }
        }
    });
}

async function copyChartAsImage(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return alert("Erro: Gráfico não encontrado.");
    
    try {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Erro ao converter gráfico em imagem.");
                return;
            }
            try {
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                alert("Gráfico copiado para a área de transferência com sucesso!");
            } catch (err) {
                console.error("Erro ao copiar imagem para clipboard", err);
                alert("Não foi possível copiar automaticamente. Certifique-se de que deu permissões de área de transferência.");
            }
        });
    } catch (e) {
        console.error("Erro na conversão do canvas", e);
        alert("Erro ao copiar o gráfico.");
    }
}

// ================= ADIMPLÊNCIA DE AVENTUREIROS =================

let currentAdimplenciaTab = 'inscricao';

function openAdimplenciaModal() {
    // Aventureiros ativos: Aceita, Cadastro finalizado ou Recebida
    const aventureirosAtivos = appData.inscricoes.filter(i => {
        const s = String(i.Status || '').trim();
        return s === 'Aceita' || s === 'Cadastro finalizado' || s === 'Recebida';
    });

    const financeiro = appData.financeiro || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // --- Inscrição ---
    const pagantesInscricao = new Set(
        financeiro
            .filter(f => f.Tipo === 'Entrada' && f.Categoria === 'Inscrição')
            .map(f => String(f.Crianca || f.ResponsavelDoador || '').trim().toLowerCase())
            .filter(n => n)
    );

    const adimplentesInscricao = [];
    const inadimplentesInscricao = [];

    aventureirosAtivos.forEach(av => {
        const nome = String(av['Nome Criança'] || '').trim();
        if (!nome) return;
        if (pagantesInscricao.has(nome.toLowerCase())) {
            adimplentesInscricao.push(nome);
        } else {
            inadimplentesInscricao.push(nome);
        }
    });

    // --- Mensalidade do mês corrente ---
    const mesNome = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    const pagantesMensalidade = new Set(
        financeiro
            .filter(f => {
                if (f.Tipo !== 'Entrada' || f.Categoria !== 'Mensalidade') return false;
                const d = new Date(f.Data);
                return !isNaN(d.getTime()) && d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear;
            })
            .map(f => String(f.Crianca || f.ResponsavelDoador || '').trim().toLowerCase())
            .filter(n => n)
    );

    const adimplentesMensalidade = [];
    const inadimplentesMensalidade = [];

    aventureirosAtivos.forEach(av => {
        const nome = String(av['Nome Criança'] || '').trim();
        if (!nome) return;
        if (pagantesMensalidade.has(nome.toLowerCase())) {
            adimplentesMensalidade.push(nome);
        } else {
            inadimplentesMensalidade.push(nome);
        }
    });

    // --- Mensalidades do ANO CORRENTE: tabela meses x aventureiro ---
    // Apenas até o mês atual
    const mesesNomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const mesesDoAno = [];
    for (let m = 0; m <= currentMonth; m++) {
        mesesDoAno.push(m);
    }

    // Para cada aventureiro e cada mês, verificar se existe pagamento
    const nomes = aventureirosAtivos.map(av => String(av['Nome Criança'] || '').trim()).filter(n => n).sort();

    // Mapa: nome -> Set de meses pagos
    const pagamentosPorNome = {};
    nomes.forEach(n => pagamentosPorNome[n] = new Set());
    financeiro
        .filter(f => f.Tipo === 'Entrada' && f.Categoria === 'Mensalidade')
        .forEach(f => {
            const d = new Date(f.Data);
            if (!isNaN(d.getTime()) && d.getUTCFullYear() === currentYear) {
                const nome = String(f.Crianca || f.ResponsavelDoador || '').trim();
                if (pagamentosPorNome[nome] !== undefined) {
                    pagamentosPorNome[nome].add(d.getUTCMonth());
                } else {
                    // aventureiro pode ter pago mas não está mais ativo - ignorar
                }
            }
        });

    // Renderizar tabela do ano
    const thead = document.querySelector('#table-adimplencia-ano thead tr');
    const tbody = document.getElementById('tbody-adimplencia-ano');
    if (thead && tbody) {
        // Cabeçalho: Aventureiro + meses
        thead.innerHTML = `<th class="px-3 py-2 font-bold text-on-surface-variant text-left sticky left-0 bg-surface-container min-w-[140px]">Aventureiro</th>`;
        mesesDoAno.forEach(m => {
            const isCurrentMonth = m === currentMonth;
            thead.innerHTML += `<th class="px-2 py-2 text-center font-bold ${isCurrentMonth ? 'text-primary' : 'text-on-surface-variant'}">${mesesNomes[m]}</th>`;
        });

        // Linhas por aventureiro
        tbody.innerHTML = nomes.map((nome, idx) => {
            const pagos = pagamentosPorNome[nome] || new Set();
            const cells = mesesDoAno.map(m => {
                const pago = pagos.has(m);
                return `<td class="px-2 py-1.5 text-center"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold ${ pago ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700' }">${ pago ? '✓' : '✗'}</span></td>`;
            }).join('');
            return `<tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-surface-container-lowest'}">
                <td class="px-3 py-1.5 font-medium text-on-surface sticky left-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-container-lowest'}">${nome}</td>
                ${cells}
            </tr>`;
        }).join('');
    }

    // Renderizar listas
    const renderList = (ulId, names, emptyMsg) => {
        const ul = document.getElementById(ulId);
        if (!ul) return;
        if (names.length === 0) {
            ul.innerHTML = `<li class="text-on-surface-variant italic py-2">${emptyMsg}</li>`;
            return;
        }
        ul.innerHTML = names.sort().map(n =>
            `<li class="flex items-center gap-2 py-1 border-b border-outline-variant/30 last:border-0">
                <span class="material-symbols-outlined text-[16px] text-outline">person</span>
                ${n}
            </li>`
        ).join('');
    };

    renderList('list-adimplentes-inscricao', adimplentesInscricao, 'Nenhum aventureiro pagou a inscrição ainda.');
    renderList('list-inadimplentes-inscricao', inadimplentesInscricao, 'Todos os aventureiros estão em dia! 🎉');
    renderList('list-adimplentes-mensalidade', adimplentesMensalidade, 'Nenhum aventureiro pagou a mensalidade deste mês.');
    renderList('list-inadimplentes-mensalidade', inadimplentesMensalidade, 'Todos os aventureiros estão em dia! 🎉');

    const subEl = document.getElementById('adimplencia-mensalidade-subtitle');
    if (subEl) subEl.textContent = `Mensalidades pendentes de ${mesNome}.`;

    // Guardar dados para o PDF
    window._adimplenciaData = {
        inscricao: { adimplentes: adimplentesInscricao, inadimplentes: inadimplentesInscricao },
        mensalidade: { adimplentes: adimplentesMensalidade, inadimplentes: inadimplentesMensalidade, mes: mesNome },
        ano: { nomes, pagamentosPorNome, mesesDoAno, mesesNomes, currentYear }
    };

    currentAdimplenciaTab = 'inscricao';
    switchAdimplenciaTab('inscricao');
    openModal('modal-financeiro-adimplencia');
}

function switchAdimplenciaTab(tab) {
    currentAdimplenciaTab = tab;
    const tabs = ['inscricao', 'mensalidade', 'ano'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-btn-adimplencia-${t}`);
        const content = document.getElementById(`adimplencia-content-${t}`);
        if (t === tab) {
            if (btn) btn.className = 'px-4 py-2 border-b-2 border-primary text-primary font-bold text-sm';
            if (content) content.classList.remove('hidden');
        } else {
            if (btn) btn.className = 'px-4 py-2 border-b-2 border-transparent text-on-surface-variant hover:text-primary font-bold text-sm';
            if (content) content.classList.add('hidden');
        }
    });
}

function printAdimplenciaPDF() {
    if (!window._adimplenciaData) return alert('Abra o relatório de adimplência primeiro.');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleDateString('pt-BR');

    if (currentAdimplenciaTab === 'ano') {
        // PDF especial: tabela meses x aventureiro
        const { nomes, pagamentosPorNome, mesesDoAno, mesesNomes, currentYear } = window._adimplenciaData.ano;

        doc.setFillColor(0, 75, 195);
        doc.rect(0, 0, 297, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Iceberg Kids - Adimplência Anual de Mensalidades', 148, 12, null, null, 'center');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Ano: ${currentYear} | Gerado em: ${now}`, 148, 21, null, null, 'center');

        const head = [['Aventureiro', ...mesesDoAno.map(m => mesesNomes[m])]];
        const body = nomes.map(nome => {
            const pagos = pagamentosPorNome[nome] || new Set();
            return [nome, ...mesesDoAno.map(m => pagos.has(m) ? '✓ Pago' : '✗ Pend.')];
        });

        doc.autoTable({
            startY: 32,
            head,
            body,
            styles: { fontSize: 8, halign: 'center' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold', minCellWidth: 40 } },
            headStyles: { fillColor: [0, 75, 195] },
            didParseCell: (data) => {
                if (data.section === 'body' && data.column.index > 0) {
                    const val = data.cell.raw || '';
                    data.cell.styles.fillColor = val.includes('✓') ? [220, 252, 231] : [254, 226, 226];
                    data.cell.styles.textColor = val.includes('✓') ? [22, 163, 74] : [220, 38, 38];
                }
            }
        });

        doc.save(`Adimplencia_Anual_${currentYear}.pdf`);
        return;
    }

    // PDF padrão para inscrição / mensalidade do mês
    const docP = new jsPDF();
    const data = window._adimplenciaData[currentAdimplenciaTab];
    const isInscricao = currentAdimplenciaTab === 'inscricao';
    const titulo = isInscricao ? 'Adimplência - Taxa de Inscrição' : `Adimplência - Mensalidade (${data.mes || 'Mês Atual'})`;

    // Cabeçalho
    docP.setFillColor(0, 75, 195);
    docP.rect(0, 0, 210, 28, 'F');
    docP.setTextColor(255, 255, 255);
    docP.setFontSize(16);
    docP.setFont('helvetica', 'bold');
    docP.text('Iceberg Kids - Relatório de Adimplência', 105, 12, null, null, 'center');
    docP.setFontSize(11);
    docP.setFont('helvetica', 'normal');
    docP.text(titulo, 105, 21, null, null, 'center');

    docP.setTextColor(0, 0, 0);
    docP.setFontSize(9);
    docP.text(`Gerado em: ${now}`, 14, 35);

    let y = 44;
    docP.setFontSize(12);
    docP.setFont('helvetica', 'bold');
    docP.setTextColor(22, 163, 74);
    docP.text(`✓ Em Dia (Adimplentes) - ${data.adimplentes.length} aventureiro(s)`, 14, y);
    y += 6;
    docP.setFont('helvetica', 'normal');
    docP.setFontSize(10);
    docP.setTextColor(0, 0, 0);
    if (data.adimplentes.length === 0) {
        docP.text('  Nenhum aventureiro nesta categoria.', 14, y);
        y += 6;
    } else {
        data.adimplentes.sort().forEach(n => {
            if (y > 270) { docP.addPage(); y = 20; }
            docP.text(`  • ${n}`, 14, y);
            y += 6;
        });
    }

    y += 6;
    if (y > 260) { docP.addPage(); y = 20; }
    docP.setFontSize(12);
    docP.setFont('helvetica', 'bold');
    docP.setTextColor(220, 38, 38);
    docP.text(`✗ Pendentes (Inadimplentes) - ${data.inadimplentes.length} aventureiro(s)`, 14, y);
    y += 6;
    docP.setFont('helvetica', 'normal');
    docP.setFontSize(10);
    docP.setTextColor(0, 0, 0);
    if (data.inadimplentes.length === 0) {
        docP.text('  Todos os aventureiros estão em dia! 🎉', 14, y);
    } else {
        data.inadimplentes.sort().forEach(n => {
            if (y > 270) { docP.addPage(); y = 20; }
            docP.text(`  • ${n}`, 14, y);
            y += 6;
        });
    }

    const tipo = isInscricao ? 'Inscricao' : 'Mensalidade';
    docP.save(`Adimplencia_${tipo}_${now.replace(/\//g,'_')}.pdf`);
}

// ================= EXTRATO FINANCEIRO - EXPORTAR PDF =================

function printFinanceiroRelatorioPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('pt-BR');

    // Ler dados do resumo exibido na tela
    const summaryGrid = document.getElementById('fin-relatorio-summary-grid');
    const summaryText = summaryGrid ? summaryGrid.innerText.replace(/\n+/g, ' | ') : '';

    // Cabeçalho
    doc.setFillColor(0, 75, 195);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Iceberg Kids - Extrato Financeiro', 105, 12, null, null, 'center');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em: ${now}`, 105, 22, null, null, 'center');

    // Resumo (texto do grid)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    let y = 36;
    if (summaryText) {
        doc.setFont('helvetica', 'bold');
        doc.text('Resumo do Período:', 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(summaryText, 182);
        doc.text(lines, 14, y);
        y += lines.length * 5 + 4;
    }

    // Gráfico (captura do canvas)
    const canvas = document.getElementById('chartFinanceiroRelatorio');
    if (canvas) {
        try {
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 80;
            const imgHeight = 80;
            const imgX = (210 - imgWidth) / 2;
            doc.addImage(imgData, 'PNG', imgX, y, imgWidth, imgHeight);
            y += imgHeight + 6;
        } catch(e) {
            console.warn('Não foi possível capturar o gráfico para o PDF.', e);
        }
    }

    // Tabela de lançamentos filtrados
    const deVal = document.getElementById('fin-relatorio-de') ? document.getElementById('fin-relatorio-de').value : null;
    const ateVal = document.getElementById('fin-relatorio-ate') ? document.getElementById('fin-relatorio-ate').value : null;
    
    let filtered = appData.financeiro || [];
    if (deVal && ateVal) {
        const startDate = new Date(deVal);
        const endDate = new Date(ateVal);
        filtered = filtered.filter(f => {
            const d = new Date(f.Data);
            return d >= startDate && d <= endDate;
        });
    }
    filtered = [...filtered].sort((a, b) => new Date(a.Data) - new Date(b.Data));

    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Lançamentos do Período:', 14, y);
    y += 4;

    const tableData = filtered.map(f => [
        f.Data ? new Date(f.Data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '---',
        f.Tipo || '',
        f.Categoria || '',
        f.Descricao || '---',
        parseFloat(f.Valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    ]);

    doc.autoTable({
        startY: y,
        head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor']],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 75, 195] },
        alternateRowStyles: { fillColor: [245, 247, 255] }
    });

    doc.save(`Extrato_Financeiro_${now.replace(/\//g,'_')}.pdf`);
}
