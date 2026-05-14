//--------Variables du projet--------------//

var PROJECT_SPREAD_SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
var PROJECT_FOLDER_ID = getFolderIdOfFile(PROJECT_SPREAD_SHEET_ID);

var RESPONSE_SHEET_NAME = 'Réponses au formulaire';
var DATA_SHEET_NAME = 'Données';
var RESPONSE_CONFIG_SHEET_NAME = 'Réponses au formulaire Configurations';
var LAST_RESPONSE_SHEET_NAME = 'Dernier questionnaire';
var CONFIG_SHEET_NAME = 'Configurations';
var VALIDATION_SHEET_NAME = 'Validation';

var PROJECT_GOOGLE_FORM_NAME = 'Questionnaire - Création de projet'

//--------Variables du template---------------------------------//

var TEMPLATE_PROJECT_FOLDER_NAME = "template";
var TEMPLATE_PROJECT_FOLDER_ID = findItemIdByNameInFolder("template", PROJECT_FOLDER_ID, null, true);

var TEMPLATE_FICHE_RENSEIGNEMENT_NAME = "Fiche de Renseignement"

