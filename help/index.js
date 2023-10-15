import path from "path";
const userDir = process.env.HOME || process.env.USERPROFILE;
const defaultPath = path.join(userDir, ".config", "cb");

class Option {
  constructor(name, help, settings) {
    this.name = name;
    this._settings = settings;
    this._help = help;
  }

  _getDescription(command) {
    return { description: this._help[command] || this._help.default };
  }

  getDetails(command) {
    let details = this._getDescription(command);
    return { ...details, ...this._settings };
  }
}

export const options = {
  verbose: new Option(
    "verbose",
    {
      default: "Provide verbose logging.",
      list: "Include values in the printed output. When a pattern is supplied along with the -v flag, the pattern matching applies to the values of the clips, not just their keys.",
    },
    { alias: "v", default: false, type: "boolean" },
  ),

  img: new Option(
    "img",
    {
      get: "Load image from images directory to clipboard instead of text.",
      set: "Save image from clipboard to a file in images directory.",
      open: "Open the images directory instead of clips file.",
      list: "List images in image directory instead of clips in clips file.",
    },
    { alias: "i", default: false, type: "boolean" },
  ),

  editor: new Option(
    "editor",
    { default: "Editor to use when opening files for editing" },
    {
      alias: "e",
      default: process.env.EDITOR || "nano",
      type: "string",
    },
  ),

  force: new Option(
    "force",
    {
      default: "Force action",
      set: "Overwrite existing clip without prompting.",
      remove: "Remove clip without prompting.",
    },
    {
      alias: "f",
      default: false,
      type: "boolean",
    },
  ),

  config: new Option(
    "config",
    {
      default: "Run commands on config file instead of clips.",
      set: "Set a setting in the config file from the clipboard.",
      get: "Get a setting from the config file.",
      paste: "Paste a setting from the config file.",
      remove: "Remove a setting from the config file.",
      list: "List settings in config file.",
      open: "Open config file in editor.",
    },
    {
      alias: ["cfg", "c"],
      default: false,
      type: "boolean",
    },
  ),

  defaultsFile: new Option(
    "defaultsFile",
    { default: "Path to file to store user specified default settings in." },
    { default: path.join(defaultPath, "defaults.json"), type: "string" },
  ),
  configFile: new Option(
    "configFile",
    {
      default:
        "Path to file to store user specified settings. Overwrites the the default settings.",
    },
    { default: path.join(defaultPath, "settings.json"), type: "string" },
  ),
  clipsFile: new Option(
    "clipsFile",
    { default: "Path to file to store clips in." },
    { default: path.join(defaultPath, "clips.json"), type: "string" },
  ),
  imagesPath: new Option(
    "imagesPath",
    { default: "Path to directory to store images in." },
    { default: path.join(defaultPath, "images"), type: "string" },
  ),

  historyFile: new Option(
    "historyFile",
    { tracker: "Path to file where clipboard history should be stored." },
    { default: path.join(defaultPath, "history.json"), type: "string" },
  ),

  logsPath: new Option(
    "logsPath",
    { default: "Path to directory to store logs in." },
    { default: path.join(defaultPath, "logs"), type: "string" },
  ),
};
