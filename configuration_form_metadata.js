function extractFormFieldIdsFromUrl() {
  // Ouvre le Google Sheet et sélectionne la feuille "Donnees"
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = spreadsheet.getSheetByName(DATA_SHEET_NAME);
  
  // Obtient l'URL de la cellule B5
  var url = dataSheet.getRange('B5').getValue();
  
  // Extrait les paires ID de champ - valeur
  var pairs = url.split('&').slice(1); // nous excluons la première partie qui est "usp=pp_url"
  
  var dictFieldId = {};

  for (var i = 0; i < pairs.length; i++) {
    var parts = pairs[i].split('=');
    var id = parts[0].replace('entry.', ''); // enlève 'entry.' pour obtenir l'ID
    var index = i; 
    dictFieldId[index] = id;
  }
  return dictFieldId;
}

function updateDataValidationForNewEntry() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var responsesSheet = spreadsheet.getSheetByName(RESPONSE_SHEET_NAME);
  var configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);

  var lastRow = responsesSheet.getLastRow();


  // Créez une liste d'options basée sur les numéros de ligne
  var choices = [];
  for (var i = 2; i <= lastRow; i++) {
    choices.push("ligne " + i);
  }

  // Créez et appliquez la règle de validation des données
  var rangeRule = SpreadsheetApp.newDataValidation().requireValueInList(choices, true).build();

  // Supposer que la colonne de validation des données est la première colonne après la dernière colonne noire
  var lastCol = configSheet.getLastColumn();
  Logger.log(lastCol);
  while(configSheet.getRange(2, lastCol + 1).getBackground() !== "#000000") {
    lastCol--;
  }
  
  configSheet.getRange(2, lastCol + 2).setDataValidation(rangeRule);
}
