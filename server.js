var http = require('http');
var url = require('url');
var fs = require('fs');
var chat = require('./chat');

http.createServer(function(req, res){

	switch(req.url) {
		case '/':
			sendFile("index.html", res);
			break;
		case '/subscribe':
			chat.subscribe(req, res);
			break;
		case '/publish':
			var body = '';

			req
				.on('readable', function() {

					body += (req.read() || "");


					if(body.length > 1e4) {
						res.statusCode = 413;
						res.end("Your message is too big for my chat");
					}
				})
				.on('end', function() {
					try {
						body = JSON.parse(body);
					} catch(e){
						res.statusCode = 400;
						res.end("Bad Request");
						return;
					}

					chat.publish(body.message);
					res.end("OK");
				});

			break;
		default:
			res.statusCode = 404;
			res.end("Not found");
	}

}).listen(3000);


function sendFile(file, res){
	var fileStream = fs.createReadStream(file);
	fileStream
		.on('error', function() {
			res.statusCode = 500;
			res.end("server error");
		})
		.pipe(res)
		.on('close', function(){
			fileStream.destroy();
		});
}



