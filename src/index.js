const express = require('express');
const app = express();
const server = require('http').Server(app);
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

app.post('/jugar', function(req, res) {
    res.render('juego');
});

app.get('/registro', (req, res) => {
    res.render('index');
});


// ARCHIVOS ESTÁTICOS
app.use('/public', express.static(path.join(__dirname, 'public')));

// SOCKETS
require('./socket')(server);

server.listen(3001, function() {
    console.log('Escuchando en el puerto 3001');
});