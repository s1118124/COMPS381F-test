var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// Use your own mlab user id and password!!!
var mongourl = 'mongodb://student:password@ds031873.mlab.com:31873/comps381f';

var express = require('express');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var app = express();

// middlewares
app.use(fileUpload());
app.use(bodyParser.json());

app.get('/create', function(req,res) {
  res.sendFile(__dirname + '/form.html');
});

app.get('/', function(req,res) {
    res.redirect('/read');
});

app.get('/read', function(req,res) {
  var criteria = {};
  if (req.query.year != null) {
    criteria['year'] = req.query.year;
  }
  if (req.query.month != null) {
    criteria['month'] = req.query.month;
  }
  MongoClient.connect(mongourl,function(err,db) {
    console.log('Connected to mlab.com');
    var cursor = db.collection('photos').find(criteria);
    res.write('<html><body><ol>');
    cursor.each(function(err,doc) {
      assert.equal(err,null);
      if (doc != null) {
        var caption = (doc.caption == null) ?
                      'No Caption' : doc.caption;
        res.write('<li><a href=/download?key='+doc._id+'>'+
                  caption+'</a></li>');
      } else {
        res.write('</ol></body></html>');
        res.end();
      }
    });
    db.close();
  });
});

app.post('/upload', function(req, res) {
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    MongoClient.connect(mongourl,function(err,db) {
      console.log('Connected to mlab.com');
      assert.equal(null,err);
      create(db,req.body.year,req.body.month,req.body.caption,
        req.files.sampleFile,function(result) {
          db.close();
          if (result.insertedId != null) {
            res.status(200);
            res.end('Inserted: ' + result.insertedId);
          } else {
            res.status(500);
            res.end(JSON.stringify(result));
          }
      });
    });
    /*
    sampleFile = req.files.sampleFile;
    sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
        if (err) {
            res.status(500).send(err);
        }
        else {
            res.send('File uploaded!');
        }
    });
    */
});

app.get('/download', function(req,res) {
  MongoClient.connect(mongourl,function(err,db) {
    console.log('Connected to mlab.com');
    console.log('Finding key = ' + req.query.key)
    assert.equal(null,err);
    var bfile;
    var key = req.query.key;
	  if (key != null) {
      read(db, key, function(doc,bfile) {
        if (bfile != null) {
          console.log('Found: ' + key)
          res.set('content-type','text/html');
          res.write('<html><head><title>Photo</title></head><body>');
          res.write('<div align="center">')
          res.write('<img src="data:'+
            doc.mimetype+';base64,'+doc.data+'" border="1">');
          res.write('<p>'+doc.caption+'</p>');
          res.write('<p>'+'Date: ' + doc.month + '/' + doc.year + '</p>');
          res.end('</div></body></html>');
          //res.set('Content-Type',doc.mimetype);
          //res.end(bfile);
        } else {
          res.status(404);
          res.end(key + ' not found!');
          console.log(key + ' not found!');
        }
        db.close();
      });
    } else {
      res.status(500);
      res.end('Error: query parameter "key" is missing!');
    }
  });
});

function create(db,year,month,caption,bfile,callback) {
  console.log(bfile);
  db.collection('photos').insertOne({
    "year" : year,
    "month" : month,
    "caption" : caption,
    "like" : 0,
    "data" : new Buffer(bfile.data).toString('base64'),
    "mimetype" : bfile.mimetype,
  }, function(err,result) {
    //assert.equal(err,null);
    if (err) {
      result = err;
      console.log("insertOne error: " + JSON.stringify(err));
    } else {
      console.log("Inserted _id = " + result.insertedId);
    }
    callback(result);
  });
}

function read(db,target,callback) {
  var bfile = null;
  var mimetype = null;
  db.collection('photos').findOne({"_id": ObjectId(target)}, function(err,doc) {
    assert.equal(err,null);
    if (doc != null) {
      bfile = new Buffer(doc.data,'base64');
      mimetype = doc.mimetype;
    }
    callback(doc,bfile);
  });
}

app.listen(8099, function() {
    console.log('Server running...');
});
