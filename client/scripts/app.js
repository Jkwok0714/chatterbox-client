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
  var d = new Date( (new Date()).getTime() - 1000 * 600);
  var dateISO = d.toISOString();

  // console.log(dateISO);

  $.ajax({
    url: app.server,
    type: 'GET',
    // beforeSend: app.setHeader,
    data: `where={"createdAt":{"$gte":{"__type":"Date","iso":"${dateISO}"}}}`,
    success: function(data) {
      console.log('current messages:', data.results.length);
      var messageArray = data.results;
      for (var message of messageArray) {
        //Fix the room name
        if (message.roomname === null || message.roomname === undefined || message.roomname === 'Lobby') {
          message.roomname = 'lobby';
        } else {
          message.roomname = message.roomname.replace(/\s+/g, '');
          message.roomname = message.roomname.replace('\'', '');
        }
        //Undefined and null users are assigned to 'anon'
        if(message.username === null || message.username === undefined) {
          message.username = 'anon';
        }

        //If it's a new message, push it
        if (!app.alreadyPushed.includes(message.objectId)) {
          app.renderMessage(message);
          app.alreadyPushed.push(message.objectId);
          //If the user's in a new room, add it to room list
          if (!app.currentRooms.includes(message.roomname)) {
            app.addRoom(message.roomname);
          }
        }
      }
    }
  });

  if (app.selectRoom === 'lobby') {
    $('.message').show(200);
  }
  // window.preventDefault;
};

app.renderMessage = (message) => {
  //Don't print null messages
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
  $textBit.addClass(message.username.replace(/\s+/g, '-'));
  $textBit.text(JSON.stringify(message.text));
  //If the user's in the friends list, apply the style
  if (app.friends.indexOf(message.username.replace(/\s+/g, '-')) !== -1) {
    $textBit.addClass('friend');
  }
  $textBit.prependTo($body);
  $textBit.addClass(message.roomname.replace(/\s+/g, ''));
  $innerButton.prependTo($textBit);

  //If the message isn't in the current room, hide it. Lobby shows all messages
  if (message.roomname !== app.selectRoom && !app.selectRoom === 'lobby') {
    console.log('hid something in room', message.roomname);
    $textBit.hide(100);
  } else {
    $textBit.show(100);
  }

  //If the poster's name matches up with username, highlight it
  if (message.username === (window.location.search).split('=')[1]) {
    $textBit.addClass('me');
  }
};

app.renderRoom = (room) => {
  var $target = $('#roomSelect');
  var $bit = $(`<option value = "${room}">${room}</option>`);
  $bit.appendTo($target);
};

app.addRoom = (room) => {
  // Don't add null rooms or lobby
  if (room === null || room === 'lobby') {
    return;
  }
  // room = JSON.stringify(room);
  app.currentRooms.push(room);
  app.renderRoom(room);
  app.hideOtherRooms(room);
};


app.handleSubmit = () => {
  app.send();
  app.fetch();
};

app.buildMessageObject = function () {
  var message = {
    username: (window.location.search).split('=')[1],
    text: $('#message').val(),
    roomname: $('#roomSelect').val()
  };
  //Wipe the message box
  $('#message').val('');
  return message;
};

app.hideOtherRooms = function(room) {
  //If it's lobby, show all. Else, hide stuff not selected
  if (room === 'lobby') {
    $('.message').show(200);
  } else {
    $('.message').not('.' + room).hide();
    $('.' + room).show(200);
  }
};

app.handleUsernameClick = (user) => {
  var friendName = user.replace(/\s+/g, '-');
  app.friends.push(friendName);
  $(`.${friendName}`).addClass('friend');
};

app.init = () => {
  app.alreadyPushed = [];
  app.currentRooms = [];
  app.friends = [];
  app.selectRoom = 'lobby';
  app.fetch();

  $('#chats').on('click', '.username', function () {
    app.handleUsernameClick($(this).text());
  });

  $('#send').off().submit('click', function (e) {
    if ($('#roomSelect').val() === 'newRoom') {
      var newRoomName = $('#message').val().replace(/\s+/g, '-');
      app.addRoom(newRoomName);
      $(`#roomSelect option[value=${newRoomName}]`).prop('selected', 'selected');
      $('#message').val('');
      $('#message').attr('placeholder', 'Message');
      e.preventDefault();
    } else {
      app.handleSubmit();
      e.preventDefault();
    }
  });

  $('#roomSelect').change(() => {
    if ($('#roomSelect').val() !== 'newRoom') {
      app.selectRoom = $('#roomSelect').val();
      app.hideOtherRooms($('#roomSelect').val());
    } else {
      $('#message').attr('placeholder', 'New room name');
    }
  });

  var timer = setInterval(app.fetch, 5000);

};

$(document).ready(() => {
  $('#roomSelect option[value=lobby]').prop('selected', 'selected');
  app.init();

  console.log(window.location.search);
  console.log($('#roomSelect').val());
  $('#roomSelect').trigger('change');
});
