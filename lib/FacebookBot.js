'use strict';

const debug      = require('debug')('FacebookBot');
const botbuilder = require('botbuilder');
const utils      = require('botbuilder/lib/utils');

const FacebookBotService = require('./FacebookBotService');


class FacebookBot extends botbuilder.UniversalBot {

  constructor(options) {
    super();
    this.botService = new FacebookBotService({
      pageToken: options.pageToken,
      validationToken: options.validationToken
    });

    ['message', 'message_deliveries', 'messaging_optins', 'messaging_postbacks'].forEach(value => {
      this.botService.on(value, message => {
        debug('bot message', JSON.stringify(message));
        this.handleEvent(value, message);
      });
    });
  }

  handleEvent(event, message) {
    switch (event) {
      case 'message':
        this.processMessage(message);
        break;
      default:
        console.log('no handler for this type of message');
    }
  }

  processMessage(rawMessage) {
    console.log('processMessage', rawMessage);
    if (this.handler) {
      var msg = new botbuilder.Message()
        .address({
          channelId: 'facebook',
          user: { id: rawMessage.to },
          bot: { id: 'bot', name: 'Bot' }
        })
      .timestamp()
      .text(rawMessage.text);
      this.handler([msg.toMessage()]);
    }
    return this;
  }

  onEvent(handler) {
    this.handler = handler;
  }

  onError(err) {
    console.log('error', err);
  }

  send(messages, cb) {
    for (var i = 0; i < messages.length; i++) {
      var msg = this.toFacebookMessage(messages[i]);
      this.botService.send(msg, err => {
        if (err) {
          this.onError(err);
        }
        cb(err);
      });
    }
  }
  toFacebookMessage(msg) {
    var recipient = {
      id: msg.address.user.id
    };
    var message = {};
    if (msg.text) {
      message.text = msg.text;
    }
    return {
      recipient,
      message
    };
  }
  /** Called when a UniversalBot wants to start a new proactive conversation with a user. The connector should return a properly formated __address__ object with a populated __conversation__ field. */
  startConversation(address, cb) {
    var adr = utils.clone(address);
    adr.conversation = { id: address.user.id };
    cb(null, adr);
  }
}

module.exports = FacebookBot;
