// ==============================================================================
// BACKEND ICEBERG KIDS - GESTÃO COMPLETA E ENVIO DE E-MAILS
// ==============================================================================

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ['Inscricoes', 'Usuarios', 'Apoiadores', 'Atividades', 'Apontamentos', 'Calendario', 'Financeiro', 'Mensagens', 'Regras'];
  
  sheets.forEach(name => {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });

  // Criar cabeçalho da aba Regras se estiver vazia
  const regrasSheet = ss.getSheetByName('Regras');
  if (regrasSheet.getLastRow() === 0) {
    regrasSheet.appendRow(['ID', 'Nome', 'Gatilho', 'Destinatario', 'Template', 'Status']);
    // Adiciona regra padrão inicial de boas-vindas
    regrasSheet.appendRow(['REG_BOAS_VINDAS', 'Disparo de Boas-vindas Inicial', 'ao-inscrever', 'responsavel', 'boas-vindas', 'Ativa']);
  }

  // Criar cabeçalho e usuário inicial se a aba estiver vazia
  const userSheet = ss.getSheetByName('Usuarios');
  if (userSheet.getLastRow() === 0) {
    userSheet.appendRow(['Nome', 'Email', 'Senha', 'Nivel', 'Foto']);
  }

  // Criar cabeçalho da aba Mensagens se estiver vazia
  const msgSheet = ss.getSheetByName('Mensagens');
  if (msgSheet.getLastRow() === 0) {
    forcarTemplateMensagem();
  }
}

// Execute esta função UMA VEZ no editor do Apps Script para criar/atualizar o template de e-mail.
// Vá em: Executar → forcarTemplateMensagem
function forcarTemplateMensagem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Mensagens');
  if (!sheet) return;

  // Garante cabeçalho
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Assunto', 'Corpo']);
  }

  // Template Aventureiro
  const assunto = '🧊✨ Uma decisão gigante! Boas-vindas ao Clube de Aventureiros Iceberg Kids! ❤️🚀';
  const corpo = `Olá, Família de {{Nome Criança}}!

Que alegria explodindo no peito! É com o coração cheio de entusiasmo e gratidão que queremos dar as boas-vindas oficiais a vocês e ao seu(sua) pequeno(a) aventureiro(a) no nosso Clube de Aventureiros Iceberg Kids!

Sabemos que a infância passa em um piscar de olhos, e a decisão de inscrever seu(sua) filho(a) no clube mostra o quanto vocês se importam com o presente e, principalmente, com o futuro dele(a). Aqui no Iceberg Kids, nós olhamos para as crianças sabendo que há muito mais debaixo da superfície do que os olhos podem ver. Nosso compromisso não é apenas ajudar a desenvolver um cidadão exemplar para a sociedade, mas o nosso foco principal e a nossa maior missão é prepará-lo(a) para a eternidade!

Para que esse projeto lindo ganhe vida, queremos deixar o nosso mais sincero muito obrigado pela dedicação de vocês, {{Nome Responsável}}. Sabemos que a rotina é corrida, mas cada gota de suor vai valer a pena quando vocês virem o brilho nos olhos deles e o caráter gigante sendo moldado!

Quando nos encontramos? Nossas reuniões acontecerão quinzenalmente, aos sábados, das 15h às 16h.
Onde fica nossa base? Rua Hamilton Luiz Uba, 610 - Planta São Marcos (https://shre.ink/3BcK)

Nos vemos na próxima reunião!

Com todo o carinho, orações e animação,
Diretoria do Clube de Aventureiros Iceberg Kids ❄️🙏💙`;

  // Template Liderança
  const assuntoLider = '🧊✨ Bem-vindo à Liderança - Clube Iceberg Kids! ❤️🚀';
  const corpoLider = `Olá, {{Nome Criança}}!

Seja muito bem-vindo(a) à liderança do nosso Clube de Aventureiros Iceberg Kids! É um privilégio contar com sua dedicação e liderança para guiar nossos aventureiros.

Seu compromisso nos ajuda a moldar o futuro das nossas crianças. Obrigado por aceitar esse chamado!`;

  // Template Pais
  const assuntoPais = '🧊✨ Bem-vindos, Pais - Clube Iceberg Kids! ❤️🚀';
  const corpoPais = `Olá, {{Nome Criança}}!

Seja muito bem-vindo(a) ao grupo de pais e apoiadores do nosso Clube de Aventureiros Iceberg Kids! Agradecemos por caminhar conosco nessa jornada de desenvolvimento dos nossos aventureiros.`;

  const data = getSheetData('Mensagens');
  
  const upsert = (id, sub, body) => {
    const existing = data.find(m => String(m.ID || m.id || '').trim().toLowerCase() === id.toLowerCase());
    if (existing) {
      sheet.getRange(existing._row, 2).setValue(sub);
      sheet.getRange(existing._row, 3).setValue(body);
    } else {
      sheet.appendRow([id, sub, body]);
    }
  };

  upsert('boas-vindas', assunto, corpo);
  upsert('boas-vindas liderança', assuntoLider, corpoLider);
  upsert('boas-vindas pais', assuntoPais, corpoPais);
}


