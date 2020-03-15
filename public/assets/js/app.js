$("#submitComment").on("click", function(event) {
  event.preventDefault();
  $("#comments form :input").val("");
  var newComment = {
    comment: $("#commentText")
      .val()
      .trim()
  };
  var article_id = $("#submitComment").attr("data-id");
  console.log(newComment);
  $.ajax({
    type: "POST",
    url: "/submitComment/" + article_id,
    data: newComment
  }).then(function(res) {
    // data();
    console.log("Comment added successfully");
  });
});
