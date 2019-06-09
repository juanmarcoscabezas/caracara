const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const hbs = require('express-handlebars');
const path = require('path');

// CONFIGURACION HANDLEBARS
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    helpers: {}
}));

// RUTAS
app.get('/', function(req, res) {
    res.render('index');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.get('/caracara', (req, res) => {
    res.render('caracara', {

    })
});

io.on('connection', function(socket) {
    console.log('Se ha conectado alguien');
});

module.exports.server = http;

http.listen(3000, function() {
    console.log('Escuchando en el puerto 3000');
});