// ---------------------- ENDPOINTS ----------------------

function doGet(e) {
  setupSheets();
  const action = e.parameter.action;

  if (action === 'login') {
    const email = e.parameter.email;
    const password = e.parameter.password;
    const users = getSheetData('Usuarios');
    const user = users.find(u => u.Email === email && u.Senha === password);
    if (user) {
      return jsonResponse({ success: true, user: { name: user.Nome, email: user.Email, role: user.Nivel, foto: user.FotoBase64 || user.Foto } });
    }
    return jsonResponse({ success: false, error: 'E-mail ou senha incorretos.' });
  }

  if (action === 'getApoiadores') return jsonResponse(getSheetData('Apoiadores'));
  if (action === 'getCalendario') return jsonResponse(getSheetData('Calendario'));
  
  if (action === 'getAllData') {
    return jsonResponse({
      inscricoes: getSheetData('Inscricoes'),
      usuarios: getSheetData('Usuarios'),
      apoiadores: getSheetData('Apoiadores'),
      atividades: getSheetData('Atividades'),
      apontamentos: getSheetData('Apontamentos'),
      calendario: getSheetData('Calendario'),
      financeiro: getSheetData('Financeiro'),
      mensagens: getSheetData('Mensagens'),
      regras: getSheetData('Regras')
    });
  }

  return jsonResponse({ error: 'Ação GET não encontrada' }, 404);
}

function doPost(e) {
  setupSheets();
  let payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Formato de Payload Inválido' }, 400);
  }

  const action = payload.action;

  try {
    if (action === 'addInscricao') return jsonResponse(handleAddInscricao(payload.data));
    if (action === 'updateStatus') return jsonResponse(handleUpdateStatus(payload));
    
    if (action === 'deleteRow') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(payload.sheetName);
      if(sheet) sheet.deleteRow(payload.row);
      return jsonResponse({ success: true });
    }

    // USUARIOS
    if (action === 'addUsuario') return jsonResponse(appendData('Usuarios', [payload.data.nome, payload.data.email, payload.data.senha, payload.data.nivel, payload.data.fotoBase64 || '']));
    if (action === 'updateUsuario') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Usuarios');
      sheet.getRange(payload.row, 1).setValue(payload.data.nome);
      sheet.getRange(payload.row, 2).setValue(payload.data.email);
      if (payload.data.senha) sheet.getRange(payload.row, 3).setValue(payload.data.senha);
      sheet.getRange(payload.row, 4).setValue(payload.data.nivel);
      if (payload.data.fotoBase64) sheet.getRange(payload.row, 5).setValue(payload.data.fotoBase64);
      return jsonResponse({ success: true });
    }

    // UPDATES
    if (action === 'updateApoiador') {
      return jsonResponse(handleSaveApoiador(payload));
    }
    if (action === 'updateAtividade') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Atividades');
      sheet.getRange(payload.row, 1, 1, 4).setValues([[payload.dataReuniao, payload.atividade, payload.observacoes, payload.imagens || ""]]);
      return jsonResponse({ success: true });
    }
    if (action === 'updateApontamento') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Apontamentos');
      sheet.getRange(payload.row, 1, 1, 8).setValues([[payload.data, payload.nome, payload.pontualidade, payload.material, payload.uniforme, payload.lenco, payload.participativo, payload.obs]]);
      return jsonResponse({ success: true });
    }
    if (action === 'updateCalendario') {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Calendario');
      sheet.getRange(payload.row, 1, 1, 4).setValues([[payload.dataEvento, payload.evento, payload.categoria, payload.detalhes]]);
      return jsonResponse({ success: true });
    }
    if (action === 'updateFinanceiro') {
      return jsonResponse(handleSaveFinanceiro(payload));
    }

    // REGRAS
    if (action === 'saveRegra') return jsonResponse(handleSaveRegra(payload));

    // MENSAGENS
    if (action === 'saveMensagem') return jsonResponse(handleSaveMensagem(payload));
    if (action === 'sendBroadcastEmail') return jsonResponse(handleSendBroadcast(payload));

    // ADDS
    if (action === 'addApoiador') return jsonResponse(handleSaveApoiador(payload));
    if (action === 'addAtividade') return jsonResponse(appendData('Atividades', [payload.dataReuniao, payload.atividade, payload.observacoes, payload.imagens || ""]));
    if (action === 'addApontamento') return jsonResponse(appendData('Apontamentos', [payload.data, payload.nome, payload.pontualidade, payload.material, payload.uniforme, payload.lenco, payload.participativo, payload.obs]));
    if (action === 'addCalendario') return jsonResponse(appendData('Calendario', [payload.dataEvento, payload.evento, payload.categoria, payload.detalhes]));
    if (action === 'addFinanceiro') return jsonResponse(handleSaveFinanceiro(payload));
    
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({ error: 'Ação POST não reconhecida' }, 400);
}

