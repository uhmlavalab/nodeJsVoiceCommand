// ---------------------------------------------------------------------------Imports
// node built in
var http 			= require("http"); // for server
var path 			= require('path'); // for file location conversions
var spawn 			= require('child_process').spawn; // Associate the spawn function. For script running.
// npm required, defined in package.json
var WebSocketIO		= require("websocketio");
// required files located in the src folder
var httpServer   	= require("./src/httpServer");
var utils			= require("./src/utils");
var gcSetup 		= require("./src/globalsAndConstants");
var vcHandler       = require("./src/voiceCommand")

//---------------------------------------------------------------------------WebServer variables
var webVars			= {};
	webVars.port 		= 10001;
	webVars.httpServer 	= new httpServer("public");
	webVars.mainServer 	= null;
	webVars.wsioServer 	= null;
	webVars.clients 	= []; // used to contain the wsio connections

var clientData		= []; // any additional data as necessary for clients.

//---------------------------------------------------------------------------Initialiation
gcSetup.initialize(); // check the file for specific debug options.
// Load commands
vcHandler.initialize();

//---------------------------------------------------------------------------Setup requirements to run a script
var script 			= function (file) {
    output = "";
    file = path.normalize(file); // convert Unix notation to windows
    console.log('Launching script ', file);
    proc = spawn(file, []);
    proc.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            output = output + data;
    });
    proc.stderr.on('data', function (data) {
            console.log('script stderr: ' + data);
    });
    proc.on('exit', function (code) {
        console.log('child process exited with code ' + code);
    });
} //end script function

//----------------------------------------------------------------------------Start webserver
// create http listener
webVars.mainServer = http.createServer( webVars.httpServer.onrequest ).listen( webVars.port );
utils.debugPrint("Server started, listening on port:" + webVars.port, "http"); // only print if http debug is enabled.
// create websocket listener
webVars.wsioServer = new WebSocketIO.Server( { server: webVars.mainServer } );
webVars.wsioServer.onconnection(openWebSocketClient);

// At this point the basic web server is online.








//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------WebSocket(ws) related functions 
// Websocket

/*
Called whenever a connection is made.
This happens on first contact through websocket opening.
*/
function openWebSocketClient(wsio) {
	utils.debugPrint( ">Connection from: " + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")", "wsio");
	wsio.onclose(closeWebSocketClient); // On close detection call the function closeWebSocketClient
	wsio.on("addClient", wsAddClient);
}

/*
Cleanup for when a connection closes.
The necessary effects change depending on what types of services the server is for.
*/
function closeWebSocketClient(wsio) {
	utils.debugPrint( ">Disconnect" + wsio.id + " (" + wsio.clientType + " " + wsio.clientID+ ")", "wsio");
	utils.removeArrayElement(webVars.clients, wsio);
}

/*
The "addClient" packet is the first packet that the client must send in order to be recognized by this server.
@param wsio is the websocket that was used.
@param data is the sent packet, in json format.
TODO
Additional effects may be needed, again depending on the services.
*/
function wsAddClient(wsio, data) {
	utils.debugPrint("addClient packet received from:" + wsio.id, "wsio");
	webVars.clients.push(wsio); 		//Good to remember who is connected.
	setupListeners(wsio); 				//setup the other wsio packets necessary for the services.
	wsio.emit("serverAccepted", {} ); 	//generally need to confirm that the server OK"d the wsio connection
}

/*
When receiving a packet of the named type, call the function.
*/
function setupListeners(wsio) {
	wsio.on("consoleLog",				wsConsoleLog); // basic tester packet
	wsio.on("evaluateCommand", 			wsEvaluateCommand); // All command strings go through one function
} // end setupListeners

function wsConsoleLog(wsio, data) {
	utils.consolePrint(data.message); // assumes there is a message property in the packet.
	data.message = "Server confirms:" + data.message;
	wsio.emit("serverConfirm", data);
}

function wsEvaluateCommand(wsio, data) {
	utils.debugPrint("evaluateCommand packet received from:" + wsio.id, "wsio");
	utils.debugPrint("contents:" + data.message, "wsio");

	var result = vcHandler.handleCommandString(data.message);
	if (result === false) {
		wsio.emit("serverConfirm", {message:"UNKNOWN COMMAND"});
	} else {
		wsio.emit("serverConfirm", {message:("COMMAND " + result.commandName + " accepted.") })
		script(result.path);
	}
} // End wsEvaluateCommand
