//var http = require('http');
//var url  = require('url');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongourl = 'mongodb://developer:developer@ds033046.mlab.com:33046/s1118124';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');

//--googlemap
/**var assert = require('assert');
var mongourl = 'mongodb://student:password@ds031873.mlab.com:31873/comps381f';
var MongoClient = require('mongodb').MongoClient;
**/
//--googlemap

var SECRETKEY = 'I want to pass COMPS381F';

app.use(fileUpload());
app.use(bodyParser.json());
app.use(session({
	secret: SECRETKEY,
	resave: true,
	saveUninitialized: true
}));
/**
var restaurants = [
	{name: 'Apple iPad Pro', photo: 100, id: '001'},
	{name: 'Apple iPhone 7', photo: 50, id: '002'},
	{name: 'Apple Macbook', photo: 1627, id: '003'}
];
**/

app.set('view engine', 'ejs');

//var restaurants = [];

//may need to fit the request as: GET /api/read
app.get("/read", function(req, res) {
	//var restaurants = [];
	MongoClient.connect(mongourl, function(err, db) {
	assert.equal(err,null);
	console.log('Connected to MongoDB\n');
	db.collection('restaurants').find().toArray(function(err, result){
			if (err) throw err
				console.log(result);
				res.render("list", {restaurants: result});
		})
	
	db.close();
	console.log('Disconnected MongoDB\n');
	});
	

});
	//res.render("list", {restaurants: result});

app.get('/showdetails', function(req,res) {
	/**
	if (req.query.id != null) {
		for (var i=0; i<restaurants.length; i++) {
			if (restaurants[i].id == req.query.id) {
				var restaurant = restaurants[i];
				break;
			}
		}
		if (restaurants != null) {
			res.render('details', {c: restaurant});
		} else {
			res.status(500).end(req.query.id + ' not found!');
		}
	} else {
		res.status(500).end('id missing!');
	}**/
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		restaurants = db.collection('restaurants').find();
		db.close();
		console.log('Disconnected MongoDB\n');
		if (req.query.id != null) {
			for (var i=0; i<restaurants.length; i++) {
				if (restaurants[i].id == req.query.id) {
					var restaurant = restaurants[i];
					break;
				}
			}
			if (restaurants != null) {
				res.render('details', {c: restaurant});
			} else {
				res.status(500).end(req.query.id + ' not found!');
			}
		} else {
			res.status(500).end('id missing!');
		}
	});


        //--Googlemap
        /**MongoClient.connect(mongourl, function(err, db) {
    assert.equal(err,null);
    console.log('Connected to MongoDB\n');
		var criteria = {'id':req.query.id};
    findCafe(db,criteria,function(cafe) {
      db.close();
      console.log('Disconnected MongoDB\n');
			res.render('gmap',{name:cafe.name,lat:cafe.coord[0],lon:cafe.coord[1],zoom:18});
			res.end();
		});
	});**/
        //--Googlemap
});

//--googlemap function
/**
function findCafe(db,criteria,callback) {
	db.collection('cafes').findOne(criteria,function(err,result) {
		assert.equal(err,null);
		callback(result);
	});
}**/
//--googlemap function

/**
app.get('/shoppingcart', function(req,res) {
	//res.end('coming soon!')
        res.render("shoppingcart", {c: restaurants});
});
**/

//add code for new
app.get('/new', function(req, res){
	//MongoClient.connect(mongourl, function(err, db) {
	//	assert.equal(err,null);
	//	console.log('Connected to MongoDB\n');
	//	//restaurants = db.collection('restaurants').find();
	//	db.close();
	//	console.log('Disconnected MongoDB\n');
	//});
	res.sendFile(__dirname + '/public/new.html');
    //res.render("new", {c: restaurants});//
});

//add code for create new
//may need to fit the request as: POST /api/create
app.post('/create', function(req, res){
        //do sth to create
	var r = {};  // new restaurant to be inserted
	r['address'] = {};
	r.address.street = (req.body.street != null) ? req.body.street : null;
	r.address.zipcode = (req.body.zipcode != null) ? req.body.zipcode : null;
	r.address.building = (req.body.building != null) ? req.body.building : null;
	r.address['coord'] = [];
	r.address.coord.push(req.body.lon);
	r.address.coord.push(req.body.lat);
	r['borough'] = (req.body.borough != null) ? req.body.borough : null;
	r['cuisine'] = (req.body.cuisine != null) ? req.body.cuisine : null;
	r['name'] = (req.body.name != null) ? req.body.name : null;
	r['restaurant_id'] = (req.body.restaurant_id != null) ? req.body.restaurant_id : null;
	//
	MongoClient.connect(mongourl, function(err, db) {
		assert.equal(err,null);
		console.log('Connected to MongoDB\n');
		db.collection('restaurants').insertOne(r,
			function(err,result) {
				assert.equal(err,null);
				console.log("insertOne() was successful _id = " +
					JSON.stringify(result.insertedId));
				db.close();
				console.log('Disconnected from MongoDB\n');
				res.writeHead(200, {"Content-Type": "text/plain"});
				res.end('Insert was successful ' + JSON.stringify(r));
			});
	});
        //res.end('coming soon!')
	//res.redirect('/showdetails')
});

//useless code in this
app.get('/add2cart', function(req,res) {
	//res.end('coming soon!')
/**	
	var product;
	if (req.query.id != null) {
		for (var i=0; i<products.length; i++) {
			if (products[i].id == req.query.id) {
				product = products[i];
				break;
			}
		}
		if (product != null) {

			res.render('details', {c: product});
		} else {
			res.status(500).end(req.query.id + ' not found!');
		}
	} else {
		res.status(500).end('id missing!');
	}**/
});

//useless code in this
/**
app.get('/emptycart',function(req,res) {
	res.end('coming soon!')
})
**/

app.listen(process.env.PORT || 8099);