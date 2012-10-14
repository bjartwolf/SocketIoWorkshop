var socketio = require('socket.io')
	, fs = require('fs')
	, express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , io = socketio.listen(server)
	, reservations = [{id:1, 'name': 'Ola',  'mealId':0},
                      {id:2, 'name': 'Per',  'mealId':1},
                      {id:3, 'name': 'Eva',  'mealId':2},
                      {id:4, 'name': 'Olga', 'mealId':2}];

// Parsing JSON into body.req[param] automagically
app.use(express.bodyParser());
app.use('/lib', express.static(__dirname + '/lib'));
app.use('/src', express.static(__dirname + '/src'));
app.use('/img', express.static(__dirname + '/img'))
app.use('/css', express.static(__dirname + '/css'));
app.use('/', express.static(__dirname + '/html'));

server.listen(process.env.port || 1337);

io.sockets.on('connection', function (socket) {
  console.log('socket connected');
  socket.emit('news', { hello: 'world' });
  socket.on('cxevent', function (data) {
        socket.emit('news', { hello: 'world from cx event' });
  });
});

// Standard headers used in app
var headers = { 'Content-Type' : 'text/plain; charset=utf-8',
                'cache-control': 'no-cache, no-store, must-revalidate',
                'expires'      : 0
}; 

app.get('/', function (req, res) {
    res.writeHead(200, headers);
    res.redirect('/index.html');
});

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


