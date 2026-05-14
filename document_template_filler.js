function fillDocumentTemplateVariables(dictAnswers, targetDocId) {
    // Ouvrez le fichier Docs et accédez à son contenu
    var targetDoc = DocumentApp.openById(targetDocId);
    var body = targetDoc.getBody();

    // Parcourir les clés dans dictAnswers
    for (var key in dictAnswers) {
        var variable = key;
        var valeur = dictAnswers[key];

        Logger.log('Variable: ' + variable);
        Logger.log('Valeur: ' + valeur);
        
        // Vérifiez si la clé est "Dossiers" ou "Format" et formatez la valeur en conséquence
        if ((key === "Dossiers" || key === "Format") && Array.isArray(valeur)) {
            valeur = "- " + valeur.join("\n- ");
        }

        // Remplace toutes les instances de la variable dans le document par la valeur
        body.replaceText('{' + variable + '.var}', valeur);
    }
}


