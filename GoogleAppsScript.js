function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Lê os cabeçalhos (a primeira linha) da planilha
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var row = [];
  var timestamp = new Date();
  
  // O formulário HTML envia os dados no formato JSON
  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch(err) {
    // Se falhar, usa os parâmetros padrão (caso mandem como formulário comum)
    data = e.parameter;
  }
  
  // Para cada cabeçalho da planilha, puxa o dado correspondente do formulário
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (header === "Data") {
      row.push(timestamp); // Coloca a data e hora do envio automaticamente
    } else {
      row.push(data[header] || ""); // Se o campo existir, preenche, se não, deixa em branco
    }
  }

  // Adiciona a nova linha com os dados da inscrição na planilha
  sheet.appendRow(row);
  
  return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==============================================================================
// FUNÇÃO DE CONFIGURAÇÃO INICIAL
// Execute essa função clicando em "Executar" apenas uma vez, 
// para criar os cabeçalhos na primeira linha da sua planilha vazia!
// ==============================================================================
function setupHeaders() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var headers = [
    "Data", "childName", "gender", "birthDate", "document", "baptized", 
    "tshirtSize", "extraTshirtsData", "cep", "street", "number", "complement", 
    "neighborhood", "city", "state", "fatherName", "fatherPhone", "fatherEmail", 
    "motherName", "motherPhone", "motherEmail", "emergencyName", "emergencyPhone", 
    "healthPlan", "bloodType", "allergies", "conditions", "medications", "lgpd", "terms"
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}
