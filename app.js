/*
 * Module dependencies
 */
var express = require('express')
  , stylus = require('stylus')
  , nib = require('nib')
  , formidable = require('formidable')
  , csv=require('csvtojson')


var app = express()

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib());
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(stylus.middleware(
  { src: __dirname + '/public'
  , compile: compile
  }
))
app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})

app.post('/upload', function(req, res, next) {

  var form = new formidable.IncomingForm();
 
  form.parse(req);

  //Show uploading percentage...
  form.on('progress', function(bytesReceived, bytesExpected) {
    var percent_complete = (bytesReceived / bytesExpected) * 100;
    console.log(percent_complete.toFixed(2));
  });

  //Error handeler...
  form.on('error', function(err) {
      console.error(err);
      return res.end(err);
  });

  //Read file from temp path and create CSV file in to JSON, Use JSON according to your requirments
  form.on('end', function(fields, files) {
      /* Temporary location of our uploaded file */
      var temp_path = this.openedFiles[0].path;
      console.log("Temp path: " + temp_path);
      /* The file name of the uploaded file */
      var file_name = this.openedFiles[0].name;
      console.log("Temp path: " + file_name);

      csv()
      .fromFile(temp_path)
      .then((jsonObj)=>{
          //console.log(jsonObj);
         return res.send(jsonObj);
      });
  });

});

app.listen(3000, function(){
  console.log(`Server running on 3000 PORT`);
})