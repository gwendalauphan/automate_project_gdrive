function getItemIdByNameInFolder(fileName, folderId, mimeType,isFolder) {
    
    if(!folderId) {
        Logger.log("folderId:",folderId)
        throw new Error("The provided folderId is not valid.");
    }
    
    var folder = DriveApp.getFolderById(folderId);
    return searchInFolderAndSubFolders(fileName, folder, mimeType,isFolder);
}

function searchInFolderAndSubFolders(name, folder, mimeType, isFolder) {
    var searchQuery = 'title="' + name + '"';
    if (mimeType) {
        searchQuery += ' and mimeType="' + mimeType + '"';
    }

    var items;
    if (isFolder) {
        items = folder.getFoldersByName(name); // cherche les dossiers si isFolder est vrai
    } else {
        items = folder.searchFiles(searchQuery); // cherche les fichiers sinon
    }
    
    while (items.hasNext()) {
        return items.next().getId();
    }

    // Si l'item (fichier ou dossier) n'est pas trouvé dans le dossier actuel, recherchez dans les sous-dossiers.
    var subFolders = folder.getFolders();
    while (subFolders.hasNext()) {
        var subFolder = subFolders.next();
        var itemId = searchInFolderAndSubFolders(name, subFolder, mimeType, isFolder);
        if (itemId) {
            return itemId;
        }
    }

    return null;  // Renvoie null si l'item n'est pas trouvé
}