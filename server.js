var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var mongojs = require("mongojs");
// Requiring our Note and Article models
var Note = require("./models/note.js");
var Article = require("./models/article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_80wf5kx7:acjp6pi0ohpajae9spder1hgjp@ds157723.mlab.com:57723/heroku_80wf5kx7",{
  useMongoClient: true
});
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

app.get("/scrape", function(req, res) {
  // Query: In our database, go to the animals collection, then "find" everything,
  // but this time, sort it by name (1 means ascending order)
  request("http://www.sciencemag.org/news/latest-news", function(error, response, html) {

  // Load the HTML into cheerio and save it to a variable
  // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
  var $ = cheerio.load(html);

  Article.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {

      $("article.media.media--var").each(function(i, element) {

          var result = {};

          // Add the text and href of every link, and save them as properties of the result object
          result.title = $(this).children('.media__body').children("h2").children("a").text();
          result.link = $(this).children('.media__body').children("h2").children("a").attr("href");
          result.img= $(this).children('.media__icon').children("a").children("img").attr("src");
          console.log(result)

          var isAlreadyScraped = false;
          for (var i = 0; i < doc.length; i++) {
            if(doc[i].title === result.title){
              isAlreadyScraped = true;
            }
          }

          // Using our Article model, create a new entry
          // This effectively passes the result object to the entry (and the title and link)
          if (!isAlreadyScraped) {
            var entry = new Article(result); 
            console.log(result);
            // Now, save that entry to the db
            entry.save(function(err, doc) {
              // Log any errors
              if (err) {
                // console.log(err);
              }
              // Or log the doc
              else {
                console.log(doc);
              }
            });
          }
          
        
      });
      res.redirect("/")


      
    }
  });
  
  
  
  
});

});


// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {


  // TODO: Finish the route so it grabs all of the articles
  Article.find({}, function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Or send the doc to the browser
    else {
      res.send(doc);
    }
  });

});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  

  Article.findOne({"_id":  req.params.id })
    
    .populate({
        path:'notes',
        model:'Note'
    })
    // Now, execute that query
    .exec(function(error, doc) {
      // Send any errors to the browser
      if (error) {
        res.send(error);
      }
      // Or, send our results to the browser, which will now include the books stored in the library
      else {
        res.send(doc);
        console.log(doc);
      }
    });
  // Finish the route so it finds one article using the req.params.id,

  // and run the populate method with "note",

  // then responds with the article with the note included


});

// Create a new note or replace an existing note
app.post("/articles/:id", function(req, res) {


 

  // save the new note that gets posted to the Notes collection
  var newNote = new Note(req.body);
  // then find an article from the req.params.id
  newNote.save(function(error, doc) {
    // Send any errors to the browser
    if (error) {
      res.send(error);
    }
    // Otherwise
    else {
      // Find our user and push the new note id into the User's notes array
      console.log("req.params.id "+req.params.id)
      Article.findOneAndUpdate({"_id":  mongojs.ObjectId(req.params.id) },{ $push: { "notes": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          console.log(newdoc)
          res.send(newdoc);
        }
      });
    }
  });
  
  // and update it's "note" property with the _id of the new note


});

app.post("/notes/:id", function(req, res){


  Note.findByIdAndRemove(req.params.id, function(err, note) {
     if (err) {
          res.send(err);
        }
        // Or send the newdoc to the browser
        else {
          console.log(note);
          res.send(note);
        }
  })
})


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