// ---------------------- CORE FUNCTIONS ----------------------

function handleAddInscricao(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Inscricoes');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data', 'Status']);
  }
  
  const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 2)).getValues()[0];
  const rowData = new Array(headers.length).fill('');
  
  rowData[0] = new Date().toISOString();
  rowData[1] = 'Recebida'; // Status inicial

  // Mapeamento dinâmico
  Object.keys(data).forEach(key => {
    if (key === 'fotoBase64' || key === 'FotoBase64') {
      if (data[key]) {
        try {
          const url = saveFileToDrive(data[key], data['Nome Criança'] || data['childName'] || 'SemNome', data['Nome Pai'] || data['fatherName'] || '');
          data[key] = url; // Substitui o Base64 pelo URL do Drive
        } catch(e) {
          data[key] = 'Erro Upload';
        }
      }
    }
    
    // Normalizar a chave para encontrar a coluna
    const cleanKey = key.trim().toLowerCase();
    let colIndex = headers.findIndex(h => String(h).trim().toLowerCase() === cleanKey);
    
    // Se a coluna não existe, cria
    if (colIndex === -1) {
      const originalCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
      sheet.getRange(1, headers.length + 1).setValue(originalCaseKey);
      headers.push(originalCaseKey);
      rowData.push('');
      colIndex = headers.length - 1;
    }
    
    rowData[colIndex] = data[key];
  });
  
  sheet.appendRow(rowData);

  // Enviar E-mail de Boas-vindas
  try {
    sendWelcomeEmail(data);
  } catch(e) {
    console.error("Erro ao enviar e-mail: " + e);
  }

  // Processar regras automáticas com o gatilho 'ao-inscrever'
  try {
    processarRegrasAutomaticas('ao-inscrever', data);
  } catch(e) {
    console.error("Erro ao processar regras de disparo automatico na inscricao: " + e);
  }

  return { success: true };
}

