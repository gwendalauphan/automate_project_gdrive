function filterValuesPresentInArray(sourceValues, filterValues) {
    var output = [];
  for (var i = 0; i < sourceValues.length; i++) {
    if (filterValues.indexOf(sourceValues[i]) !== -1) {
      output.push(sourceValues[i]);
        }
    }
    return output;
}

function mapArrayValuesToIndexes(values) {
  var dict = {};
  for (var i = 0; i < values.length; i++) {
    dict[values[i]] = i;
    }
    return dict;
}

function onFormSubmit() {
  // L'ID de ton Google Sheets où les réponses sont enregistrées
  var responseSpreadsheetId = PROJECT_SPREAD_SHEET_ID;
  var responseSpreadsheet = SpreadsheetApp.openById(responseSpreadsheetId);

  var responseSheetName = RESPONSE_SHEET_NAME;
  var responseSheet = responseSpreadsheet.getSheetByName(responseSheetName); // Obtient la feuille par son nom


  // Obtient la première ligne (headers) et la dernière ligne avec des données (réponses)
  var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues();
  var lastRow = responseSheet.getLastRow();
  var lastRowValues = responseSheet.getRange(lastRow, 1, 1, responseSheet.getLastColumn()).getValues();


  // L'ID de ton nouveau Google Sheets où tu veux copier les réponses
  var targetSpreadsheetId = PROJECT_SPREAD_SHEET_ID;
  var targetSpreadsheet = SpreadsheetApp.openById(targetSpreadsheetId);

  var targetSheetName = LAST_RESPONSE_SHEET_NAME;
  var targetSheet = targetSpreadsheet.getSheetByName(targetSheetName); // Obtient la feuille par son nom

  // Supposons que vous ayez déjà ces lignes en haut de votre fonction :
  var dictItems_init = listAllItemTitles();
  var dictitemsbis = filterValuesPresentInArray(dictItems_init, headers[0]);
  dictItems = mapArrayValuesToIndexes(dictitemsbis);
  Logger.log(dictitemsbis);
  // Logger.log(dictItems)
  var headersToIndex = [];

  // Convertir les headers en leurs index respectifs en utilisant le dictionnaire
  for (var i = 0; i < headers[0].length; i++) {
    var header = headers[0][i];
    headersToIndex.push([dictItems[header]]);  // Utilisez dictItems pour obtenir l'index pour chaque intitulé
  }

  // Ajoute les headers, les index et les réponses au Google Sheets cible
  targetSheet.getRange(3, 1, headersToIndex.length, 1).setValues(headersToIndex);
  targetSheet.getRange(3, 2, headers[0].length, 1).setValues(convertRowToColumn(headers[0]));
  targetSheet.getRange(3, 3, lastRowValues[0].length, 1).setValues(convertRowToColumn(lastRowValues[0]));

  var questionDossier = "Coche les dossiers que tu souhaites avoir dans ton projet :";
  var questionFormat = "Quel format de fichier souhaites tu avoir pour la fiche de renseignement ?";

  var headers2 = duplicateArrayElement(headers[0], questionDossier, 3);
  var headers2 = duplicateArrayElement(headers2, questionFormat, 2);

  var headersToIndex2 = duplicateArrayEntry(headersToIndex, [dictItems[questionDossier]], 3);
  var headersToIndex2 = duplicateArrayEntry(headersToIndex, [dictItems[questionFormat]], 2);

  var targetSheetName2 = CONFIG_SHEET_NAME;
  var targetSheet2 = targetSpreadsheet.getSheetByName(targetSheetName2); // Obtient la feuille par son nom

  targetSheet2.getRange(3, 1, headersToIndex2.length, 1).setValues(headersToIndex2);
  targetSheet2.getRange(3, 2, headers2.length, 1).setValues(convertRowToColumn(headers2));

  updateDataValidationForNewEntry();
}

function onFormConfigSubmit() {
  // L'ID de ton Google Sheets où les réponses sont enregistrées
  var responseSpreadsheetId = PROJECT_SPREAD_SHEET_ID;
  var responseSpreadsheet = SpreadsheetApp.openById(responseSpreadsheetId);

  var responseSheetName = RESPONSE_CONFIG_SHEET_NAME;
  var responseSheet = responseSpreadsheet.getSheetByName(responseSheetName); // Obtient la feuille par son nom


  // Obtient la première ligne (headers) et la dernière ligne avec des données (réponses)
  var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues();
  var lastRow = responseSheet.getLastRow();
  var lastRowValues = responseSheet.getRange(lastRow, 1, 1, responseSheet.getLastColumn()).getValues();
  buildPrefilledFormUrl(lastRowValues[0][1]);

}
