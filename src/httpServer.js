
'use strict';

//node basic
var url 	= require('url');
var fs 		= require('fs');
//npm required
var mime 	= require('mime');
//
var utils 	= require('./utils');


/*
Create a server given public directory.
*/
function HttpServer(publicDirectory) {
	this.publicDirectory = publicDirectory;
	this.onrequest = this.onreq.bind(this); //not sure why/what this is for
}

/*
Process http requests.
@param req is the request packet
@param res is the response stream. I think.

Currently only handles GET requests.
*/
HttpServer.prototype.onreq = function(req, res) {

	if (req.method === "GET") {
		var reqURL = url.parse(req.url); //parse url into a json object with parts as fields
		var getName = decodeURIComponent(reqURL.pathname);

		utils.debugPrint("Request for:" + getName, "http");

		// redirect root path to index.html
		if (getName === "/") {
			this.redirect(res, "index.html");
			return;
		}

		//get the path with relation to server file system.
		var requestPath = this.publicDirectory + getName;
		utils.debugPrint("full request path:" + requestPath, "http");

		var stats;
		if( utils.doesFileExist(requestPath) ) {
			//get information about the requested path item. (ie: is it a folder, file, etc.)
			stats = fs.lstatSync(requestPath);
		}
		else {
			stats = null;
		}
		if(stats != null) {
			if (stats.isDirectory()) {
				this.redirect(res, getName+"/index.html"); //prevent directory snooping
				return;
			} else { //else give back the file

				var header = {};
				header["Content-Type"] = mime.lookup(requestPath);
				header["Access-Control-Allow-Headers" ] = "Range";
				header["Access-Control-Expose-Headers"] = "Accept-Ranges, Content-Encoding, Content-Length, Content-Range";

				if (req.headers.origin !== undefined) {
					header['Access-Control-Allow-Origin' ]     = req.headers.origin;
					header['Access-Control-Allow-Methods']     = "GET";
					header['Access-Control-Allow-Headers']     = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
					header['Access-Control-Allow-Credentials'] = true;
				}

				var total = stats.size;
				var stream;
				if (typeof req.headers.range !== 'undefined') {
					var range = req.headers.range;
					var parts = range.replace(/bytes=/, "").split("-");
					var partialstart = parts[0];
					var partialend   = parts[1];

					var start = parseInt(partialstart, 10);
					var end = partialend ? parseInt(partialend, 10) : total-1;
					var chunksize = (end-start)+1;

					header["Content-Range"]  = "bytes " + start + "-" + end + "/" + total;
					header["Accept-Ranges"]  = "bytes";
					header["Content-Length"] = chunksize;

					res.writeHead(206, header);

					stream = fs.createReadStream(requestPath, {start: start, end: end});
					stream.pipe(res);
				}
				else {
					header["Content-Length"] = total;
					res.writeHead(200, header);
					stream = fs.createReadStream(requestPath);
					stream.pipe(res);
				}
			} //end else must be a directory
		} //end if has stats
		else {
			// File not found: 404 HTTP error, with link to index page
			res.writeHead(404, {"Content-Type": "text/html"});
			res.write("<h1>Page path not found</h1>\n\n");
			res.end();
			return;
		}
	}//end if req.method == get
	else {
		// File not found: 404 HTTP error, with link to index page
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write("<h1>Not a get request</h1>\n\n");
		res.end();
		return;
	}

}


/**
 * Handle a HTTP redirect
 *
 * @method redirect
 * @param res {Object} response
 * @param aurl {String} destination URL
 */
HttpServer.prototype.redirect = function(res, aurl) {
	// 302 HTTP code for redirect
	res.writeHead(302, {'Location': aurl});
	res.end();
};


module.exports = HttpServer;