function handleUpdateStatus(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Inscricoes');
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = parseInt(payload.row, 10);
  
  let statusCol = headers.findIndex(h => String(h).toLowerCase() === 'status') + 1;
  let cargoCol = headers.findIndex(h => String(h).toLowerCase() === 'cargo') + 1;
  let tipoCol = headers.findIndex(h => String(h).toLowerCase() === 'tipoinscricao') + 1;
  let fotoCol = headers.findIndex(h => String(h).toLowerCase() === 'fotobase64' || String(h).toLowerCase() === 'foto') + 1;

  if (statusCol === 0) {
    sheet.getRange(1, headers.length + 1).setValue('Status');
    statusCol = headers.length + 1;
  }
  
  if (cargoCol === 0 && tipoCol === 0) {
    sheet.getRange(1, sheet.getLastColumn() + 1).setValue('Cargo');
    cargoCol = sheet.getLastColumn();
  }

  if (payload.status && statusCol > 0) {
    sheet.getRange(row, statusCol).setValue(payload.status);
  }
  
  if (payload.cargo || payload.TipoInscricao) {
    const cargoVal = payload.cargo || payload.TipoInscricao;
    if (cargoCol > 0) sheet.getRange(row, cargoCol).setValue(cargoVal);
    if (tipoCol > 0) sheet.getRange(row, tipoCol).setValue(cargoVal);
  }

  if (payload.fotoBase64 || payload.FotoBase64) {
    if (fotoCol === 0) {
      sheet.getRange(1, sheet.getLastColumn() + 1).setValue('FotoBase64');
      fotoCol = sheet.getLastColumn();
    }
    try {
      const url = saveFileToDrive(payload.fotoBase64 || payload.FotoBase64, `Upload_Manual_${row}`, '');
      sheet.getRange(row, fotoCol).setValue(url);
    } catch(e) {
      sheet.getRange(row, fotoCol).setValue('Erro Upload');
    }
  }

  return { success: true };
}

function saveFileToDrive(base64Data, childName, responsavelName) {
  if (!base64Data || !base64Data.includes('base64,')) return "";
  
  const parts = base64Data.split('base64,');
  const typeStr = parts[0].match(/data:(.*);/)[1];
  const decoded = Utilities.base64Decode(parts[1]);
  const blob = Utilities.newBlob(decoded, typeStr, `Foto_${(childName || 'Aventureiro').replace(/[^a-zA-Z0-9]/g, '_')}.png`);
  
  const folders = DriveApp.getFoldersByName("Inscricoes_Iceberg_Fotos");
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder("Inscricoes_Iceberg_Fotos");
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return "https://lh3.googleusercontent.com/d/" + file.getId();
}

function appendData(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (sheet) sheet.appendRow(rowData);
  return { success: true };
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  if (sheetName === 'Atividades') {
    const lastCol = sheet.getLastColumn();
    if (lastCol < 4 || !sheet.getRange(1, 4).getValue()) {
      sheet.getRange(1, 4).setValue('Imagens');
    }
  }
  
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  const headers = rows[0];
  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj = { _row: i + 1 };
    let hasData = false;
    
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = row[index];
        if (row[index]) hasData = true;
      }
    });
    
    if (hasData) data.push(obj);
  }
  
  return data;
}

// ---------------------- MESSAGING ENGINE ----------------------

function handleSaveMensagem(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Mensagens');
  let targetRow = null;
  
  if (payload.row) {
    targetRow = parseInt(payload.row, 10);
  }
  
  if (!targetRow || isNaN(targetRow)) {
    const data = getSheetData('Mensagens');
    const searchId = payload.oldId || payload.id;
    const existing = data.find(m => String(m.ID).trim() === String(searchId).trim() || String(m.id).trim() === String(searchId).trim());
    if (existing) {
      targetRow = existing._row;
    }
  }

  if (targetRow && !isNaN(targetRow)) {
    sheet.getRange(targetRow, 1).setValue(payload.id);
    sheet.getRange(targetRow, 2).setValue(payload.assunto);
    sheet.getRange(targetRow, 3).setValue(payload.corpo);
  } else {
    sheet.appendRow([payload.id, payload.assunto, payload.corpo]);
  }
  return { success: true };
}

function applyTags(text, dataInscricao) {
  if (!text) return '';
  let msg = text;
  const nameVal = dataInscricao['Nome Criança'] || dataInscricao['childName'] || 'Membro';
  msg = msg.replace(/\{\{Nome Criança\}\}/g, nameVal);
  msg = msg.replace(/\{\{Nome Membro\}\}/g, nameVal);
  msg = msg.replace(/\{\{Nome Lider\}\}/g, nameVal);
  msg = msg.replace(/\{\{Nome do Adulto\}\}/g, nameVal);
  msg = msg.replace(/\{\{Nome Responsável\}\}/g, dataInscricao['Nome Pai'] || dataInscricao['fatherName'] || dataInscricao['Nome Mãe'] || 'Responsável');
  msg = msg.replace(/\{\{Classe\}\}/g, dataInscricao['Classe'] || dataInscricao['classe'] || '');
  return msg;
}

