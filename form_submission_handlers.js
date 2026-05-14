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
  var spreadsheet = SpreadsheetApp.openById(PROJECT_SPREAD_SHEET_ID);
  var responseSheet = spreadsheet.getSheetByName(RESPONSE_SHEET_NAME); // Obtient la feuille par son nom

  // Obtient la première ligne (headers) et la dernière ligne avec des données (réponses)
  var headers = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
  var lastRow = responseSheet.getLastRow();
  var lastRowValues = responseSheet.getRange(lastRow, 1, 1, responseSheet.getLastColumn()).getValues()[0];

  // L'ID de ton nouveau Google Sheets où tu veux copier les réponses
  var targetSheet = spreadsheet.getSheetByName(LAST_RESPONSE_SHEET_NAME); // Obtient la feuille par son nom

  // Supposons que vous ayez déjà ces lignes en haut de votre fonction :
  var formItemTitles = listAllItemTitles();
  var orderedItemTitles = filterValuesPresentInArray(formItemTitles, headers);
  var itemIndexesByTitle = mapArrayValuesToIndexes(orderedItemTitles);
  Logger.log(orderedItemTitles);
  // Logger.log(itemIndexesByTitle)
  var headersToIndex = [];

  // Convertir les headers en leurs index respectifs en utilisant le dictionnaire
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    headersToIndex.push([itemIndexesByTitle[header]]);  // Utilisez itemIndexesByTitle pour obtenir l'index pour chaque intitulé
  }

  // Ajoute les headers, les index et les réponses au Google Sheets cible
  targetSheet.getRange(3, 1, headersToIndex.length, 1).setValues(headersToIndex);
  targetSheet.getRange(3, 2, headers.length, 1).setValues(convertRowToColumn(headers));
  targetSheet.getRange(3, 3, lastRowValues.length, 1).setValues(convertRowToColumn(lastRowValues));

  var folderQuestion = "Coche les dossiers que tu souhaites avoir dans ton projet :";
  var fileFormatQuestion = "Quel format de fichier souhaites tu avoir pour la fiche de renseignement ?";

  var duplicatedHeaders = duplicateArrayElement(headers, folderQuestion, 3);
  duplicatedHeaders = duplicateArrayElement(duplicatedHeaders, fileFormatQuestion, 2);

  var duplicatedHeaderIndexes = duplicateArrayEntry(headersToIndex, [itemIndexesByTitle[folderQuestion]], 3);
  duplicatedHeaderIndexes = duplicateArrayEntry(duplicatedHeaderIndexes, [itemIndexesByTitle[fileFormatQuestion]], 2);

  var targetConfigSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME); // Obtient la feuille par son nom

  targetConfigSheet.getRange(3, 1, duplicatedHeaderIndexes.length, 1).setValues(duplicatedHeaderIndexes);
  targetConfigSheet.getRange(3, 2, duplicatedHeaders.length, 1).setValues(convertRowToColumn(duplicatedHeaders));

  updateDataValidationForNewEntry();
}

function onFormConfigSubmit() {
  // L'ID de ton Google Sheets où les réponses sont enregistrées
  var responseSpreadsheet = SpreadsheetApp.openById(PROJECT_SPREAD_SHEET_ID);
  var responseSheet = responseSpreadsheet.getSheetByName(RESPONSE_CONFIG_SHEET_NAME); // Obtient la feuille par son nom

  // Obtient la première ligne (headers) et la dernière ligne avec des données (réponses)
  var lastRow = responseSheet.getLastRow();
  var lastRowValues = responseSheet.getRange(lastRow, 1, 1, responseSheet.getLastColumn()).getValues()[0];
  buildPrefilledFormUrl(lastRowValues[1]);

}
