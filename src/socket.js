const { server } = require('./index');
const io = require('socket.io')(server);

io.on('connection', function(socket) {
    console.log('Contencinho');
});