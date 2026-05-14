function resetConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('configCounter', '0');
}

function incrementConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var currentCount = Number(scriptProperties.getProperty('configCounter'));
  currentCount++;
  scriptProperties.setProperty('configCounter', currentCount.toString());
  return currentCount;
}

function getConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return Number(scriptProperties.getProperty('configCounter'));
}
