// YOUR CODE HERE:
var app = {};
app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.send = () => {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(app.buildMessageObject()),
    contentType: 'application/json',
    success: function (data) {

      console.log('chatterbox: Message sent', data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.clearMessages = () => {
  $('#chats').empty();
};

app.fetch = () => {
  // $.get(app.server, (data) => {
  //   console.log('suhhh', data);
  //   var messageArray = data.results;
  //   for (var message of messageArray) {
  //     app.renderMessage(message);
  //   }
  // });
  app.clearMessages();
  var d = new Date( (new Date()).getTime() - 1000 * 6000);
  var dateISO = d.toISOString();

  console.log(dateISO);

  $.ajax({
    url: app.server,
    type: 'GET',
    // beforeSend: app.setHeader,
    data: `where={"createdAt":{"$gte":{"__type":"Date","iso":"${dateISO}"}}}`,
    success: function(data) {
      console.log(data);
        var messageArray = data.results;
        for (var message of messageArray) {
          app.renderMessage(message);
        }
    }
  });
};

// app.setHeader = function(xhr) {
//   xhr.setRequestHeader('where={"createdAt":{"$gte":{"__type":"Date","iso":"2017-07-07"}}}', '');
// }


app.renderMessage = (message) => {
  if (message.username === null && message.text === null) {
    return;
  }
  var $body = $('#chats');
  //var $textBit = $(`<div class="message"><button class="username">${message.username}</button>
  //  <br>${message.text}</div>`);
  var $textBit = $('<div />');
  var $innerButton = $('<button />');
  $innerButton.addClass('username');
  $innerButton.text(message.username);
  $textBit.addClass('message');
  $textBit.hide();
  $textBit.text(message.text);
  $textBit.prependTo($body);
  $textBit.addClass(message.roomname);
  $innerButton.prependTo($textBit);
  $textBit.show();
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

  app.send();
};

app.buildMessageObject = function () {
  var message = {
    username: (window.location.search).split('=')[1],
    text: $('#message').val(),
    roomname: 'lobby'
  };
  $('#message').val('');
  app.renderMessage(message);
  return message;
}

app.init = () => {
  var chatHistory = app.fetch();
  // console.log(chatHistory);
  //app.renderMessage(message);

  $('#chats').on('click', '.username', () => {
    app.handleUsernameClick();
  });
  $('#send').off().submit('click', function (e) {
    // e.stopPropagation();
    app.handleSubmit();
    e.preventDefault();
  });

};

$(document).ready(() => {
  app.init();
  var timer = setInterval(app.fetch ,10000)

  console.log(window.location.search);
  console.log($('#roomSelect').val());

  // $.ajaxPrefilter(function (settings, _, jqXHR) {
  //   jqXHR.setRequestHeader('__type', 'Date');
  //   // jqXHR.setRequestHeader('iso', '2017-07-07');
  // });
});
