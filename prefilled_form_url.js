function buildPrefilledFormUrl(configName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var dataOutputSheet = spreadsheet.getSheetByName(DATA_SHEET_NAME); 
  
  // Sélectionne la feuille contenant les ID de champ et les valeurs
  var configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
  
  // Recherche de la colonne correspondant au nom de configuration
  var configNames = configSheet.getRange(2, 1, 1, configSheet.getLastColumn()).getValues()[0];
  var configColumnIndex = configNames.indexOf(configName);
  if (configColumnIndex === -1) {
    throw new Error("Nom de configuration non trouvé.");
  }

  // +1 pour obtenir la colonne des checkboxes (colonne à droite de la valeur trouvée)
  var checkboxColumnIndex = configColumnIndex + 1;
  
  // Récupération des données nécessaires
  var configRange = configSheet.getRange(3, 1, configSheet.getLastRow() - 2, configSheet.getLastColumn());
  var configValues = configRange.getValues();
  
  Logger.log(configValues);

  var baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd-mL0aeJtWNwQVb8t_B2ubKm1OsOawcAO3ikD9Y5pjvb7Pcw/viewform?usp=pp_url";
  
  var fieldIdsByIndex = extractFormFieldIdsFromUrl();
  Logger.log(fieldIdsByIndex);
  for (var index in fieldIdsByIndex) {
    var fieldId = fieldIdsByIndex[index];
    // Trouver la ligne correspondante dans la colonne A
    var matchedRows = [];  // Tableau pour stocker les indices de lignes correspondantes
    var targetIndex = parseInt(index, 10);

    for (var i = 0; i < configValues.length; i++) {
      if (parseInt(configValues[i][0], 10) === targetIndex) {
        matchedRows.push(i);
        Logger.log(index + " " + fieldId + " " + i);
      }
    }

    for (var j = 0; j < matchedRows.length; j++) {
      var rowIndex = matchedRows[j];
      var defaultValue = configValues[rowIndex][configColumnIndex];
      var isCheckboxChecked = configValues[rowIndex][checkboxColumnIndex] === true;
      Logger.log(defaultValue + ":" + isCheckboxChecked);
      if (isCheckboxChecked) {
        baseUrl += "&entry." + fieldId + "=" + encodeURIComponent(defaultValue);
      }
    }
  }
  baseUrl = baseUrl.replace(/%20/g, "+");
  Logger.log(baseUrl);
  
  var cell = dataOutputSheet.getRange("B7");
  cell.setValue(baseUrl);
}
