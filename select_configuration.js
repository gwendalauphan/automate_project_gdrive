function generatePrefilledUrl(configName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var donneesSheet = ss.getSheetByName(DATA_SHEET_NAME); 
  
  // Sélectionne la feuille contenant les ID de champ et les valeurs
  var dataSheet = ss.getSheetByName(CONFIG_SHEET_NAME);
  
  // Recherche de la colonne correspondant au nom de configuration
  var headers = dataSheet.getRange(2, 1, 1, dataSheet.getLastColumn()).getValues()[0];
  var colIndex = headers.indexOf(configName);
  if (colIndex === -1) {
    throw new Error("Nom de configuration non trouvé.");
  }

  // +1 pour obtenir la colonne des checkboxes (colonne à droite de la valeur trouvée)
  var checkboxColIndex = colIndex + 1;
  
  // Récupération des données nécessaires
  var dataRange = dataSheet.getRange(3, 1, dataSheet.getLastRow() - 2, dataSheet.getLastColumn());
  var dataValues = dataRange.getValues();
  
  Logger.log(dataValues)

  var baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSd-mL0aeJtWNwQVb8t_B2ubKm1OsOawcAO3ikD9Y5pjvb7Pcw/viewform?usp=pp_url";
  
  var dictFieldId = extractFieldIdsFromUrl();
  Logger.log(dictFieldId);
  for (var index in dictFieldId) {
    var fieldId = dictFieldId[index];
    // Trouver la ligne correspondante dans la colonne A
    var rowIndex = -1;
    var matchedRows = [];  // Tableau pour stocker les indices de lignes correspondantes

    for (var i = 0; i < dataValues.length; i++) {
      if (parseInt(dataValues[i][0]) === parseInt(index)) {
        matchedRows.push(i);
        Logger.log(index + " " + fieldId + " " + i);
      }
    }

    for (var i = 0; i < matchedRows.length; i++) {
      var rowIndex = matchedRows[i];
      var defaultValue = dataValues[rowIndex][colIndex];
      var isCheckboxChecked = dataValues[rowIndex][checkboxColIndex] === true;
      Logger.log(defaultValue + ":" + isCheckboxChecked);
      if (isCheckboxChecked) {
        baseUrl += "&entry." + fieldId + "=" + encodeURIComponent(defaultValue);
      }
    }


  }
  baseUrl = baseUrl.replace(/%20/g, "+");
  Logger.log(baseUrl)
  
  var cell = donneesSheet.getRange("B7");
  cell.setValue(baseUrl);
}
