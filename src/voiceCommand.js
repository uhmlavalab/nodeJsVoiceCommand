"use strict";

/*
To deal with voice commands in a simple manner this file will:
1. Read a description file representing available commands and the script they activate
2. Store values in an array of objects.
	Each object contains command pieces to look for and script path to activate.
	{
		commandName: "",  // identifier
		commandWords: [], // array of 1 token strings
		scriptPath: "",   // path to script file to activate under matching conditions. 
	}
3. This can be further edited later.

*/

// Required dependencies.
var fs           = require("fs");
var json5        = require("json5");
// Vars for this file
var cmdFilePath  = "./src/commands.json";
var cmdData      = null;

function initialize() {
	cmdData = json5.parse(fs.readFileSync(cmdFilePath, "utf8"));
}

function handleCommandString(fullSpokenCommand) {
	var currentCommand;
	var fullWordMatch;
	var anyCommandMatch = false;

	// Go through each command
	for (var i = 0; i < cmdData.length; i++) {
		currentCommand = cmdData[i];
		fullWordMatch = true;
		// Check the current command's word list against spoken words.
		for (var j = 0; j < currentCommand.commandWords.length; j++) {
			if (fullSpokenCommand.indexOf(currentCommand.commandWords[j].toUpperCase()) === -1) {
				fullWordMatch = false;
				break;
			}
		}
		// If this command has a full word match, then activate
		if (fullWordMatch === true) {
			var retInfo = {};
			retInfo.path = currentCommand.scriptPath;
			retInfo.commandName = currentCommand.commandName;
			return retInfo; // Only activate one command. Up to use to make unique checks.
		}
	}
	// If none of the commands match, notify
	if (anyCommandMatch === false) {
		return false;
	}
}

// These lines are necessay to allow access and usage outside of this file.
exports.initialize = initialize;
exports.handleCommandString = handleCommandString;
