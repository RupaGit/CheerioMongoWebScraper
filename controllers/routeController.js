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
        { _id: req.params.id },
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

router.get("/getComments/:id", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.findOne({ _id: req.params.id })
    // Specify that we want to populate the retrieved libraries with any associated books
    .populate("comments")
    .then(function(data) {
      console.log("data is", data);
      // If any Libraries are found, send them to the client with any associated Books
      var hbsObject = {
        comments: data.comments
      };
      //   console.log(hbsObject);
      //   hbsObject = JSON.parse(hbsObject);
      // If we were able to successfully find Articles, send them back to the client
      console.log("data passed to handlebars", hbsObject);

      res.json(hbsObject);
    })
    .catch(function(err) {
      // If an error occurs, send it back to the client
      res.json(err);
    });
});

router.delete("/deleteComment/:commentId&:articleId", function(req, res) {
  // Grab every document in the Articles collection
  console.log("comment id is ", req.params.commentId);
  console.log("article id is ", req.params.articleId);
  db.Comment.findOneAndDelete({ _id: req.params.commentId })
    .then(function(dbArticle) {
      // If the User was updated successfully, send it back to the client
      console.log(dbArticle);
      return db.Article.findOneAndUpdate(
        { _id: req.params.articleId },
        { $pull: { comments: dbArticle._id } }
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
module.exports = router;
