# NodeJs Voice Command<br>
<br>
Modified from the NodejsStarter.<br>

## Requirements
<p>
Tested to work with Nodejs v6.1.0 
The server computer hosts the files and contains the scripts that will be run. 
Has not been tested, but should work with phones that have chrome. 
</p>
## Usage Example
<pre>
Instructions to run:
	Server computer needs to install NodeJs: https://nodejs.org/en/
	Client computers need a recent version of Chrome: https://www.google.com/chrome/
	Download this repo.
	Open command prompt and navigate to containing folder.
		You should be able to see the following
			node_modules
			public
			src
			package.json
			README.md
			server.js
	Start the server with node: "node server.js"
		If the files have not been modified debug output will show.
		There should be a line stating that the server is running and which port it is listening to.
		Default port should be 10001
	Once the server is online, clients should be able to connect with Chrome.
		Navgiate to: ipaddress:10001
		You should see a page that has:
			Start/Stop button
			Final Div outlined in green
			Interim Div oulined in Red
			A log area.
	Click on the Start/Stop button.
		A prompt will ask to allow usage of microphone.
			Allow it, otherwise it won't work
			Microphone is needed
		The outlined green and red area, should change to "Starting..."
	Speak clearly to issue commands.
		The red outline represents the current guess at what was spoken.
		When it chagnes to the green ouline, that is what the system decides upon.
		If connected to the server, the green outlined words will be sent.
		Currently this comes with three commands:
			Hello Computer
			Computer Start Note
			Computer Start Calculator
	After each command is send the log will show server responses.
</pre>

## Editing Commands
<pre>
To add, remove, change commands open the commands.json file located in the src folder.
The format must be maintained.
An array containing an object of string, array of strings, string
[
	{
		commandName: "Hello",
		commandWords: ["computer", "hello" ],
		scriptPath: "./src/exampleScripts/hello.bat"
	},
	{
		...
	},
	...
]

commandName is used to describe the command.
commandWords <bold>MUST</bold> be an array of 1 word strings.
	Each word is a requirements to be spoken for the script to activate.
scriptPath is the full path or relative path (from the location of server.js) of the script to activate.
 
</pre>
<br>
<br>