function sendWelcomeEmail(data) {
  const emailDestino = getTargetEmail(data);
    
  console.log("Tentando enviar e-mail de boas-vindas para: " + emailDestino);
  if (!emailDestino || !emailDestino.includes('@')) {
    console.warn("E-mail de destino inválido ou vazio.");
    return;
  }

  const msgs = getSheetData('Mensagens');
  const cargo = String(data['Cargo'] || data['Cargo '] || data['TipoInscricao'] || data['tipoInscricao'] || '').trim().toLowerCase();
  
  let templateId = 'boas-vindas'; // Padrão: Aventureiro
  if (cargo.includes('diretoria') || cargo.includes('lider') || cargo.includes('diretor') || cargo.includes('secret') || cargo.includes('conselh')) {
    templateId = 'boas-vindas liderança';
  } else if (cargo.includes('pais') || cargo.includes('pai') || cargo.includes('mãe') || cargo.includes('mae')) {
    templateId = 'boas-vindas pais';
  }

  const findTemplate = (id) => {
    const targetId = id.toLowerCase();
    return msgs.find(m => {
      const rawId = String(m.ID || m.id || '').trim().toLowerCase();
      const normRaw = rawId.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normTarget = targetId.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normRaw === normTarget || rawId === targetId;
    });
  };

  let template = findTemplate(templateId);
  if (!template && templateId !== 'boas-vindas') {
    console.log(`Template '${templateId}' não encontrado. Usando fallback 'boas-vindas'.`);
    template = findTemplate('boas-vindas');
  }
  
  if (template) {
    const assuntoTemplate = template.Assunto || template.assunto;
    const corpoTemplate = template.Corpo || template.corpo;
    
    if (assuntoTemplate && corpoTemplate) {
      const assuntoFinal = applyTags(assuntoTemplate, data);
      const corpoFinal = applyTags(corpoTemplate, data);
      
      console.log("Enviando e-mail...");
      MailApp.sendEmail({
        to: emailDestino,
        subject: assuntoFinal,
        body: corpoFinal,
        name: "Clube Iceberg Kids"
      });
      console.log("E-mail enviado com sucesso!");
    } else {
      console.warn("Assunto ou Corpo do template '" + templateId + "' vazio.");
    }
  } else {
    console.warn("Nenhum template de boas-vindas correspondente ou padrão foi encontrado na aba Mensagens.");
  }
}

function handleSendBroadcast(payload) {
  const inscricoes = getSheetData('Inscricoes');
  const subjectTemplate = payload.assunto;
  const bodyTemplate = payload.corpo;
  const targetRows = payload.rows ? payload.rows.map(r => parseInt(r, 10)) : null;
  let sentCount = 0;

  inscricoes.forEach(insc => {
    // Apenas enviar para inscrições ativas
    if (String(insc.Status).trim() !== 'Cancelada') {
      const emailDestino = getTargetEmail(insc);
      const cleanEmail = emailDestino.toLowerCase().trim();
      const rowNum = parseInt(insc._row, 10);
      
      if (cleanEmail.includes('@') && (!targetRows || targetRows.includes(rowNum))) {
        const assuntoFinal = applyTags(subjectTemplate, insc);
        const corpoFinal = applyTags(bodyTemplate, insc);
        
        try {
          MailApp.sendEmail({
            to: emailDestino,
            subject: assuntoFinal,
            body: corpoFinal,
            name: "Diretoria Iceberg Kids"
          });
          sentCount++;
        } catch(e) {
          console.error("Erro no broadcast para " + emailDestino, e);
        }
      }
    }
  });

  return { success: true, enviados: sentCount };
}

