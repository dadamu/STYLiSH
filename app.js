const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const apiRouter = require('./api/api-1.0');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.set('socket', io);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('static'));
app.use('/api', apiRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ error: err.message });
});


server.listen(3000, function () {
    console.log('Server Start!');
});