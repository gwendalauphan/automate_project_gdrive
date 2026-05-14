function deleteConfigurationColumns(column) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Identifier la colonne du bouton cliqué
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Confirmez', 'Voulez-vous vraiment supprimer cette configuration ?', ui.ButtonSet.YES_NO);
  
  if(response == ui.Button.YES) {    
    // Supprimer les trois colonnes associées à la configuration
    sheet.deleteColumns(column, 3);

    // Parcourez les colonnes restantes et décochez toutes les checkboxes
    var lastCol = sheet.getLastColumn();
    for(var col = column + 2; col <= lastCol; col+=3) {
      var checkBox = sheet.getRange(1, col);
      if (checkBox.getValue() === true) {
        checkBox.setValue(false);
      }
    }
  }
  else if(response == ui.Button.NO){
    var checkBox = sheet.getRange(1, column +1);
    checkBox.setValue(false);
  }
}
