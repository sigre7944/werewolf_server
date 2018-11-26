var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var indexRouter = require('./routes/index');

var app = express();
var socket_io = require('socket.io')
var io = socket_io()
app.io = io


var playersRouter = require('./routes/players')
var roomsRouter = require('./routes/rooms')(io)
var handleCookiesRouter = require('./routes/handleCookies')(io)
var mainPageRouter = require('./routes/mainPage')(io)
var getCardsRouter = require('./routes/Roles/getCards')(io)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/', indexRouter);
app.use('/players', playersRouter);
app.use('/rooms', roomsRouter)
app.use('/main-page', mainPageRouter)
app.use('/handle-cookies', handleCookiesRouter)
app.use('/get-roles', getCardsRouter)




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
