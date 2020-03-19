$(document).ready(function() {
  $("body").on("click", "#deleteComment", function(event) {
    event.preventDefault();

    console.log("I am in delete");
    var comment_id = $("#deleteComment").attr("data-id");
    var article_id = $("#readComments").attr("data-id");
    $.ajax({
      type: "DELETE",
      url: "/deleteComment/" + comment_id + "&" + article_id
    }).then(function(res) {
      $("#readComments").modal("hide");
      console.log(res);
    });
  });

  $("#submitComment").on("click", function(event) {
    event.preventDefault();
    var newComment = {
      comment: $("#commentText")
        .val()
        .trim()
    };
    var article_id = $("#submitComment").attr("data-id");
    console.log("article id is ", article_id);
    console.log(newComment);
    $.ajax({
      type: "POST",
      url: "/submitComment/" + article_id,
      data: newComment
    }).then(function(res) {
      // data();
      $("#comments form :input").val("");
      console.log("Comment added successfully");
    });
  });

  $("#viewComments").on("click", function(event) {
    event.preventDefault();
    $("#articleComments")
      .children()
      .remove();

    console.log("I am in view comments");
    var article_id = $("#viewComments").attr("data-id");
    $.ajax({
      type: "GET",
      url: "/getComments/" + article_id
    }).then(function(res) {
      var articleComments = res.comments;
      //populating modal with comments
      console.log(articleComments.length);
      for (var i = 0; i < articleComments.length; i++) {
        var newComment = $("<h5>").text(articleComments[i].comment);
        newComment.addClass("card-body");
        var buttonToAdd = $("<button>").text("Delete");
        buttonToAdd.addClass("btn btn-danger deleteComment");
        buttonToAdd.attr({
          "data-id": articleComments[i]._id,
          id: "deleteComment"
        });
        newComment.append(buttonToAdd);
        // var deleteButton = $("button").html("X");
        // newComment.append(deleteButton);
        $("#articleComments").append(newComment);
      }
    });
  });
});
