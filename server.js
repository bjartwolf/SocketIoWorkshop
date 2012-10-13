var app = require('http').createServer(serverHandler)
			, io = require('socket.io').listen(app)
			, fs = require('fs')
			, reservations = [{id:1, 'name':'Ola','mealId':0},
                    {id:2, 'name':'Per','mealId':1},
                    {id:3, 'name':'Eva','mealId':2},
                    {id:4, 'name':'Olga','mealId':2}];


app.listen(process.env.port || 1337);

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('cxevent', function (data) {
        socket.emit('news', { hello: 'world from cx event' });
  });
});


function serverHandler(req, res) {
	var headers ={
            'Cache-Control':'no-cache, no-store, must-revalidate',
            'Expires':'0'
        };
	
	if (req.method == 'POST') {
    	headers['Content-Type']= 'text/plain';
        var body = '';
        req.on('data', function (dataChunk) {
            body += dataChunk.toString();
        });
        req.on('end', function () {
            console.log(body);
            var data = JSON.parse(body);
            switch(req.url){
            case '/load':
            	res.writeHead(200,headers);
            	res.end(JSON.stringify(reservations));
            	break;
            case '/saveItem':
            	if(data.id){//update
            		for(var i=0; i<reservations.length; i++){
            			if(reservations[i].id==data.id){
            				reservations[i].name = data.name;
            				reservations[i].mealId = data.meal.id;
            				break;
            			}
            		}
            	} else {//new
                	var d = new Date(), id;
                	id=d.getTime();
                	var seat ={id:id, 'name':data.name,'mealId':data.meal.id};
                	reservations.push(seat);
            	}

            	res.writeHead(200,headers);
            	res.end(JSON.stringify({id:id}));
            	break;       
            case '/removeItem':
            	var i, rid;
            	rid=data.id;
            	for(i = 0; i< reservations.length; i++){
            		if(reservations[i].id == rid){
            			reservations.splice(i,1);
            			console.log('Removed '+rid);
            			break;
            		}
            	}
            	res.writeHead(200,headers);
            	res.end(JSON.stringify({id:rid}));
            	break;  
            }
        });
    }else{
        fs.readFile(__dirname + req.url,
            function (err, data) {
                if (err) {
                    res.writeHead(400);
                    res.end('File not found');
                    console.log('File not found: ' + req.url);
                    return;
                }else{
                	if(req.url.indexOf('.css')>0){
                		headers['Content-Type']= 'text/css';
                	} else if(req.url.indexOf('.js')>0){
                		headers['Content-Type']= 'text/javascript';
                	}
                	res.writeHead(200,headers);
                	res.write(data,'utf8');
                	res.end();
                	return;
                }
        });
    }
}
