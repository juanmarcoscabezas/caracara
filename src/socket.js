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

        socket.on('juego.enviar.prediccion.respuesta', (data) => {
            roomEnviarPrediccionRespuesta(socket, io, data);
        });

        socket.on('disconnect', () => {
            roomDesconectar(socket, io);
        });
    });
}

function roomEntrar(socket, io, data) {
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
            turno: false,
            activo: true
        });
        io.to(roomCreador).emit('juego.partida.inicia', true);
        rooms[roomIndice].invitado = socket.id;
    } else {
        socket.emit('juego.room.creado', {
            room: socket.id,
            turno: true,
            activo: true
        });
        rooms.push({ creador: socket.id });
    }
}

function roomEnviarPrediccion(socket, io, data) {
    console.log(data);
    if (io.sockets.adapter.rooms[data.room]) {
        socket.to(data.room).emit('juego.recibir.prediccion', {
            prediccion: data.prediccion,
            turno: true,
        });
    }
}

function roomEnviarPrediccionRespuesta(socket, io, data) {
    if (io.sockets.adapter.rooms[data.room]) {
        socket.to(data.room).emit('juego.recibir.prediccion.respuesta', {
            respuesta: data.respuesta
        });
    }
}

function roomDesconectar(socket, io, data) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].creador === socket.id || rooms[i].invitado === socket.id) {
            socket.to(rooms[i].creador).emit('juego.fin.rival.desconectado', true);
            rooms.splice(i, 1);
            break;
        }
    }
}