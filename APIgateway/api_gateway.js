//Express Setup
"use strict";
var express = require('express');
var https = require('https');
var helmet = require('helmet')
var fs = require('fs');

var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(helmet());


//emailer setup
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://info%40fibrecentral.co.za:fib3rc3ntra1@serv16.registerdomain.co.za');


//Mongo Setup
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connection.on('error', function(err) {
	console.log("Could not connect to mongo server! Mongo server not running");
	this.process.exit(1);
});

mongoose.connection.on('disconnected', function() {
	console.log("Disconnected from DB");
});

var fibreUser;
mongoose.connection.on('connected', function() {
	console.log("Connected to DB");
	//create data schema
	var userSchema = mongoose.Schema({
		email: String,
		firstName: String,
		lastName: String,
		cellphone: String,
		address: String,
		coordinates: {longitude: String, latitude: String},
		fibreStatus: String,
		timestamp: {created: {type: Date, default: Date.now}, 
			updated: {type: Date, default: Date.now}},
		emailVerified: {sent: {type: Boolean, default: false},
			verified: {type: Boolean, default: false}},
		active: {type: Boolean, default: true}
	});

	//create "data" class
	fibreUser = mongoose.model('fibreUser', userSchema);
});


var MONGO_IP = process.env.MONGO_IP;
var Portal_IP = process.env.Portal_IP;
mongoose.connect('mongodb://'+MONGO_IP+'/Fibre');


//APIs
// Need to update with HTTP status codes 
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/customer/fibreStatus/:userEmail', function (req, res) {
	fibreUser.findOne({email: req.params.userEmail}, function(err, user) {
		if(err) return res.send(err);
		if(user === null) return res.send("User does not exist");
		res.send(user.fibreStatus);
		
	});
});

app.post('/customer/emailVerified', function (req, res) {
	//res.send(req.body.emailAddress);
	fibreUser.findOne({email: req.body.emailAddress}, function(err, user) {
		if(err) return res.send(err);
		if(user === null) return res.send("User does not exist");

		user.emailVerified.verified = true;
		user.save(function (err) {
			if(err) return res.send(err);
			res.send("Email Verified");
		});		
	});
});

app.post('/customer', function (req, res) {
	var interestedUser = new fibreUser({
	    email: req.body.email,
	    firstName: req.body.firstName,
	    lastName: req.body.lastName,
	    cellphone: req.body.cellphone,
	    address: req.body.address,
	    coordinates: {longitude: req.body.coordinates.longitude, latitude: req.body.coordinates.latitude},
	    fibreStatus: "not available"
	});

	var send = transporter.templateSender({
		subject: 'Verify {{userEmailAddress}}',
		//text: 'Hi. Please verify your email address by going here: {{resetURL}}',
		html: '<h2>Thank you for submitting your interest</h2>'+
		'<p>Please click on the link below to verify your email address</p>'+
		'<a href="{{resetURL}}">Verify email address: {{userEmailAddress}}</a>'
	});
	var mailOptions = {
	    from: '"FibreCentral.co.za" <info@fibrecentral.co.za>',
	    to: interestedUser.email,
	    bcc: "info@fibrecentral.co.za",
	};
	var context = {
		resetURL: Portal_IP+'/verification/'+interestedUser.email,
		userEmailAddress: interestedUser.email
	};

	fibreUser.findOne({email: req.body.email}, function(err, user) {
		if(err) return res.send(err);

		if(user !== null) return res.send("User already exists");

		//Unique user so save to DB
		send(mailOptions,context, function(error, info){
			if(error){
				//On error we save but email sent status is false
				interestedUser.save(function (err) {
					if(err) return res.send(err);
					res.send("User saved to DB");
				});
				return;
			}

			if(info) {
				interestedUser.emailVerified.sent = true;
			    interestedUser.save(function (err) {
					if(err) return res.send(err);
					res.send("User saved to DB");
				});
			}
		});
	});
});


var sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(sslOptions, app).listen(3000, function () {
  console.log('GotFibre API gateway listening securely on port 3000!');
});