var socketio = require('socket.io')
	, fs = require('fs')
	, express = require('express')
    , app = express()
    , server = require('http').createServer(app)
	, reservations = [{id:1, 'name': 'Ola',  'mealId':0},
                      {id:2, 'name': 'Per',  'mealId':1},
                      {id:3, 'name': 'Eva',  'mealId':2},
                      {id:4, 'name': 'Olga', 'mealId':2}];

// Parsing JSON into body.req[param] automagically
app.use(express.bodyParser());

// Standard headers used in app
var headers = { 'Content-Type' : 'text/plain',
                'cache-control': 'no-cache, no-store, must-revalidate',
                'expires'      : 0
}; 

app.get('/load', function (req, res) {
    res.writeHead(200, headers);
    res.end(JSON.stringify(reservations));
});

app.post('/saveItem', function (req, res) {
    if (req.body.id) { //update existing if it has ID
        for(var i=0; i < reservations.length; i++){
            if (reservations[i].id == req.body.id) {
                reservations[i].name = req.body.name;
                reservations[i].mealId = req.body.meal.id;
                break; // Found it and updates it. Refactor
            }
        }
    } else { //new item
        var d = new Date(), id;
        id = d.getTime();
        var seat = {id: id, 'name': req.body.name, 'mealId': req.body.meal.id};
        reservations.push(seat);
    }
    res.writeHead(200,headers);
    res.end(JSON.stringify({id:id}));
});

app.post('/removeItem', function (req, res) {
    var i
       ,rid = req.body.id;
    for(i = 0; i< reservations.length; i++){
        if(reservations[i].id == rid){
            reservations.splice(i,1);
            console.log('Removed '+rid);
            break;
        }
    }
    res.writeHead(200,headers);
    res.end(JSON.stringify({id:rid}));
});

app.get('/index.html', function (req, res) {
    fileHandler(req, res); 
});

app.get(/lib\/.*js/, function (req, res) {
    fileHandler(req, res); 
});

app.get(/src\/.*js/, function (req, res) {
    fileHandler(req, res); 
});

app.get(/img\/.*png/, function (req, res) {
    fileHandler(req, res); 
});

app.get(/css\/.*css/, function (req, res) {
    fileHandler(req, res); 
});


server.listen(process.env.port || 1337);

var io = socketio.listen(server);

io.sockets.on('connection', function (socket) {
  console.log('socket connected');
  socket.emit('news', { hello: 'world' });
  socket.on('cxevent', function (data) {
        socket.emit('news', { hello: 'world from cx event' });
  });
});

function fileHandler(req, res) {
        var headers = { 'Content-Type': 'text/plain'}; 
        fs.readFile(__dirname + req.url,
            function (err, data) {
                if (err) {
                    res.writeHead(400);
                    res.end('File not found');
                    console.log(req);
                    console.log('File not found: ' + req.url);
                    return;
                } else {
                	if(req.url.indexOf('.css')>0){
                		headers['Content-Type']= 'text/css';
                	} else if(req.url.indexOf('.js')>0){
                		headers['Content-Type']= 'text/javascript';
                	} else if(req.url.indexOf('.html')>0){
                		headers['Content-Type']= 'text/html';
                	} else if(req.url.indexOf('.png')>0){
                		headers['Content-Type']= 'image/png';
                    }
                	res.writeHead(200,headers);
                	res.write(data,'utf8');
                	res.end();
                	return;
                }
        });
}
