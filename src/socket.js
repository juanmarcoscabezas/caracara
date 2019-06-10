const rooms = [];

module.exports = (server) => {
    const io = require('socket.io')(server);
    const wiki = require('wikijs');
    io.on('connection', function(socket) {

        socket.on('juego.iniciar', (data) => {
            roomEntrar(socket, io, data);
        });

        socket.on('juego.enviar.prediccion', (data) => {
            roomEnviarPrediccion(socket, io, data);
        });

        socket.on('juego.famoso.buscar', (data) => {
            wiki.default({ apiUrl: 'https://es.wikipedia.org/w/api.php' })
                .page(data)
                .then((page) => {
                    return page.mainImage();
                    //return page.info();
                })
                .then((pageInfo) => {
                    console.log(pageInfo);
                    socket.emit('juego.famoso.imagen', pageInfo);
                })
                .catch(error => {
                    console.error(error);
                    socket.emit('juego.famoso.imagen.error', 'No se ha encontrado el famoso');
                });
        });

        socket.on('disconnect', () => {
            roomDesconectar(socket, io);
        });
    });
}

function roomEntrar(socket, io, data) {

    console.log('entrando')

    let roomVacio = false;
    let roomIndice = null;
    let roomCreador = null;

    for (let i = 0; i < rooms.length; i++) {
        const roomUsuarios = io.sockets.adapter.rooms[rooms[i].creador].length;
        if (roomUsuarios === 1) {
            roomVacio = true;
            roomCreador = rooms[i].creador;
            roomIndice = i;
            break;
        }
    }
    if (roomVacio) {
        socket.join(rooms[roomIndice].creador);
        socket.emit('juego.room.creado', {
            room: roomCreador,
            turno: false
        });
    } else {
        socket.emit('juego.room.creado', {
            room: socket.id,
            turno: true
        });
        rooms.push({ creador: socket.id });
    }
}

function roomEnviarPrediccion(socket, io, data) {
    console.log(data);
    if (io.sockets.adapter.rooms[data.room]) {
        io.to(data.room).emit('juego.recibir.prediccion', data.prediccion);
    }
}

function roomDesconectar(socket, io) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].creador === socket.id) {
            rooms.splice(i, 1);
        }
    }
}