import { parseJSON } from "./helpers.js";

class ConfigParser {
  constructor(defaults) {
    this._defaults = defaults;
    this._logsPath = defaults.logsPath;
  }

  /**
   * Parses user config, before argv is processed. Initial defaults are stored
   * specified in help/index.js, and are passed to the ConfigParser constructor.
   * These are overwritten with user specified config files.
   *
   * Arguments from the command line are applied further along in bin/index.js.
   *
   * @returns { object } an object containing user configuration.
   */
  parseConfig() {
    const userDefaults = parseJSON(this._defaults.defaultsFile);
    const configFile = userDefaults.configFile || this._defaults.configFile;
    return { ...this._defaults, ...userDefaults, ...parseJSON(configFile) };
  }
}

export default ConfigParser;
