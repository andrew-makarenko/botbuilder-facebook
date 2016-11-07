'use strict';

const debug = require('debug')('FacebookBotService');
const events = require('events');
const request = require('request');

class FacebookBotService extends events.EventEmitter {

  constructor(options) {
    super();
    this.page_token = options.pageToken;
    this.validation_token = options.validationToken;
  }

  send(sender, message, errorHandler) {
    debug('send', sender, message);
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {
        access_token: this.page_token
      },
      method: 'POST',
      json: {
        recipient: {
          id: sender
        },
        message: message
      }
    }, function (error, response) {
      if (error) {
        debug('Error sending message: ', error);
        errorHandler(error);
      }
      else if (response.body.error) {
        debug('Error: ', response.body.error);
        errorHandler(response.body.error);
      }
    });
  }

  receive(message) {
    debug('receive', JSON.stringify(message));
    var messaging_events = message.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
      var event = message.entry[0].messaging[i];
      var sender = event.recipient.id;
      var recipient = event.sender.id;
      if (event.message && event.message.text) {
        var text = event.message.quick_reply && event.message.quick_reply.payload ? event.message.quick_reply.payload : event.message.text;
        this.emit('message', {
          messageId: event.message.mid,
          text: text,
          to: recipient,
          from: sender
        });
      }
      else if (event.postback && event.postback.payload) {
        this.emit('message', {
          messageId: null,
          text: event.postback.payload,
          to: recipient,
          from: sender
        });
      } else if (event.message && event.message.attachments && event.message.attachments.length) {
        this.emit('message', {
          messageId: event.message.mid,
          message: event.message,
          to: recipient,
          from: sender,
          text: ''
        });
      }
    }
  }

  validate(params, callback) {
    debug('validate', JSON.stringify(params));
    if (params) {
      var hub_verify_token = params.hub ? params.hub.verify_token : params['hub.verify_token'];
      var hub_challenge = params.hub ? params.hub.challenge : params['hub.challenge'];
      if (hub_verify_token === this.validation_token) {
        var challenge = Number(hub_challenge);
        callback(null, challenge);
        return;
      }
    }
    callback(new Error('validation failed'));
  }
}

module.exports = FacebookBotService;
