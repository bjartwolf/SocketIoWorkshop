var socketio = require('socket.io')
	, fs = require('fs')
	, express = require('express')
    , app = express()
    , server = require('http').createServer(app)
    , _ = require('underscore') 
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

app.get('/', function (req, res) {
    res.redirect('/index.html');
});

app.get('/reservations', function (req, res) {
    res.end(JSON.stringify(reservations));
});

app.post('/reservations', function (req, res) {
    // find reservation
    var id = req.body.id;
    var reservation = _.find(reservations, function (reservation) {
        return reservation.id == id;
    });
    if (reservation) {
        reservation.name = req.body.name;
        reservation.mealId = req.body.meal.id;
    } else {
       // No reservation found - create a new reservation
        var id = new Date().getTime()
          , seat = {id: id, 'name': req.body.name, 'mealId': req.body.meal.id};
        reservations.push(seat);
    }
    res.end(JSON.stringify({id:id}));
});

app.delete('/reservations', function (req, res) {
    var id = req.body.id;
    reservations = _.filter(reservations, function (reservation) {
        return reservation.id != id;
    });
    res.end(JSON.stringify({id:id}));
});
