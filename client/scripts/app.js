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
  // app.clearMessages();
  var d = new Date( (new Date()).getTime() - 1000 * 6000);
  var dateISO = d.toISOString();

  // console.log(dateISO);

  $.ajax({
    url: app.server,
    type: 'GET',
    // beforeSend: app.setHeader,
    data: `where={"createdAt":{"$gte":{"__type":"Date","iso":"${dateISO}"}}}`,
    success: function(data) {
      console.log(data);
      var messageArray = data.results;
      for (var message of messageArray) {
        if (message.roomname === null || message.roomname === undefined) {
          message.roomname = 'lobby';
        } else {
          message.roomname = message.roomname.replace(/\s+/g, '');
          message.roomname = message.roomname.replace('\'', '');
        }
        if (!app.alreadyPushed.includes(message.objectId)) {
          console.log(message.username, 'is in', message.roomname);
          app.renderMessage(message);
          app.alreadyPushed.push(message.objectId);
          if (!app.currentRooms.includes(message.roomname)) {
            app.addRoom(message.roomname);
          }
        }
      }
    }
  });
  window.preventDefault;
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
  $innerButton.text(JSON.stringify(message.username));
  $textBit.addClass('message');
  $textBit.text(JSON.stringify(message.text));
  $textBit.prependTo($body);
  $textBit.addClass(message.roomname.replace(/\s+/g, ''));
  $innerButton.prependTo($textBit);
  if (message.roomname.replace(/\s+/g, '') !== app.selectRoom && app.selectRoom !== 'lobby') {
    $textBit.hide();
  }
};

app.renderRoom = (room) => {
  var $target = $('#roomSelect');
  var $bit = $(`<option value = "${room}">${room}</option>`);
  $bit.appendTo($target);
};

app.addRoom = (room) => {
  if (room === null) {
    return;
  }
  // room = JSON.stringify(room);
  app.currentRooms.push(room);
  app.renderRoom(room);
  app.hideOtherRooms(room);
};


app.handleSubmit = () => {

  app.send();
};

app.buildMessageObject = function () {
  var message = {
    username: (window.location.search).split('=')[1],
    text: $('#message').val(),
    roomname: $('#roomSelect').val()
  };
  $('#message').val('');
  app.fetch();
  return message;
};

app.hideOtherRooms = function(room) {
  // room = JSON.stringify(room);
  $('.message').not('.' + room).hide();
  $('.' + room).show();
  if (room === 'lobby') {
    $('.null').show();
  }
};

app.handleUsernameClick = (user) => {
  console.log(user);
  return true;
};

app.init = () => {
  var chatHistory = app.fetch();
  app.alreadyPushed = [];
  app.currentRooms = [];
  app.selectRoom = 'lobby';
  // console.log(chatHistory);
  //app.renderMessage(message);

  $('#chats').on('click', '.username', () => {
    app.handleUsernameClick($('this').val());
  });

  $('#send').off().submit('click', function (e) {
    // e.stopPropagation();
    if ($('#roomSelect').val() === 'newRoom') {
      var newRoomName = $('#message').val();
      app.addRoom(newRoomName);
      $(`#roomSelect option[value=${newRoomName}]`).prop('selected', 'selected');
      $('#message').val('');
    } else {
      app.handleSubmit();
      e.preventDefault();
    }
  });

  $('#roomSelect').change(() => {
    app.selectRoom = $('#roomSelect').val();
    app.hideOtherRooms($('#roomSelect').val());
  });


};

$(document).ready(() => {
  app.init();
  $('#roomSelect option[value=lobby]').prop('selected', 'selected');
  var timer = setInterval(app.fetch, 10000);

  console.log(window.location.search);
  console.log($('#roomSelect').val());

  // $.ajaxPrefilter(function (settings, _, jqXHR) {
  //   jqXHR.setRequestHeader('__type', 'Date');
  //   // jqXHR.setRequestHeader('iso', '2017-07-07');
  // });
});
