const fs = require('fs');
let content = fs.readFileSync('inscricao.html', 'utf8');

// Replacements
content = content.replace(/informa\ufffdes/g, 'informações');
content = content.replace(/informa\ufffdo/g, 'informação');
content = content.replace(/b\ufffdsicas/g, 'básicas');
content = content.replace(/crian\ufffda/g, 'criança');
content = content.replace(/Crian\ufffda/g, 'Criança');
content = content.replace(/respons\ufffdveis/g, 'responsáveis');
content = content.replace(/G\ufffdnero/g, 'Gênero');
content = content.replace(/Religi\ufffdo/g, 'Religião');
content = content.replace(/S\ufffdtimo/g, 'Sétimo');
content = content.replace(/M\ufffde/g, 'Mãe');
content = content.replace(/m\ufffde/g, 'mãe');
content = content.replace(/Profiss\ufffdo/g, 'Profissão');
content = content.replace(/\ufffdrea/g, 'área');
content = content.replace(/sa\ufffdde/g, 'saúde');
content = content.replace(/P\ufffds/g, 'Pós');
content = content.replace(/Gradua\ufffd\ufffdo/g, 'Graduação');
content = content.replace(/Av\ufffd/g, 'Avó');
content = content.replace(/N\ufffdmero/g, 'Número');
content = content.replace(/S\ufffdo/g, 'São');
content = content.replace(/Jos\ufffd/g, 'José');
content = content.replace(/Irm\ufffdos/g, 'Irmãos');
content = content.replace(/m\ufffddicas/g, 'médicas');
content = content.replace(/atualiz\ufffd-las/g, 'atualizá-las');
content = content.replace(/reuni\ufffdes/g, 'reuniões');
content = content.replace(/v\ufffddeos/g, 'vídeos');
content = content.replace(/m\ufffddias/g, 'mídias');
content = content.replace(/Inscri\ufffd\ufffdo/g, 'Inscrição');
content = content.replace(/inscri\ufffd\ufffdo/g, 'inscrição');
content = content.replace(/avalia\ufffd\ufffdo/g, 'avaliação');
content = content.replace(/aten\ufffd\ufffdo/g, 'atenção');
content = content.replace(/Aten\ufffd\ufffdo/g, 'Atenção');
content = content.replace(/Confirma\ufffd\ufffdo/g, 'Confirmação');
content = content.replace(/conclu\ufffdda/g, 'concluída');
content = content.replace(/simb\ufffdlico/g, 'simbólico');
content = content.replace(/responsabilizar\ufffdo/g, 'responsabilizarão');
content = content.replace(/sangu\ufffdnea/g, 'sanguínea');
content = content.replace(/Fam\ufffdlia/g, 'Família');
content = content.replace(/Al\ufffdm/g, 'Além');
content = content.replace(/al\ufffdm/g, 'além');
content = content.replace(/pr\ufffdvias/g, 'prévias');
content = content.replace(/M\ufffddica/g, 'Médica');
content = content.replace(/Autoriza\ufffd\ufffdes/g, 'Autorizações');
content = content.replace(/voc\ufffd /g, 'você ');
content = content.replace(/voc\ufffds/g, 'vocês');
content = content.replace(/poder\ufffd/g, 'poderá');
content = content.replace(/Observa\ufffd\ufffdo/g, 'Observação');
content = content.replace(/Observa\ufffdo/g, 'Observação'); // Sometimes it's one
content = content.replace(/m\ufffddio/g, 'médio');
content = content.replace(/Jo\ufffdo/g, 'João');
content = content.replace(/M\ufffdos/g, 'Mãos');
content = content.replace(/Aten\ufffdo/g, 'Atenção');
content = content.replace(/Aten\ufffd\ufffdo/g, 'Atenção');

// Because n\ufffdo and N\ufffdo are tricky, we replace them explicitly where they occur as words
content = content.replace(/ n\ufffdo /g, ' não ');
content = content.replace(/>n\ufffdo /g, '>não ');
content = content.replace(/ N\ufffdo /g, ' Não ');
content = content.replace(/>N\ufffdo /g, '>Não ');

fs.writeFileSync('inscricao.html', content, 'utf8');
