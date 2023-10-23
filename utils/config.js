import fs from "fs";
import path from "path";
import { createHash } from "node:crypto";

import { parseJSON } from "./helpers.js";

/**
 * The `ConfigParser` class is responsible for parsing user configuration files,
 * managing their hash representations, and detecting changes in configurations
 * across different runs of the application. It helps reduce verbosity by
 * logging configurations only when there are changes.
 *
 * @class
 * @property {object} _defaults - Initial default configurations.
 * @property {string} _logsPath - Path where logs and configuration hashes are stored.
 * @property {string} _hashFilePath - Path to the file containing the last saved configuration hash.
 * @property {string} _hash - The current configuration's hash. Used for internal operations.
 *
 * @example
 * const defaults = { defaultsFile: './defaults.json', configFile: './config.json', logsPath: './logs' };
 * const parser = new ConfigParser(defaults);
 * const config = parser.parseConfig();
 * if (parser.configHasChanged(config)) {
 *   console.log('Configuration has changed!');
 * }
 */
class ConfigParser {
  constructor(defaults) {
    this._defaults = defaults;
    this._logsPath = defaults.logsPath;

    // Create directory and file to store config hash, if they don't exist.
    this._hashFilePath = path.join(this._logsPath, "configHash");
    if (!fs.existsSync(this._hashFilePath)) {
      fs.mkdirSync(this._logsPath, { recursive: true });
      fs.writeFileSync(this._hashFilePath, "");
    }
  }

  /**
   * Parses user config before argv is processed. Initial defaults are stored
   * specified in help/index.js, and are passed to the ConfigParser constructor.
   * These are overwritten with user specified config files.
   *
   * @returns { object } an object containing user configuration.
   */
  parseConfig() {
    const userDefaults = parseJSON(this._defaults.defaultsFile);
    const configFile = userDefaults.configFile || this._defaults.configFile;
    const config = {
      ...this._defaults,
      ...userDefaults,
      ...parseJSON(configFile),
    };

    return config;
  }

  /**
   * Compares current config to previous config by hash.
   *
   * @param {object} config - the current user config
   * @returns {boolean} whether the config has changed since previous execution
   */
  configHasChanged(config) {
    const prevHash = this._getPreviousHash();
    const newHash = this._computeConfigHash(config);
    this._saveHashToFile();
    return prevHash !== newHash;
  }

  /** Computes hash from config object for use when logging.
   *
   *  @param {object} config
   *  @returns {string} the configuration hash
   */
  _computeConfigHash(config) {
    this._hash = createHash("md5").update(JSON.stringify(config)).digest("hex");
    return this._hash;
  }

  _saveHashToFile() {
    fs.writeFileSync(this._hashFilePath, this._hash);
  }

  _getPreviousHash() {
    if (fs.existsSync(this._hashFilePath)) {
      return fs.readFileSync(this._hashFilePath, "utf-8");
    }
    return null;
  }
}

export default ConfigParser;