function jsonResponse(data, code = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

function getTargetEmail(insc) {
  if (!insc) return "";
  
  const getVal = (key) => {
    const cleanKey = String(key).trim().toLowerCase();
    const foundKey = Object.keys(insc).find(k => String(k).trim().toLowerCase() === cleanKey);
    return foundKey ? String(insc[foundKey]).trim() : "";
  };

  const preferenca = getVal('ReceberEmailEm');
  const emailResp = getVal('Email Responsável') || getVal('email-responsavel') || getVal('Email');
  const emailMae = getVal('Email Mãe') || getVal('emailMae') || getVal('motherEmail');
  const emailPai = getVal('Email Pai') || getVal('emailPai') || getVal('fatherEmail');

  if (preferenca === 'Mãe' && emailMae) return emailMae;
  if (preferenca === 'Pai' && emailPai) return emailPai;
  if (preferenca === 'Responsável Legal' && emailResp) return emailResp;

  return emailResp || emailMae || emailPai || "";
}

function handleSaveFinanceiro(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Financeiro');
  if (!sheet) throw new Error('Aba Financeiro não encontrada.');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['ID', 'Data', 'Tipo', 'Categoria', 'Descricao', 'Valor', 'Crianca', 'ResponsavelDoador', 'NF', 'DetalheOutros']);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Extrair do sub-objeto data se existir (conforme enviado por admin.js)
  const source = payload.data || payload;
  
  const idVal = source.id || payload.id || 'FIN_' + new Date().getTime();
  const dataVal = (source.data && typeof source.data === 'string') ? source.data : ((payload.data && typeof payload.data === 'string') ? payload.data : new Date().toISOString().split('T')[0]);
  const tipoVal = source.tipo || payload.tipo || '';
  const categoriaVal = source.categoria || payload.categoria || '';
  const descricaoVal = source.descricao || payload.descricao || '';
  const valorVal = parseFloat(source.valor) || parseFloat(payload.valor) || 0;
  const criancaVal = source.crianca || payload.crianca || '';
  const responsavelDoadorVal = source.responsavelDoador || source.responsavel || payload.responsavelDoador || payload.responsavel || '';
  const nfVal = source.nf || payload.nf || '';
  const detalheOutrosVal = source.detalheOutros || payload.detalheOutros || '';

  // Monta a linha baseando-se estritamente nos cabeçalhos
  const rowData = new Array(headers.length).fill('');
  headers.forEach((h, index) => {
    const cleanH = String(h).trim().toLowerCase();
    
    if (cleanH === 'id') {
      rowData[index] = idVal;
    } else if (cleanH === 'data') {
      rowData[index] = dataVal;
    } else if (cleanH === 'tipo') {
      rowData[index] = tipoVal;
    } else if (cleanH === 'categoria') {
      rowData[index] = categoriaVal;
    } else if (cleanH.includes('descricao') || cleanH.includes('descrição')) {
      rowData[index] = descricaoVal;
    } else if (cleanH === 'valor') {
      rowData[index] = valorVal;
    } else if (cleanH.includes('crianca') || cleanH.includes('criança')) {
      rowData[index] = criancaVal;
    } else if (cleanH.includes('responsavel') || cleanH.includes('responsável') || cleanH.includes('doador')) {
      rowData[index] = responsavelDoadorVal;
    } else if (cleanH === 'nf') {
      rowData[index] = nfVal;
    } else if (cleanH.includes('detalhe') || cleanH.includes('outros')) {
      rowData[index] = detalheOutrosVal;
    }
  });

  if (payload.row) {
    const r = parseInt(payload.row, 10);
    sheet.getRange(r, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function handleSaveApoiador(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Apoiadores');
  if (!sheet) throw new Error('Aba Apoiadores não encontrada.');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Data Cadastro', 'Nome do Apoiador', 'Empresa/Detalhe', 'Telefone', 'Email']);
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const source = payload.data || payload;
  const nomeVal = source.nome || source['Nome do Apoiador'] || source.Nome || '';
  const detalheVal = source.detalhe || source['Empresa/Detalhe'] || source.Detalhe || source.empresa || '';
  const telefoneVal = source.telefone || source.Telefone || '';
  const emailVal = source.email || source.Email || '';
  
  let dataCadastroVal = '';
  if (payload.row) {
    const r = parseInt(payload.row, 10);
    const dateColIdx = headers.findIndex(h => String(h).trim().toLowerCase().includes('data') || String(h).trim().toLowerCase().includes('cadastro'));
    if (dateColIdx !== -1) {
      dataCadastroVal = sheet.getRange(r, dateColIdx + 1).getValue();
    }
  }
  if (!dataCadastroVal) {
    dataCadastroVal = (source.dataCadastro && typeof source.dataCadastro === 'string') ? source.dataCadastro : ((source.data && typeof source.data === 'string') ? source.data : new Date().toISOString().split('T')[0]);
  }

  // Monta a linha baseando-se estritamente nos cabeçalhos
  const rowData = new Array(headers.length).fill('');
  headers.forEach((h, index) => {
    const cleanH = String(h).trim().toLowerCase();
    if (cleanH.includes('data') || cleanH.includes('cadastro')) {
      rowData[index] = dataCadastroVal;
    } else if (cleanH.includes('nome') || cleanH.includes('apoiador')) {
      rowData[index] = nomeVal;
    } else if (cleanH.includes('empresa') || cleanH.includes('detalhe')) {
      rowData[index] = detalheVal;
    } else if (cleanH.includes('telefone') || cleanH.includes('fone')) {
      rowData[index] = telefoneVal;
    } else if (cleanH.includes('email') || cleanH.includes('e-mail')) {
      rowData[index] = emailVal;
    }
  });

  if (payload.row) {
    const r = parseInt(payload.row, 10);
    sheet.getRange(r, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  // Gatilho automático: Quando um novo apoiador é lançado no hall
  try {
    processarRegrasAutomaticas('novo-apoiador', source);
  } catch(e) {
    console.error('Erro ao processar regras de novo apoiador:', e);
  }

  return { success: true };
}

// ================= GESTÃO DE REGRAS DE DISPARO =================

function handleSaveRegra(payload) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Regras');
  let targetRow = null;
  
  if (payload.row) {
    targetRow = parseInt(payload.row, 10);
  }
  
  if (!targetRow || isNaN(targetRow)) {
    const data = getSheetData('Regras');
    const searchId = payload.oldId || payload.id;
    const existing = data.find(r => String(r.ID).trim() === String(searchId).trim() || String(r.id).trim() === String(searchId).trim());
    if (existing) {
      targetRow = existing._row;
    }
  }

  const rowData = [
    payload.id || 'REG_' + new Date().getTime(),
    payload.nome,
    payload.gatilho,
    payload.destinatario,
    payload.template,
    payload.status || 'Ativa'
  ];

  if (targetRow && !isNaN(targetRow)) {
    sheet.getRange(targetRow, 1, 1, 6).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return { success: true };
}

function processarRegrasAutomaticas(gatilho, entidadeConectada) {
  const regras = getSheetData('Regras');
  const regrasAtivas = regras.filter(r => r.Gatilho === gatilho && r.Status === 'Ativa');
  if (regrasAtivas.length === 0) return;

  const msgs = getSheetData('Mensagens');

  regrasAtivas.forEach(regra => {
    const template = msgs.find(m => m.ID === regra.Template || m.id === regra.Template);
    if (!template) {
      console.warn('Template de mensagem associado não encontrado: ' + regra.Template);
      return;
    }

    const assuntoTemplate = template.Assunto || template.assunto;
    const corpoTemplate = template.Corpo || template.corpo;
    if (!assuntoTemplate || !corpoTemplate) return;

    // Obter destinatários com base no Grupo Destinatário da Regra
    const destinatarios = obterEmailsGrupo(regra.Destinatario, entidadeConectada);
    
    destinatarios.forEach(dest => {
      if (!dest.email || !dest.email.includes('@')) return;

      // Se houver uma entidade de dados vinculada (como dados da inscrição), mescla as tags
      const dadosMesclados = dest.dados || entidadeConectada || {};
      const assuntoFinal = applyTags(assuntoTemplate, dadosMesclados);
      const corpoFinal = applyTags(corpoTemplate, dadosMesclados);

      try {
        MailApp.sendEmail({
          to: dest.email,
          subject: assuntoFinal,
          body: corpoFinal,
          name: "Clube Iceberg Kids"
        });
        console.log(`Disparo automático (${regra.Nome}) enviado com sucesso para ${dest.email}`);
      } catch(e) {
        console.error(`Erro no disparo automático (${regra.Nome}) para ${dest.email}:`, e);
      }
    });
  });
}

function obterEmailsGrupo(grupo, entidadeConectada) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const list = [];

  const getVal = (obj, key) => {
    if (!obj) return "";
    const cleanKey = String(key).trim().toLowerCase();
    const foundKey = Object.keys(obj).find(k => String(k).trim().toLowerCase() === cleanKey);
    return foundKey ? String(obj[foundKey]).trim() : "";
  };

  if (grupo === 'apoiador-especifico' && entidadeConectada) {
    const email = getVal(entidadeConectada, 'Email') || getVal(entidadeConectada, 'Email Apoiador');
    if (email) list.push({ email, dados: entidadeConectada });
    return list;
  }

  if (grupo === 'todos-apoiadores') {
    const apoiadores = getSheetData('Apoiadores');
    apoiadores.forEach(ap => {
      const email = ap.Email || ap.email;
      if (email) list.push({ email, dados: ap });
    });
    return list;
  }

  if (grupo === 'diretoria') {
    const usuarios = getSheetData('Usuarios');
    usuarios.forEach(u => {
      const email = u.Email || u.email;
      if (email) list.push({ email, dados: u });
    });
    return list;
  }

  // Grupos vinculados a aventureiros ativos
  const inscricoes = getSheetData('Inscricoes');
  const ativos = inscricoes.filter(i => {
    const s = String(i.Status || '').trim();
    const cargo = String(i.Cargo || 'Aventureiro(a)').trim().toLowerCase();
    const isAtivo = s === 'Aceita' || s === 'Cadastro finalizado' || s === 'Recebida';
    const isAventureiro = cargo.includes('aventureiro') || cargo === '';
    return isAtivo && isAventureiro;
  });

  if (grupo === 'mae') {
    ativos.forEach(i => {
      const email = getVal(i, 'Email Mãe') || getVal(i, 'emailMae') || getVal(i, 'motherEmail');
      if (email) list.push({ email, dados: i });
    });
  } else if (grupo === 'pai') {
    ativos.forEach(i => {
      const email = getVal(i, 'Email Pai') || getVal(i, 'emailPai') || getVal(i, 'fatherEmail');
      if (email) list.push({ email, dados: i });
    });
  } else if (grupo === 'responsavel') {
    // Se for para o responsável legal ou fallback do e-mail do aventureiro
    ativos.forEach(i => {
      const email = getTargetEmail(i);
      if (email) list.push({ email, dados: i });
    });
  } else if (grupo === 'todos-ativos') {
    // Todos os e-mails coletados dos aventureiros ativos (mãe + pai + responsável)
    const emailsUnicos = new Set();
    ativos.forEach(i => {
      const emails = [
        getTargetEmail(i),
        getVal(i, 'Email Mãe') || getVal(i, 'emailMae') || getVal(i, 'motherEmail'),
        getVal(i, 'Email Pai') || getVal(i, 'emailPai') || getVal(i, 'fatherEmail')
      ];
      emails.forEach(e => {
        if (e && e.includes('@') && !emailsUnicos.has(e.toLowerCase())) {
          emailsUnicos.add(e.toLowerCase());
          list.push({ email: e, dados: i });
        }
      });
    });
  }

  return list;
}

// Executar tarefas agendadas quinzenalmente ou disparos periódicos (Último e Primeiro dia útil)
function triggerVerificacaoDatasUteis() {
  const hoje = new Date();
  
  if (isPrimeiroDiaUtil(hoje)) {
    processarRegrasAutomaticas('primeiro-dia-util', null);
  }
  if (isUltimoDiaUtil(hoje)) {
    processarRegrasAutomaticas('ultimo-dia-util', null);
  }
}

function isPrimeiroDiaUtil(date) {
  // Retorna true se hoje for o primeiro dia útil do mês (considerando seg-sex)
  const d = new Date(date.getTime());
  d.setDate(1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return date.getDate() === d.getDate();
}

function isUltimoDiaUtil(date) {
  // Retorna true se hoje for o último dia útil do mês (considerando seg-sex)
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() - 1);
  }
  return date.getDate() === d.getDate();
}
