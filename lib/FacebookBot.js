'use strict';

const debug      = require('debug')('FacebookBot');
const botbuilder = require('botbuilder');

const FacebookBotService = require('./FacebookBotService');

const DEFAULT_SEND_DELAY = 1000;
const DEFAULT_MAX_SESSION_AGE = 300000;

class FacebookBot extends botbuilder.DialogCollection {

  constructor(options) {
    super();
    this.options =  Object.assign({}, {
      defaultDialogId: '/',
      maxSessionAge: DEFAULT_MAX_SESSION_AGE,
      minSendDelay: DEFAULT_SEND_DELAY,
      userStore: options.userStore || new botbuilder.MemoryStorage(),
      sessionStore: options.sessionStore || new botbuilder.MemoryStorage()
    }, options);


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

  beginDialog(address, dialogId, dialogArgs) {
    if (!address.to) {
      throw new Error('Invalid address passed to FacebookBot.beginDialog().');
    }
    if (!this.hasDialog(dialogId)) {
      throw new Error('Invalid dialog passed to FacebookBot.beginDialog().');
    }
    this.dispatchMessage(this.toFacebookMessage(address), dialogId, dialogArgs);
  }

  handleEvent(event, data) {
    switch (event) {
      case 'message':
        this.dispatchMessage(data, this.options.defaultDialogId, this.options.defaultDialogArgs);
        break;
      default:
        debug('received unhandled event', event);
        break;
    }
  }
  dispatchMessage(message, dialogId, dialogArgs) {
    var onError = err => {
      this.emit('error', err, message);
    };
    var ses = new botbuilder.Session({
      localizer: this.options.localizer,
      minSendDelay: this.options.minSendDelay,
      dialogs: this,
      dialogId: dialogId,
      dialogArgs: dialogArgs
    });
    ses.on('send', reply => {
      this.saveData(msg.to.address, ses.userData, ses.sessionState, () => {
        if (reply) {
          var facebookReply = this.toFacebookMessage(reply);
          facebookReply.to = ses.message.to.address;
          this.botService.send(facebookReply.to, facebookReply.content, onError);
        }
      });
    });
    ses.on('error', err => {
      this.emit('error', err, message);
    });
    ses.on('quit', () => {
      this.emit('quit', message);
    });

    var msg = this.fromFacebookMessage(message);
    this.getData(msg.to.address, (userData, sessionState) => {
      ses.userData = userData || {};
      ses.dispatch(sessionState, msg);
    });
  }
  getData(userId, callback) {
    var ops = 2;
    var userData;
    var sessionState;
    this.options.userStore.get(userId, (err, data) => {
      if (!err) {
        userData = data;
        if (--ops === 0) {
          callback(userData, sessionState);
        }
      }
      else {
        this.emit('error', err);
      }
    });
    this.options.sessionStore.get(userId, (err, data) => {
      if (!err) {
        if (data && (new Date().getTime() - data.lastAccess) < this.options.maxSessionAge) {
          sessionState = data;
        }
        if (--ops === 0) {
          callback(userData, sessionState);
        }
      }
      else {
        this.emit('error', err);
      }
    });
  }
  saveData (userId, userData, sessionState, callback) {
    var ops = 2;
    function onComplete(err) {
      if (!err) {
        if (--ops === 0) {
          callback(null);
        }
      }
      else {
        callback(err);
      }
    }
    this.options.userStore.save(userId, userData, onComplete);
    this.options.sessionStore.save(userId, sessionState, onComplete);
  }
  fromFacebookMessage (msg) {
    return {
      type: msg.type,
      id: msg.messageId ? msg.messageId.toString() : '',
      from: {
        channelId: 'facebook',
        address: msg.from
      },
      to: {
        channelId: 'facebook',
        address: msg.to
      },
      text: msg.text,
      attachments: ((msg.message ? msg.message.attachments : false) || []).map(a => {
        var attachment = {
          contentType: a.type
        };
        if (a.payload && a.payload.url) {
          attachment.contentUrl = a.payload.url;
        }
        if (a.payload && a.payload.coordinates) {
          attachment.coordinates = a.payload.coordinates;
        }
        return attachment;
      }),
      channelData: msg
    };
  }
  toMessageContent (msg) {
    if (!msg) {
      return {};
    }
    if (msg.attachment) {
      //it's already a facebook msg format
      return msg;
    }
    var content = {
      text: msg.text
    };
    if (msg.attachments && msg.attachments.length > 0) {
      if (msg.attachments[0].contentType) {
        content = {
          attachment: {
            type: 'image',
            payload: {
              url: msg.attachments[0].contentUrl
            }
          }
        };
      }
      else if (msg.attachments[0].thumbnailUrl) {
        var elements = [];
        msg.attachments.forEach(function (attachment) {
          var buttons = [];
          if (attachment.actions) {
            attachment.actions.forEach(function (action) {
              var button = {};
              button.title = action.title;
              if (action.url) {
                button.type = 'web_url';
                button.url = action.url;
              }
              else {
                button.type = 'postback';
                button.payload = action.message;
              }
              buttons.push(button);
            });
          }
          var element = {
            title: attachment.title,
            image_url: attachment.thumbnailUrl,
            subtitle: attachment.text
          };
          if (buttons.length > 0) {
            element.buttons = buttons;
          }
          elements.push(element);
        });
        content = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        };
      }
      else if (msg.attachments[0].actions && msg.attachments[0].actions.length > 0) {
        var attachment = msg.attachments[0];
        var buttons = [];
        attachment.actions.forEach(function (action) {
          buttons.push({
            type: 'postback',
            payload: action.message,
            title: action.title
          });
        });
        content = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'button',
              text: msg.text || attachment.text,
              buttons: buttons
            }
          }
        };
      }
    }
    return content;
  }
  toFacebookMessage(msg) {
    return {
      type: msg.type,
      from: msg.from ? msg.from.address : '',
      to: msg.to ? msg.to.address : '',
      content: msg.channelData || this.toMessageContent(msg)
    };
  }
}

module.exports = FacebookBot;
