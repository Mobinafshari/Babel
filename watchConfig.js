const chokidar = require("chokidar");
const path = require("path");

const configPath = path.resolve(__dirname, "tiny-babel.config.js");

function loadConfig() {
  delete require.cache[require.resolve(configPath)]; 
  return require(configPath);
}

function startWatchingConfig(onConfigChange) {
  chokidar.watch(configPath).on("change", () => {
    console.log("🔄 tiny-babel.config.js changed. Reloading...");
    const newConfig = loadConfig();
    onConfigChange(newConfig);
  });
}

module.exports = { loadConfig, startWatchingConfig };
