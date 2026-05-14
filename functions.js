function getFolderIdOfFile(fileId) {
  var folders = DriveApp.getFileById(fileId).getParents();
  if (folders.hasNext()) {
    return folders.next().getId();
  }
  return null; // Renvoie null si le fichier n'a pas de parent (ce qui est rare).
}

function convertRowToColumn(rowData) {
  var columnData = [];
  for (var i = 0; i < rowData.length; i++) {
    columnData.push([rowData[i]]);
  }
  return columnData;
}

function createShortcut(targetFile, parentFolder) {
  var shortcutResource = {
    title: targetFile.getName(),
    mimeType: 'application/vnd.google-apps.shortcut',
    parents: [{id: parentFolder.getId()}],
    shortcutDetails: {
      targetId: targetFile.getId()
    }
  };

  Drive.Files.insert(shortcutResource);
}

function copyFilebyId(fileId, copyName, targetFolder) {
  var file = DriveApp.getFileById(fileId);
  return file.makeCopy(copyName, targetFolder);
}

function extractElementsFolders(elements) {
  var extractedElements = [];

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i].trim(); // Retire les espaces en trop
    var bracketIndex = element.indexOf("("); // Trouve l'index de la première parenthèse ouvrante
    if (bracketIndex !== -1) {
      element = element.substring(0, bracketIndex).trim(); // Extrait la partie avant la parenthèse
    }
    extractedElements.push(element);
  }

  return extractedElements;
}

function transformPathString(str) {
    // Utilisation d'une expression régulière pour trouver et extraire le contenu entre parenthèses
    var matched = str.match(/\((.*?)\)/);
    if (matched && matched[1]) {
        return matched[1];
    }
    return str; // Renvoie la chaîne originale si aucun contenu entre parenthèses n'est trouvé
}

function getFolderByPath(path) {
  var parts = path.split('/');
  parts = parts.filter(function(part) {
      return part.trim() !== ''; // Filtrer les éléments vides ou ne contenant que des espaces
  });
    
  // Obtenez le premier élément du chemin qui devrait être le nom du Shared Drive
  var driveName = parts[0];
  var matchingDriveCount = 0;
  var currentFolder;

  // Si le chemin commence par "Mon Drive", commencez par le dossier racine  
  if (driveName === "Mon Drive") {
    currentFolder = DriveApp.getRootFolder();
    matchingDriveCount++;
  }
  //Sinon on essaye les drives partagés
  else {
    var drives = Drive.Drives.list();
    var driveId = null;

    for (var i = 0; i < drives.items.length; i++) {
      if (drives.items[i].name == driveName) {
        matchingDriveCount++;
        driveId = drives.items[i].id;
        if (matchingDriveCount > 1) {
          throw new Error("Plusieurs dossiers partagés avec le nom '" + driveName + "' ont été trouvés. Veuillez spécifier l'ID du dossier ou changer le nom du dossier pour éviter les ambiguïtés.");
        }
      }
    }

    if (matchingDriveCount == 1) {
      currentFolder = DriveApp.getFolderById(driveId);
    }
  }

  if (matchingDriveCount == 0) {
    throw new Error("Aucun Drive trouvé y compris les Drives partagés.");
  }

  parts.shift();  // Enlevez le Drive root de la liste

  Logger.log(currentFolder);
  var pathDrive = currentFolder.getName();
  for (var i = 0; i < parts.length; i++) {
    var nextFolders = currentFolder.getFoldersByName(parts[i]);
    var folderCount = 0;
    var tempFolder;
    Logger.log(nextFolders);

    // Compte le nombre de dossiers correspondant au nom donné
    while (nextFolders.hasNext()) {
      folderCount++;
      tempFolder = nextFolders.next();

      Logger.log("Tentatives: " + tempFolder);
      if (folderCount > 1) {
        throw new Error("Plusieurs dossiers avec le nom '" + parts[i] + "' ont été trouvés à l'intérieur du dossier '" + pathDrive + "'. Veuillez changer le nom du dossier pour éviter les ambiguïtés ou spécifier un chemin différent.");
      }
    }
    Logger.log(folderCount);
    // Si le sous-dossier existe, utilisez-le, sinon créez-le
    if (folderCount === 1) {
      currentFolder = tempFolder;
    } else {
      currentFolder = currentFolder.createFolder(parts[i]);
    }
    pathDrive = pathDrive + '/'+ currentFolder.getName();
  }
  
  return currentFolder.getId();
}

function duplicateElement(array, element, count) {
  var index = array.indexOf(element);
  if (index !== -1) {
    var toInsert = Array(count).fill(element);
    array.splice(index + 1, 0, ...toInsert);
  }
  return array;
}

function duplicateSubArray(array, subElement, count) {
  var index = -1;
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i]) && array[i][0] === subElement[0]) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    var toInsert = Array(count).fill(null).map(() => [...subElement]);
    array.splice(index + 1, 0, ...toInsert);
  }
  return array;
}

function insertCellImage(sheet,range, imageUrl, altTitle = "", altDescription = "") {

 let image = SpreadsheetApp
                 .newCellImage()
                 .setSourceUrl(imageUrl)
                 .setAltTextTitle(altTitle)
                 .setAltTextDescription(altDescription)
                 .build();
  range.setValue(image);

}
