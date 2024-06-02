import path from "path";
import { Options } from "yargs";

const userDir = process.env.HOME || process.env.USERPROFILE;
if (!userDir) {
  console.error(
    "Error: User directory not found. Please ensure that the HOME (Unix-like systems) or USERPROFILE (Windows) environment variable is set."
  );
  process.exit(1);
}

const defaultPath = path.join(userDir, ".config", "cb");

class OptionGenerator {
  private name: string;
  private settings;
  private help: CommandDescriptions;

  constructor(name: Option, help: CommandDescriptions, settings: Options) {
    this.name = name;
    this.settings = settings;
    this.help = help;
  }

  _getDescription(command: BasicCommand | "default") {
    return { description: this.help[command] || this.help.default };
  }

  getDetails(command: BasicCommand | "default") {
    let details = this._getDescription(command);
    return { ...details, ...this.settings };
  }
}

export const options = {
  quiet: new OptionGenerator(
    "quiet",
    {
      default: "Supress logging.",
      remove:
        "Prevent logging of success, unless the verbose flag is also set.",
    },
    { alias: "q", default: false, boolean: true }
  ),

  verbose: new OptionGenerator(
    "verbose",
    {
      default: "Provide verbose logging.",
      list: "Include values in the printed output. When a pattern is supplied along with the -v flag, the pattern matching applies to the values of the clips, not just their keys.",
    },
    { alias: "v", default: false, boolean: true }
  ),

  img: new OptionGenerator(
    "img",
    {
      default: "Run command on image files instead of text clips.",
      get: "Load image from images directory to clipboard instead of text.",
      set: "Save image from clipboard to a file in images directory.",
      open: "Open the images directory instead of clips file.",
      list: "List images in image directory instead of clips in clips file.",
    },
    { alias: "i", default: false, boolean: true }
  ),

  editor: new OptionGenerator(
    "editor",
    { default: "Editor to use when opening files for editing" },
    {
      alias: "e",
      default: process.env.EDITOR || "nano",
      type: "string",
    }
  ),

  force: new OptionGenerator(
    "force",
    {
      default: "Force action",
      set: "Overwrite existing clip without prompting.",
      remove: "Remove clip without prompting.",
    },
    {
      alias: "f",
      default: false,
      boolean: true,
    }
  ),

  config: new OptionGenerator(
    "config",
    {
      default: "Run commands on config file instead of clips.",
      set: "Set a setting in the config file from the clipboard.",
      get: "Get a setting from the config file.",
      remove: "Remove a setting from the config file.",
      list: "List settings in config file.",
      open: "Open config file in editor.",
    },
    {
      alias: ["cfg", "c"],
      default: false,
      boolean: true,
    }
  ),

  defaultsFile: new OptionGenerator(
    "defaultsFile",
    { default: "Path to file to store user specified default settings in." },
    { default: path.join(defaultPath, "defaults.json"), type: "string" }
  ),
  configFile: new OptionGenerator(
    "configFile",
    {
      default:
        "Path to file to store user specified settings. Overwrites the the default settings.",
    },
    { default: path.join(defaultPath, "settings.json"), type: "string" }
  ),
  clipsFile: new OptionGenerator(
    "clipsFile",
    { default: "Path to file to store clips in." },
    { default: path.join(defaultPath, "clips.json"), type: "string" }
  ),
  imagesPath: new OptionGenerator(
    "imagesPath",
    { default: "Path to directory to store images in." },
    { default: path.join(defaultPath, "images"), type: "string" }
  ),

  historyFile: new OptionGenerator(
    "historyFile",
    { default: "Path to file where clipboard history should be stored." },
    { default: path.join(defaultPath, "history.json"), type: "string" }
  ),

  logsPath: new OptionGenerator(
    "logsPath",
    { default: "Path to directory to store logs in." },
    { default: path.join(defaultPath, "logs"), type: "string" }
  ),
};
