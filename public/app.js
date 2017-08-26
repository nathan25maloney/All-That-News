// Grab the articles as a json

var lastArticleId = "";

$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append(`
      <li>
        <div class='media'>
          <div class='media_img'>
            <img src=${data[i].img}>
          </div>
          <div class='media_info'>
            <p data-id=${data[i]._id}>
              ${data[i].title}<br />
              <a href='http://www.sciencemag.org/${data[i].link} target='_blank'>
                Link to the Article
              </a>
            </p>
          </div>
        </div>
      </li>`);
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  lastArticleId = thisId;
  console.log(thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' placeholder='Author' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Your notes'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      $("#notes").append(`<h3>Comments</h3>
        <div class="panel-group>"`)



      // If there's a note in the article
      if (data.notes) {
        for (var i = 0; i < data.notes.length; i++) {
          $("#notes").append(`
            
            <div class="panel panel-default">
              <div class="panel-heading">${data.notes[i].title}</div>
              <div class="panel-body">${data.notes[i].body}</div>
              <div class="panel-footer"><button data-id="${data.notes[i]._id}" id="deletenote">Delete Note</button> </div>
            </div>`)
            
        }
        $("#notes").append(`</div>`);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
      rebuild(lastArticleId);
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});


$(document).on("click", "#deletenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
  console.log(thisId);
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/notes/" + thisId,
  })
    // With that done
    .done(function(data) {
      // Log the response
      $("#notes").empty();
      rebuild(lastArticleId);
      $(this).empty();
    });

  
});

$(document).on("click", "#savenote", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  }).done(function(data) {
    console.log(data);
  })
})

var rebuild = function(Id){
  $.ajax({
    method: "GET",
    url: "/articles/" + Id
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      $("#notes").append(`<h3>Comments</h3>
        <div class="panel-group>"`)



      // If there's a note in the article
      if (data.notes) {
        for (var i = 0; i < data.notes.length; i++) {
          $("#notes").append(`
            
            <div class="panel panel-default">
              <div class="panel-heading">${data.notes[i].title}</div>
              <div class="panel-body">${data.notes[i].body}</div>
              <div class="panel-footer"><button data-id="${data.notes[i]._id}" id="deletenote">Delete Note</button> </div>
            </div>`)
            
        }
        $("#notes").append(`</div>`);
      }
    });
}