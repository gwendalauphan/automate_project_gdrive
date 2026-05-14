function insertLinkToSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Validation"); // Remplacez "NomDeLaFeuille" par le nom réel de votre feuille.

  var targetSheet = spreadsheet.getSheetByName("Dernier questionnaire");

  if (targetSheet) {
    var sheetId = targetSheet.getSheetId();
    var url = spreadsheet.getUrl() + "#gid=" + sheetId;
    var cell = sheet.getRange("M16");
    cell.setValue(url);

  } else {
    SpreadsheetApp.getUi().alert("La feuille 'Dernier questionnaire' n'a pas été trouvée.");
  }
}