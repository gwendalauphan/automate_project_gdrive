function buildAnswersByVariable(variableRows, valueRows) {
  var answersByVariable = {};

  for (var i = 0; i < variableRows.length; i++) {
    answersByVariable[variableRows[i][0]] = valueRows[i][0];
  }

  return answersByVariable;
}

function generateProjectStructure() {
  
  /*
  |-- 1 ----- CHARGEMENT DES DONNEES DE LA PAGE DE "DERNIERES REPONSES" ------
  */

  // Ouvrez le fichier Sheets et obtenez les données
  var sourceSpreadsheet = SpreadsheetApp.openById(PROJECT_SPREAD_SHEET_ID);

  var responseSheet = sourceSpreadsheet.getSheetByName(LAST_RESPONSE_SHEET_NAME); // Obtient la feuille par son nom

  var validationSheet = sourceSpreadsheet.getSheetByName(VALIDATION_SHEET_NAME); // Obtient la feuille par son nom

  // Obtenir les données des variables et des valeurs
  var answerVariables = responseSheet.getRange('D3:D29').getValues(); // Ceci obtient les variables
  var answerValues = responseSheet.getRange('C3:C29').getValues(); // Ceci obtient les valeurs
  Logger.log(answerVariables);

  var answersByVariable = buildAnswersByVariable(answerVariables, answerValues);



  /*
  |-- 2 ----- INITIALISATION DES VARIABLES DE LA CREATION DU PROJET ------
  */

  var projectName = answersByVariable["Nom_projet"];    // Nom de projet
  
  var selectedFolders = answersByVariable["Dossiers"];        // Dossiers à créer
  var selectedFolderList = selectedFolders.split(",");
  var selectedFolderNames = parseFolderNames(selectedFolderList);

  var creationPath = extractPathFromLabel(answersByVariable["Chemin"]);   // Lieux de création du projet

  var selectedFormats = answersByVariable["Format"];     // Format du fichier de fiche de renseignement
  var selectedFormatList = selectedFormats.split(",");

  answersByVariable["Chemin"] = creationPath;  // Modification des valeurs du dictionnaire
  answersByVariable["Dossiers"] = selectedFolderList;
  answersByVariable["Format"] = selectedFormatList;

  Logger.log("Nom du projet:" + projectName);
  Logger.log(creationPath);

  
  //------Configuration du chemin de création du projet--------//
  var creationFolderId = getFolderByPath(creationPath);
  
  // Vérification de l'ID
  try {
    var creationFolder = DriveApp.getFolderById(creationFolderId); // Tente de récupérer le dossier avec l'ID
  } catch (e) {
    throw new Error("Veuillez fournir un nom de chemin correct en partant de la racine (par exemple : 'Mon Drive'), ou renseignez le dossier de création par son ID directement.");
  }



  /*
  |-- 3 ----- CREATION DES DOSSIERS, SOUS-DOSSIERS, FICHIERS ET RACCOURCIS DU PROJET ------
  */

  // 1. Création du dossier <NomProjet>
  var rootFolder = creationFolder.createFolder(projectName);
  
  // 2. Création du dossier "Ressources" à l'intérieur de <NomProjet>
  var resourcesFolder = rootFolder.createFolder("Ressources");
  
  // 3. Création du dossier "Aide" à l'intérieur de "Ressources"
  var aideFolder = resourcesFolder.createFolder("Aide");
  
  // 4. Copie du fichier "Aide Fiche de renseignement" dans le dossier "Aide"
  var aideFicheId = findItemIdByNameInFolder("Aide " + TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, null, false);
  var aideFicheFile = DriveApp.getFileById(aideFicheId);
  var copyAideFicheFile =aideFicheFile.makeCopy("Aide " + TEMPLATE_FICHE_RENSEIGNEMENT_NAME,aideFolder);
  
  // 5. Création du raccourci du fichier "Aide de Fiche de renseignement" dans le dossier "Ressources"
  createShortcut(copyAideFicheFile, resourcesFolder);

  // -----------------------------------------------------------------------------------------------------------------------------//
  // 6. Copie du fichier "Fiche de renseignement" dans le dossier le dossier "Ressources" et renommage en "Fiche de renseignement"
  // Application de 6. aux formats [docs, sheets, slides]

  var infoSheetTemplateId = findItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SHEETS, false);
  var infoSheetCopy = copyFileById(infoSheetTemplateId, TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);

  // Source range
  var sourceRange = validationSheet.getRange("A1:L22");

  // Récupération des valeurs et de la mise en forme
  var validationValues = sourceRange.getValues();
  var backgrounds = sourceRange.getBackgrounds();
  var fonts = sourceRange.getFontColors();
  var fontSizes = sourceRange.getFontSizes();
  var fontLines = sourceRange.getFontLines();
  var fontWeights = sourceRange.getFontWeights();
  var fontStyles = sourceRange.getFontStyles();
  var horizontalAlignments = sourceRange.getHorizontalAlignments();
  var verticalAlignments = sourceRange.getVerticalAlignments();

  // Récupération des fusions de cellules
  var sourceMergedRanges = sourceRange.getMergedRanges();

  // Ouverture de la feuille cible
  var targetSpreadsheet = SpreadsheetApp.openById(infoSheetCopy.getId());
  var targetSheet = targetSpreadsheet.getActiveSheet();
  var targetRange = targetSheet.getRange("A1:L22");

  // Copie des valeurs et de la mise en forme dans la feuille cible
  targetRange.setValues(validationValues);
  targetRange.setBackgrounds(backgrounds);
  targetRange.setFontColors(fonts);
  targetRange.setFontSizes(fontSizes);
  targetRange.setFontLines(fontLines);
  targetRange.setFontWeights(fontWeights);
  targetRange.setFontStyles(fontStyles);
  targetRange.setHorizontalAlignments(horizontalAlignments);
  targetRange.setVerticalAlignments(verticalAlignments);

  // Copie des fusions de cellules
  for (var i = 0; i < sourceMergedRanges.length; i++) {
    var mergedRange = sourceMergedRanges[i];
    var targetStartRow = mergedRange.getRow() - sourceRange.getRow() + targetRange.getRow();
    var targetStartCol = mergedRange.getColumn() - sourceRange.getColumn() + targetRange.getColumn();
    targetSheet.getRange(targetStartRow, targetStartCol, mergedRange.getNumRows(), mergedRange.getNumColumns()).merge();
  }


  if (selectedFormatList.includes("excel")) {
    createShortcut(infoSheetCopy, rootFolder);
  }

  var infoDocTemplateId = findItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_DOCS, false);
  var infoDocCopy = copyFileById(infoDocTemplateId, TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);
  Logger.log("Id fiche:" + infoDocCopy.getId());
  if (selectedFormatList.includes("docx")) {
    createShortcut(infoDocCopy, rootFolder);
  }

  var infoSlidesTemplateId = findItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SLIDES, false);
  var infoSlidesCopy = copyFileById(infoSlidesTemplateId, TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);
  if (selectedFormatList.includes("slides")) {
    createShortcut(infoSlidesCopy, rootFolder);
  }
  
  // 7. Remplissage de la fiche de renseignement docx
  fillDocumentTemplateVariables(answersByVariable, infoDocCopy.getId());
  

  // 8. Création des dossiers supplémentaires enregistrés dans la réponse "Dossiers"
  if (selectedFolderNames.includes("Aucun")) {
    Logger.log("Aucun dossier créé");
  } else {
    // 7. Pour chaque <NomdeDossier> dans <ListeDossier>:
    for (var j = 0; j < selectedFolderNames.length; j++) {
      var folderName = selectedFolderNames[j];
      
      // 8. Répéter étape 5
      var projectSubfolder = rootFolder.createFolder(folderName);

      // 9. Répéter étape 4
      var aideDossierId = findItemIdByNameInFolder("Aide " + folderName, TEMPLATE_PROJECT_FOLDER_ID, null, false);
      var aideDossierFile = DriveApp.getFileById(aideDossierId);
      var copyAideDossierFile = aideDossierFile.makeCopy("Aide " + folderName, aideFolder);
      
      createShortcut(copyAideDossierFile, projectSubfolder);

      if (folderName === "Liens Utiles") {
        var liensUtilesId = findItemIdByNameInFolder("Liens Utiles", TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SHEETS, false);
        var liensUtilesFile = DriveApp.getFileById(liensUtilesId);
        var copyLiensUtiles = liensUtilesFile.makeCopy("Liens Utiles", projectSubfolder);
        createShortcut(copyLiensUtiles, rootFolder);
      }
    }
  }


  // 9. Ajout à Suivi de projet (si Enregistrement == oui)
  if (answersByVariable["Enregistrement"] === "Oui") {
    Logger.log("Ajout à suivi de projet");
  }
  
  /*
  // 9. Ajout de l'historique (si Historique == oui)
  if (answersByVariable["Historique"] === "Oui"){
    Logger.log("Ajout de l'historique")
  }
  */

}
