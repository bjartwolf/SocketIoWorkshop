var http = require('http')
	, socketio = require('socket.io')
	, director = require('director')
	, fs = require('fs')
	, union = require('union')
	, reservations = [{id:1, 'name':'Ola','mealId':0},
                    {id:2, 'name':'Per','mealId':1},
                    {id:3, 'name':'Eva','mealId':2},
                    {id:4, 'name':'Olga','mealId':2}];


var router = new director.http.Router({
    '/saveItem' : { post: saveItem }
});

router.get('/load', function () {
    var headers = { 'Content-Type': 'text/plain',
                    'cache-control': 'no-cache, no-store, must-revalidate',
                    'expires' : 0
    }; 
    this.res.writeHead(200, headers);
    this.res.end(JSON.stringify(reservations));
});

//router.post('/saveItem', function () {
function saveItem () {
    var headers = { 'Content-Type': 'text/plain',
                    'cache-control': 'no-cache, no-store, must-revalidate',
                    'expires' : 0
    }; 
    this.res.json(this.req.body);
    this.res.end('');
    console.log('****');
    var data = JSON.parse(this.req.body);
    if (data.id) { //update existing
        for(var i=0; i < reservations.length; i++){
            if (reservations[i].id == data.id) {
                reservations[i].name = data.name;
                reservations[i].mealId = data.meal.id;
                break;
            }
        }
    } else { //new item
        var d = new Date(), id;
        id = d.getTime();
        var seat = {id: id, 'name': data.name, 'mealId': data.meal.id};
        reservations.push(seat);
    }
    this.res.writeHead(200,headers);
    this.res.end(JSON.stringify({id:id}));
}
//});

router.post('/removeItem', function () {
    var headers = { 'Content-Type': 'text/plain',
                    'cache-control': 'no-cache, no-store, must-revalidate',
                    'expires' : 0
    }; 
    var data = JSON.parse(this.req.body);
    var i, rid
    rid=data.id;
    for(i = 0; i< reservations.length; i++){
        if(reservations[i].id == rid){
            reservations.splice(i,1);
            console.log('Removed '+rid);
            break;
        }
    }
    this.res.writeHead(200,headers);
    this.res.end(JSON.stringify({id:rid}));
});

router.get('/index.html', function () {
    fileHandler(this.req, this.res); 
});
router.get(/lib\/.*js/, function () {
    fileHandler(this.req, this.res); 
});

router.get(/src\/.*js/, function () {
    fileHandler(this.req, this.res); 
});

router.get(/img\/.*png/, function () {
    fileHandler(this.req, this.res); 
});

router.get(/css\/.*css/, function () {
    fileHandler(this.req, this.res); 
});

var server = http.createServer(function (req, res) {
  router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end();
      }
  });
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
