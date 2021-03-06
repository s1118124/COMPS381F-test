var express = require('express');
var app = express();
var session = require('cookie-session');
var assert = require('assert');
var mongourl = 'mongodb://localhost:27017/test';

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

app.use(session({
  name: 'session',
  keys: ['key1','key2'],
  maxAge: 5 * 60 * 1000
}));

app.set('view engine', 'ejs');

app.get("/list", function(req,res) {
        console.log('nvisit: ' + req.session.nvisit);
        req.session.nvisit = (req.session.nvisit >= 0) ? req.session.nvisit += 1 : 1;
        var items = [];
	MongoClient.connect(mongourl, function(err, db) {
                assert.equal(err,null);
                console.log('Connected to MongoDB\n');
                db.collection('items').find().skip(10*(req.session.nvisit-1)).limit(10).toArray(function(err,results) {
                        if (err) {
                                console.log(err);
                        } else {
                               db.close();
                                res.render('list',{'items':results});
                        }
                });
	});
});

app.listen(process.env.PORT || 8099);
