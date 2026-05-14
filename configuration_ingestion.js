function listAllItemTitles() {
  var configFormId = findItemIdByNameInFolder(PROJECT_GOOGLE_FORM_NAME, PROJECT_FOLDER_ID, MimeType.GOOGLE_FORMS, false);

  var form = FormApp.openById(configFormId);       // Obtient le formulaire actif
  var items = form.getItems();        // Obtient tous les éléments du formulaire
  
  var itemTitles = [];                // Crée un objet vide pour stocker les ID et les intitulés

  // Parcourez chaque élément et ajoutez son ID et son intitulé à l'objet
  for (var i = 0; i < items.length; i++) {
    //var itemIndex = items[i].getIndex();

    var itemTitle = items[i].getTitle();
    
    itemTitles.push(itemTitle);
    //Logger.log(itemIndex +itemTitle)
  }

  // Affiche l'objet dans le journal
 // Logger.log(itemsDict);

  return itemTitles;  // Renvoie l'objet avec les ID et les intitulés
}

function ingestConfiguration(sourceRowNum, configName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Étape 1 : Récupération des données de RESPONSE_SHEET_NAME
  var responseSheet = spreadsheet.getSheetByName(RESPONSE_SHEET_NAME);
  var responseHeaders = responseSheet.getRange(1, 1, 1, responseSheet.getLastColumn()).getValues()[0];
  var responseRow = responseSheet.getRange(sourceRowNum, 1, 1, responseSheet.getLastColumn()).getValues()[0];
  var answersByQuestion = {};
  for (var i = 0; i < responseHeaders.length; i++) {
    answersByQuestion[responseHeaders[i]] = responseRow[i];
  }
  
  // Étape 2 : Trouver où écrire dans CONFIG_SHEET_NAME
  var configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
  var configColumnIndex = 1; // Commencer à la colonne 3 car la colonne 1 et 2 contiennent des intitulés et ids de questions
  while (configSheet.getRange(2, configColumnIndex).getValue() !== "" || configSheet.getRange(2, configColumnIndex).getBackground() === "#000000") {
    configColumnIndex++;
  }

  // Étape 3 : Écriture des données
  var questions = configSheet.getRange(3, 2, configSheet.getLastRow() - 2, 1).getValues();
  
  configSheet.getRange(2, configColumnIndex).setValue(configName); // Écrire le nom de la configuration

  // Ajout d'une liste de questions spéciales
  var specialQuestions = [
    "Coche les dossiers que tu souhaites avoir dans ton projet :",
    "Quel format de fichier souhaites tu avoir pour la fiche de renseignement ?"
  ];

  for (var i = 0; i < questions.length; i++) {
    var question = questions[i][0];
    var answer = answersByQuestion[question];

    // Si la question est l'une des questions spéciales et la réponse contient une virgule, 
    // alors on traite chaque élément séparément
    if (specialQuestions.includes(question) && answer && answer.includes(",")) {
      var individualAnswers = answer.split(",");
      
      for (var j = 0; j < individualAnswers.length; j++) {
        // Écriture de chaque réponse individuellement
        configSheet.getRange(i + 3 + j, configColumnIndex).setValue(individualAnswers[j].trim());
      }
      
      // Ajuster le compteur i pour sauter les lignes que nous venons d'ajouter
      i += individualAnswers.length - 1;
    } else {
      if (answer !== undefined) {
        configSheet.getRange(i + 3, configColumnIndex).setValue(answer);
      }
    }
    answersByQuestion[question] = "";
  }

  configSheet.setColumnWidth(configColumnIndex, 185); // Redimensionner la colonne pour les checkbox

  // Étape 4 : Ajout des checkbox
  configSheet.getRange(2, configColumnIndex + 1).setValue("Choix"); // Écrire le nom de la configuration
  var checkboxRange = configSheet.getRange(3, configColumnIndex + 1, questions.length, 1);
  
  configSheet.setColumnWidth(configColumnIndex + 1, 40); // Redimensionner la colonne pour les checkbox
  
  // Étape 5 : Ajout de la colonne de délimitation
  configSheet.insertColumnAfter(configColumnIndex + 2);
  configSheet.getRange(1, configColumnIndex + 2, configSheet.getLastRow(), 1).setBackground("black");
  configSheet.setColumnWidth(configColumnIndex + 2, 4); // Redimensionner la colonne de délimitation

  configSheet.getRange(1, configColumnIndex).setValue("Supprimer");
  configSheet.getRange(1, configColumnIndex + 1).insertCheckboxes();


  checkboxRange.insertCheckboxes();
  createConfigurationDropdownValidation();
  return "Configuration ingérée avec succès!";
}


function createConfigurationDropdownValidation() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);
  var responsesSheet = spreadsheet.getSheetByName(RESPONSE_SHEET_NAME);
  
  // Récupérez le nombre total de lignes dans la feuille "réponses de formulaire"
  var lastRow = responsesSheet.getLastRow();

  // Créez une liste d'options basée sur les numéros de ligne
  var choices = [];
  for (var i = 2; i <= lastRow; i++) {
    choices.push("ligne " + i);
  }

  // Créez et appliquez la règle de validation des données
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(choices, true).build();
  
  var configColumnIndex = 1; // Commencer à la colonne 3 car la colonne 1 et 2 contiennent des intitulés et ids de questions
  while (configSheet.getRange(2, configColumnIndex).getValue() !== "" || configSheet.getRange(2, configColumnIndex).getBackground() === "#000000") {
    configColumnIndex++;
  }
  
  // Appliquer la règle à la cellule souhaitée
  configSheet.getRange(2, configColumnIndex).setDataValidation(rule);

}


function onDataValidationSelection(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = spreadsheet.getSheetByName(CONFIG_SHEET_NAME);

  // Récupérez la plage éditée et la valeur
  var range = e.range;
  var value = range.getValue();
  var editedRow = range.getRow();
  var editedCol = range.getColumn();

  Logger.log(editedRow);
  Logger.log(editedCol);
  Logger.log(value);

  // Check if it's the first row and the edited cell value is TRUE (checkbox is checked)
  if(editedRow === 1 && editedCol > 1 && configSheet.getRange(1, editedCol - 1).getValue() === "Supprimer" && value === true) {
    deleteConfigurationColumns(editedCol - 1); // Call the delete function with the column of the "Supprimer" text
  }

  // Vérifiez si c'est bien la liste déroulante
  else if(editedRow === 2) {
    if (value.startsWith("ligne ")) {
      var rowIndex = parseInt(value.split(" ")[1], 10);
      
      // Supprimez la liste déroulante
      range.clearDataValidations();
      range.clearContent();

      // Appeler la fonction d'ingestion
      ingestConfiguration(rowIndex, "Config "+ getConfigurationCounter() + " : ligne " + String(rowIndex));
      incrementConfigurationCounter();
    }
  }
  syncConfigurationNamesToForm();

}



