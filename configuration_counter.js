var CONFIGURATION_COUNTER_PROPERTY = 'configCounter';

function resetConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(CONFIGURATION_COUNTER_PROPERTY, '0');
}

function incrementConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var currentCount = Number(scriptProperties.getProperty(CONFIGURATION_COUNTER_PROPERTY));
  currentCount++;
  scriptProperties.setProperty(CONFIGURATION_COUNTER_PROPERTY, currentCount.toString());
  return currentCount;
}

function getConfigurationCounter() {
  var scriptProperties = PropertiesService.getScriptProperties();
  return Number(scriptProperties.getProperty(CONFIGURATION_COUNTER_PROPERTY));
}
