
function getConfigurationNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName('Configurations');
  
  // Récupère la ligne contenant les noms des configurations
  var row = dataSheet.getRange(2, 4, 1, dataSheet.getLastColumn()).getValues()[0];
  
  var configNames = [];
  
  for (var i = 0; i < row.length; i += 3) { // On augmente i de 3 pour sauter 2 colonnes après chaque nom
    if (row[i]) { // Si la cellule n'est pas vide
      configNames.push(row[i]);
    }
  }
  return configNames;
}


function syncConfigurationNamesToForm() {
  var form = FormApp.openById('1hUPGwJ9iLm6ptk-ujmLxhd6Durnps1simns2AIS0sQU');

  // Supposons que vous mettiez à jour la première question du formulaire
  var item = form.getItems(FormApp.ItemType.MULTIPLE_CHOICE)[0];
  var multipleChoiceItem = item.asMultipleChoiceItem();
  
  // Récupère les options à partir de la feuille
  var options = getConfigurationNames();
  
  // Mettez à jour la question avec les nouvelles options
  multipleChoiceItem.setChoiceValues(options);
}

