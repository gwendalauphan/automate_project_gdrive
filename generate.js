function generateProjectStructure() {
  
  /*
  |-- 1 ----- CHARGEMENT DES DONNEES DE LA PAGE DE "DERNIERES REPONSES" ------
  */

  // Ouvrez le fichier Sheets et obtenez les données
  var SourceSpreadsheetId = PROJECT_SPREAD_SHEET_ID;
  var SourceSpreadsheet = SpreadsheetApp.openById(SourceSpreadsheetId);

  var SourceSheetName = LAST_RESPONSE_SHEET_NAME;
  var sheet = SourceSpreadsheet.getSheetByName(SourceSheetName); // Obtient la feuille par son nom

  var ValidationSheetName = VALIDATION_SHEET_NAME;
  var sheetValidation = SourceSpreadsheet.getSheetByName(ValidationSheetName); // Obtient la feuille par son nom

  // Obtenir les données des variables et des valeurs
  var dataVariables = sheet.getRange('D3:D29').getValues(); // Ceci obtient les variables
  var dataValeurs = sheet.getRange('C3:C29').getValues(); // Ceci obtient les valeurs
  Logger.log(dataVariables)

  var dictAnswers = {};

  for (var i = 0; i < dataVariables.length; i++) {
    dictAnswers[dataVariables[i][0]] = dataValeurs[i][0];
  }



  /*
  |-- 2 ----- INITIALISATION DES VARIABLES DE LA CREATION DU PROJET ------
  */

  var Nom_projet = dictAnswers["Nom_projet"];    // Nom de projet
  
  var Dossiers = dictAnswers["Dossiers"];        // Dossiers à créer
  var ListeDossiers = Dossiers.split(",");
  var ListeDossiersName = extractElementsFolders(ListeDossiers);

  var CheminCreation = transformPathString(dictAnswers["Chemin"]);   // Lieux de création du projet

  var Format = dictAnswers["Format"];     // Format du fichier de fiche de renseignement
  var ListeFormat = Format.split(",");

  dictAnswers["Chemin"] = CheminCreation;  // Modification des valeurs du dictionnaire
  dictAnswers["Dossiers"] = ListeDossiers;
  dictAnswers["Format"] = ListeFormat;

  Logger.log("Nom du projet:" + Nom_projet);
  Logger.log(CheminCreation);

  
  //------Configuration du chemin de création du projet--------//
  var creationFolder = getFolderByPath(CheminCreation);
  
  // Vérification de l'ID
  try {
      var creationFolderId = DriveApp.getFolderById(creationFolder); // Tente de récupérer le dossier avec l'ID
  } catch (e) {
      throw new Error("Veuillez fournir un nom de chemin correct en partant de la racine (par exemple : 'Mon Drive'), ou renseignez le dossier de création par son ID directement.");
  }



  /*
  |-- 3 ----- CREATION DES DOSSIERS, SOUS-DOSSIERS, FICHIERS ET RACCOURCIS DU PROJET ------
  */

  // 1. Création du dossier <NomProjet>
  var rootFolder = creationFolderId.createFolder(Nom_projet);
  
  // 2. Création du dossier "Ressources" à l'intérieur de <Nom_Projet>
  var resourcesFolder = rootFolder.createFolder("Ressources");
  
  // 3. Création du dossier "Aide" à l'intérieur de "Ressources"
  var aideFolder = resourcesFolder.createFolder("Aide");
  
  // 4. Copie du fichier "Aide Fiche de renseignement" dans le dossier "Aide"
  var aideFicheId = getItemIdByNameInFolder("Aide " + TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, null, false);
  var aideFicheFile = DriveApp.getFileById(aideFicheId);
  var copyAideFicheFile =aideFicheFile.makeCopy("Aide " + TEMPLATE_FICHE_RENSEIGNEMENT_NAME,aideFolder);
  
  // 5. Création du raccourci du fichier "Aide de Fiche de renseignement" dans le dossier "Ressources"
  createShortcut(copyAideFicheFile, resourcesFolder);

  // -----------------------------------------------------------------------------------------------------------------------------//
  // 6. Copie du fichier "Fiche de renseignement" dans le dossier le dossier "Ressources" et renommage en "Fiche de renseignement"
  // Application de 6. aux formats [docs, sheets, slides]

  var ficheRenseignementIdSheet = getItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SHEETS, false);
  var ficheRenseignementIdSheetCopy = copyFilebyId(ficheRenseignementIdSheet,TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);

  // Source range
  var sourceRange = sheetValidation.getRange("A1:L22");

  // Récupération des valeurs et de la mise en forme
  var Renseignements = sourceRange.getValues();
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
  var targetSpreadsheet = SpreadsheetApp.openById(ficheRenseignementIdSheetCopy.getId());
  var targetSheet = targetSpreadsheet.getActiveSheet();
  var targetRange = targetSheet.getRange("A1:L22");

  // Copie des valeurs et de la mise en forme dans la feuille cible
  targetRange.setValues(Renseignements);
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
      var targetEndRow = targetStartRow + mergedRange.getNumRows() - 1;
      var targetEndCol = targetStartCol + mergedRange.getNumColumns() - 1;
      targetSheet.getRange(targetStartRow, targetStartCol, mergedRange.getNumRows(), mergedRange.getNumColumns()).merge();
  }


  if (ListeFormat.includes("excel")) {
    createShortcut(ficheRenseignementIdSheetCopy, rootFolder);
  }

  var ficheRenseignementIdDocx = getItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_DOCS, false);
  var ficheRenseignementIdDocxCopy = copyFilebyId(ficheRenseignementIdDocx,TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);
  Logger.log("Id fiche:" + ficheRenseignementIdDocxCopy.getId());
  if (ListeFormat.includes("docx")) {
    createShortcut(ficheRenseignementIdDocxCopy, rootFolder);
  }

  var ficheRenseignementIdSlides = getItemIdByNameInFolder(TEMPLATE_FICHE_RENSEIGNEMENT_NAME, TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SLIDES, false);
  var ficheRenseignementIdSlidesCopy = copyFilebyId(ficheRenseignementIdSlides,TEMPLATE_FICHE_RENSEIGNEMENT_NAME, resourcesFolder);
  if (ListeFormat.includes("slides")) {
    createShortcut(ficheRenseignementIdSlidesCopy, rootFolder);
  }
  
  // 7. Remplissage de la fiche de renseignement docx
  remplirVariablesDocx(dictAnswers,ficheRenseignementIdDocxCopy.getId())
  

  // 8. Création des dossiers supplémentaires enregistrés dans "ListeFormat"
  if (ListeDossiersName.includes("Aucun")){
    Logger.log("Aucun dossier créé")
  }
  else{
    // 7. Pour chaque <NomdeDossier> dans <ListeDossier>:
    for (var i = 0; i < ListeDossiersName.length; i++) {
      var NomdeDossier = ListeDossiersName[i];
      
      // 8. Répéter étape 5
      var dossierFolder = rootFolder.createFolder(NomdeDossier);

      // 9. Répéter étape 4
      var aideDossierId = getItemIdByNameInFolder("Aide " + NomdeDossier, TEMPLATE_PROJECT_FOLDER_ID, null, false);
      var aideDossierFile = DriveApp.getFileById(aideDossierId);
      var copyAideDossierFile = aideDossierFile.makeCopy("Aide " + NomdeDossier,aideFolder);
      
      createShortcut(copyAideDossierFile, dossierFolder);

      if (NomdeDossier === "Liens Utiles"){
        var LiensUtilesId = getItemIdByNameInFolder("Liens Utiles",TEMPLATE_PROJECT_FOLDER_ID, MimeType.GOOGLE_SHEETS, false);
        var LiensUtilesFile = DriveApp.getFileById(LiensUtilesId);
        var copyLiensUtiles = LiensUtilesFile.makeCopy("Liens Utiles",dossierFolder);
        createShortcut(copyLiensUtiles, rootFolder);
      }
      
      
    }
  }


  // 9. Ajout à Suivi de projet (si Enregistrement == oui)
  if (dictAnswers["Enregistrement"] === "Oui"){
    Logger.log("Ajout à suivi de projet")
  }
  
  /*
  // 9. Ajout de l'historique (si Historique == oui)
  if (dictAnswers["Historique"] === "Oui"){
    Logger.log("Ajout de l'historique")
  }
  */

}
