var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var db = require("../models");
var axios = require("axios");
var cheerio = require("cheerio");

router.get("/scrape", function(req, res) {
  axios.get("https://www.foxnews.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("article header").each(function(i, element) {
      var mainResult = {};

      mainResult.title = $(this)
        .children("h2")
        .children("a")
        .text();
      mainResult.link = $(this)
        .children("h2")
        .children("a")
        .attr("href");

      db.Article.findOneAndUpdate(
        { title: mainResult.title },
        mainResult,
        { upsert: true },
        function(err, dbArticle) {
          if (err) {
            return err;
          }
          console.log(dbArticle);
        }
      );
    });
    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
router.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(data) {
      var hbsObject = {
        articles: data
      };
      //   hbsObject = JSON.parse(hbsObject);
      // If we were able to successfully find Articles, send them back to the client
      console.log("data passed to handlebars", hbsObject);

      res.render("index", hbsObject);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

router.post("/submitComment/:id", function(req, res) {
  // Create a new Note in the db
  console.log(req.body.comment);
  console.log(db.Comment);
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one User (there's only one) and push the new Note's _id to the User's `notes` array
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      console.log("comment ID is ", dbComment._id);
      return db.Article.findOneAndUpdate(
        { _id: mongojs.ObjectId(req.params.id) },
        { $push: { comments: dbComment._id } },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If the User was updated successfully, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

// // Route for saving/updating an Article's associated Note
// app.post("/articles/:id", function(req, res) {
//   // Create a new note and pass the req.body to the entry
//   db.Note.create(req.body)
//     .then(function(dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });
module.exports = router;
