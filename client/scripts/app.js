// YOUR CODE HERE:
var app = {};
app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.send = (message) => {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = () => {
  var chatHistory = [];
  $.get(app.server, (data) => {
    var messageArray = data.results;
    for (var message of messageArray) {
      app.renderMessage(message);
    }

  });
  // console.log(chatHistory);
  return chatHistory;
};

app.clearMessages = () => {
  $('#chats').empty();
};

app.renderMessage = (message) => {
  var $body = $('#chats');
  //var $textBit = $(`<div class="message"><button class="username">${message.username}</button>
  //  <br>${message.text}</div>`);
  var $textBit = $('<div />');
  var $innerButton = $('<button />');
  $innerButton.addClass('username');
  $innerButton.text(message.username);
  $textBit.addClass('message');
  $textBit.text(message.text);
  $textBit.appendTo($body);
  $innerButton.prependTo($textBit);
};

app.renderRoom = (room) => {
  var $target = $('#roomSelect');
  var $bit = $(`<option value = "${room}">${room}</option>`);
  $bit.appendTo($target);
};

app.handleUsernameClick = () => {
  return true;
};

app.handleSubmit = () => {
  // var message = {
  //   username: 'Mel Brooks',
  //   text: 'It\'s good to be the king',
  //   roomname: 'lobby'
  // };
  // app.send(message);
  // console.log('submit');
  return true;
};



app.init = () => {
  var chatHistory = app.fetch();
  // console.log(chatHistory);
  //app.renderMessage(message);

  $('#chats').on('click', '.username', () => {
    app.handleUsernameClick();
  });
  $('.submit').off().submit((e) => {
    e.preventDefault();
    app.handleSubmit();
  });

  $('#send .submit').val('BOOM');

};

$(document).ready(() => {
  app.init();
});
