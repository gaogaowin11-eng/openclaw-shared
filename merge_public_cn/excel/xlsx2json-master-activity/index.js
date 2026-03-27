var xlsx = require('./lib/xlsx-to-json.js');
var path = require('path');
var shell = require('child_process');
var fs = require('fs');
var glob = require('glob');
var config = require('./config.json');

/**
 * all commands
 */
var commands = {
  "--help": {
    "alias": ["-h"],
    "desc": "show this help manual.",
    "action": showHelp
  },
  "--export": {
    "alias": ["-e"],
    "desc": "export excel to json. --export [files]",
    "action": exportJson,
    "default": true
  }
};

var alias_map = {}; // mapping of alias_name -> name
var parsed_cmds = []; //cmds of parsed out.

function hasGlobCharacters(segment) {
  return /[*?[\]]/.test(segment);
}

function getGlobBase(pattern) {
  if (!pattern || typeof pattern !== 'string') {
    return '.';
  }
  var normalized = path.normalize(pattern);
  while (normalized && normalized !== path.dirname(normalized) && hasGlobCharacters(path.basename(normalized))) {
    normalized = path.dirname(normalized);
  }
  if (!normalized.length) {
    return '.';
  }
  return normalized;
}

function ensureDirSync(targetPath) {
  if (!targetPath) {
    return;
  }
  if (fs.existsSync(targetPath)) {
    return;
  }
  var parentDir = path.dirname(targetPath);
  if (parentDir && parentDir !== targetPath) {
    ensureDirSync(parentDir);
  }
  fs.mkdirSync(targetPath);
}

function emptyDirectory(targetPath) {
  fs.readdirSync(targetPath).forEach(function (entry) {
    var entryPath = path.join(targetPath, entry);
    var stats = fs.lstatSync(entryPath);
    if (stats.isDirectory()) {
      emptyDirectory(entryPath);
      fs.rmdirSync(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  });
}

function prepareDestinationDirectory(destPath) {
  if (fs.existsSync(destPath)) {
    emptyDirectory(destPath);
  } else {
    ensureDirSync(destPath);
  }
}

// process.on('uncaughtException', function(err) {
//     console.log('error: ' + err);
// });

 //cache of command's key ("--help"...)
var keys = Object.keys(commands);

for (var key in commands) {
  var alias_array = commands[key].alias;
  alias_array.forEach(function (e) {
    alias_map[e] = key;
  });
}

parsed_cmds = parseCommandLine(process.argv);

// console.log("%j", parsed_cmds);

parsed_cmds.forEach(function (e) {
  exec(e);
});


/**
 * export json
 * args: --export [cmd_line_args] [.xlsx files list].
 */
function exportJson(args) {
  var destRoot = path.resolve(__dirname, config.xlsx.dest);
  var srcRoot = path.resolve(__dirname, getGlobBase(config.xlsx.src));
  prepareDestinationDirectory(destRoot);

  function processFiles(fileList) {
    if (!fileList || !fileList.length) {
      return;
    }
    fileList.forEach(function (element) {
      var absoluteSrc = path.join(__dirname, element);
      var absoluteDir = path.dirname(absoluteSrc);
      var relativeDir = path.relative(srcRoot, absoluteDir);
      if (!relativeDir || relativeDir === '.' || relativeDir.indexOf('..') === 0) {
        relativeDir = "";
      }
      var destination = relativeDir ? path.join(destRoot, relativeDir) : destRoot;
      xlsx.toJson(absoluteSrc, destination, config.xlsx.head, config.xlsx.arraySeparator);
    });
  }

  if (typeof args === 'undefined' || args.length === 0) {
    glob(config.xlsx.src, function (err, files) {
      if (err) {
        console.error("exportJson error:", err);
        throw err;
      }
      processFiles(files);
    });
  } else if (args instanceof Array) {
    processFiles(args);
  }
}

/**
 * show help
 */
function showHelp() {
  var usage = "usage: \n";
  for (var p in commands) {
    if (typeof commands[p] !== "function") {
      usage += "\t " + p + "\t " + commands[p].alias + "\t " + commands[p].desc + "\n ";
    }
  }

  usage += "\nexamples: ";
  usage += "\n\n $node index.js --export\n\tthis will export all files configed to json.";
  usage += "\n\n $node index.js --export ./excel/foo.xlsx ./excel/bar.xlsx\n\tthis will export foo and bar xlsx files.";

  console.log(usage);
}


/**************************** parse command line *********************************/

/**
 * execute a command
 */
function exec(cmd) {
  if (typeof cmd.action === "function") {
    cmd.action(cmd.args);
  }
}


/**
 * parse command line args
 */
function parseCommandLine(args) {

  var parsed_cmds = [];

  if (args.length <= 2) {
    parsed_cmds.push(defaultCommand());
  } else {

    var cli = args.slice(2);

    var pos = 0;
    var cmd;

    cli.forEach(function (element, index, array) {

      //replace alias name with real name.
      if (element.indexOf('--') === -1 && element.indexOf('-') === 0) {
        cli[index] = alias_map[element];
      }

      //parse command and args
      if (cli[index].indexOf('--') === -1) {
        cmd.args.push(cli[index]);
      } else {

        if (keys[cli[index]] == "undefined") {
          throw new Error("not support command:" + cli[index]);
        }

        pos = index;
        cmd = commands[cli[index]];
        if (typeof cmd.args == 'undefined') {
          cmd.args = [];
        }
        parsed_cmds.push(cmd);
      }
    });
  }

  return parsed_cmds;
}

/**
 * default command when no command line argas provided.
 */
function defaultCommand() {
  if (keys.length <= 0) {
    throw new Error("Error: there is no command at all!");
  }

  for (var p in commands) {
    if (commands[p]["default"]) {
      return commands[p];
    }
  }

  if (keys["--help"]) {
    return commands["--help"];
  } else {
    return commands[keys[0]];
  }
}

/*************************************************************************/
