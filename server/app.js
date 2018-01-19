// *** main dependencies *** //
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swig = require('swig');
var cors = require('cors');



// *** routes *** //
var router = express.Router();
var routes = require('./routes/index.js');
var routes_protected = require('./routes/protected.js');


// *** express instance *** //
var app = express();


// *** view engine *** //
var swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, 'views'));


// *** config middleware *** //
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));





// Enable CORS //


let corsOptions = {
    origin: '*',
    credentials: true
}
app.use(cors(corsOptions));


// app.use(function(req, res, next) {

//   res.header("Access-Control-Allow-Origin", "http://localhost:8081"); // restrict it to the required domain
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//     // Set custom headers for CORS
//     res.header("Access-Control-Allow-Headers", "Content-Type");


//     // if (req.method === "OPTIONS") {
//     //     return res.status(200).end();
//     // }

//     return next();

// });




//app.use('/api/', require('./middlewares/auth.js'));
app.use('/api/', require('./routes/protected.js')(router));


// *** main routes *** //
app.use('/', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// *** error handlers *** //

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// stops server from crashing and prints error
process.on('uncaughtException', function (err) {
    console.log(err);
}); 


module.exports = app;
