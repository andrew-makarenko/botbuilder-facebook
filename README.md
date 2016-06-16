# botbuilder-facebook

[Facebook Messenger](https://developers.facebook.com/docs/messenger-platform) bot connector for Microsoft BotBuilder.

## Get started

1. Install botbuilder-facebook
  ``` sh
  npm install botbuilder-facebook --save
  ```

2. Initialize Facebook Bot.

  bot.js:
  ``` javascript
  'use strict'

  const FacebookBot = require('botbuilder-facebook');

  const bot = new FacebookBot({
    pageToken: 'YOUR_FB_PAGE_TOKEN',
    validationToken: 'APP_VERIFICATION_TOKEN'
  });

  bot.add('/', session => {
    session.send('Hello!');
  }

  ```

3. Run express server and listen to messages
  ``` javascript
  'use strict';

  const server     = require('express')();
  const bodyParser = require('body-parser');

  const bot = require('./bot');

  server.use(bodyParser.json());

  server.get('/', (req, res) => {
    bot.botService.validate(req.query, function(err, challenge) {
      if (err) {
        console.error(err);
        res.send('Error, validation failed');
        return;
      }
      console.log('validation successful');
      res.send(200, challenge);
    });
  });

  server.post('/', (req, res) => {
    bot.botService.receive(req.body);
    res.sendStatus(200);
  });

  server.listen(5000, function() {
    console.log(`Bot server listening on port 5000`);
  });

  ```

## License

MIT License

* http://www.opensource.org/licenses/mit-license.php