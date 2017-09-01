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
  // $.ajax({
  //   url: 'http://parse.sfm8.hackreactor.com/',
  //   type: 'GET',
  //   success: function (data) {
  //   }
  // });
  $.get(app.server, (data) => {
    console.log(data);
  });
};

app.clearMessages = () => {
  $('#chats').empty();
};

app.renderMessage = (message) => {
  var $body = $('#chats');
  var $textBit = $(`<div class="message"><button class="username">${message.username}</button>
    <br>${message.text}</div>`);
  $textBit.appendTo($body);
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
  var message = {
    username: 'Mel Brooks',
    text: 'It\'s good to be the king',
    roomname: 'lobby'
  };
  app.send(message);
  console.log('submit');
  return true;
};



app.init = () => {
  $('#chats').on('click', '.username', () => {
    app.handleUsernameClick();
  });
  $('.submit').off().submit((e) => {
    e.preventDefault();
    app.handleSubmit();
  });

  $('#send .submit').val('BOOM');

};
