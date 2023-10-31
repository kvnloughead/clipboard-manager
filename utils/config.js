import fs from "fs";
import path from "path";
import { createHash } from "node:crypto";

import { parseJSON } from "./helpers.js";

/**
 * The `ConfigParser` class is responsible for parsing user configuration files,
 * managing their hash representations, and detecting changes in configurations
 * across different runs of the application. It helps reduce verbosity by
 * logging configurations only when there are changes, or after a given period * of time elapses.
 *
 * @class
 * @property {object} _defaults - Initial default configurations.
 * @property {string} _logsPath - Path where logs and configuration hashes are stored.
 * @property {string} _hashFilePath - Path to the file containing the last saved configuration hash.
 * @property {string} _hash - The current configuration's hash. Used for internal operations.
 *
}
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
   * Returns the last log time from a file.
   * @returns {number|null} the last log time, or null
   */
  _getLastLogTime() {
    const lastLogFilePath = path.join(this._logsPath, "lastLogTime");
    try {
      const lastLogTime = fs.readFileSync(lastLogFilePath, "utf-8");
      return parseInt(lastLogTime, 10);
    } catch (error) {
      return null;
    }
  }

  /**
   * Writes the last log time to a file.
   * @param {date} time the time to set as the last log time
   */
  _setLastLogTime(time) {
    const lastLogFilePath = path.join(this._logsPath, "lastLogTime");
    fs.writeFileSync(lastLogFilePath, time.toString());
  }

  /**
   * Determines whether an interval has passed since the config was last logged
   * and returns an appropriate message if so.
   *
   * @param {object} config the config object to be logged
   * @param {number} interval the time to elapse between logging. Defaults to 12 hours.
   * @returns {object|null} an appropriate message to log, or null
   */
  intervalHasElapsed(config, interval = 12 * 60 * 60) {
    const lastLogTime = this._getLastLogTime();
    const currentTime = Date.now();

    if (lastLogTime === null || currentTime - lastLogTime > interval) {
      this._setLastLogTime(currentTime);
      return {
        message: `Current user configuration (excluding argv):\n${JSON.stringify(
          config,
        )}`,
      };
    }
    return null;
  }

  /**
   * Parses user config before argv is processed. Initial defaults are stored
   * specified in help/index.js, and are passed to the ConfigParser constructor.
   * These are overwritten with user specified config files.
   *
   * @returns {object} an object containing user configuration
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
   * Compares current config to previous config by hash. If the config has changed, returns an appropriate message to log.
   *
   * @param {object} config the config object to be logged
   * @param {number} interval the time to elapse between logging. Defaults to 12 hours.
   * @returns {object|null} an appropriate message to log, or null
   */
  configHasChanged(config) {
    const prevHash = this._getPreviousHash();
    const newHash = this._computeConfigHash(config);
    this._saveHashToFile();
    if (prevHash !== newHash) {
      this._setLastLogTime(Date.now());
      return {
        message: `Config has changed. Current config (excluding argv):\n${JSON.stringify(
          config,
        )}`,
      };
    }
    return null;
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
