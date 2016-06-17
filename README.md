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
  });

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

## Message examples
All examples is done using builder.Message object, but you can use a plain JS object as well.
Something like this:
``` javascript
session.send({
  attachments: [{
    thumbnailUrl: "http://petersapparel.parseapp.com/img/item101-thumb.png",
    title: "Classic Grey T-Shirt",
    titleLink: "https://petersapparel.parseapp.com/view_item?item_id=101",
    text: "Soft white cotton t-shirt is back in style"
  }]
});
```
1. Message with image attachment
``` javascript
  var msg = new builder.Message()
    .addAttachment({
      contentUrl: "http://www.theoldrobots.com/images62/Bender-18.JPG",
      contentType: "image/jpeg"
    });
  return session.send(msg);
```
<img src="http://content.screencast.com/users/Makaron/folders/Jing/media/d2b267ad-4c61-407f-ad56-44647f31a03c/00000065.png" width="256" alt="example">

2. Generic template
``` javascript
var msg = new builder.Message()
  .addAttachment({
      thumbnailUrl: "http://petersapparel.parseapp.com/img/item101-thumb.png",
      title: "Classic Grey T-Shirt",
      titleLink: "https://petersapparel.parseapp.com/view_item?item_id=101",
      text: "Soft white cotton t-shirt is back in style"
  });
```
<img src="http://content.screencast.com/users/Makaron/folders/Jing/media/465f5429-cfd1-4c6e-8de0-b88f61e7134d/00000066.png" width="256" alt="example">

3. Generic template with Call-To-Action items and bubbles
``` javascript
var msg = new builder.Message();
msg.addAttachment({
    title: "Classic White T-Shirt",
    text: "Soft white cotton t-shirt is back in style",
    thumbnailUrl: "http://petersapparel.parseapp.com/img/item100-thumb.png",
    actions: [
        { title: "View Item", url: "https://petersapparel.parseapp.com/view_item?item_id=100" },
        { title: "Buy Item", message: "buy:100" },
        { title: "Bookmark Item", message: "bookmark:100" }
    ]
});
msg.addAttachment({
    title: "Classic Grey T-Shirt",
    text: "Soft gray cotton t-shirt is back in style",
    thumbnailUrl: "http://petersapparel.parseapp.com/img/item101-thumb.png",
    actions: [
        { title: "View Item", url: "https://petersapparel.parseapp.com/view_item?item_id=101" },
        { title: "Buy Item", message: "buy:101" },
        { title: "Bookmark Item", message: "bookmark:101" }
    ]
});
```
<img src="http://content.screencast.com/users/Makaron/folders/Jing/media/f82c9c43-b022-439d-87a2-211727d32909/00000067.png" width="256" alt="example">

4. Receipt or any other custom message template
``` javascript
var msg = new builder.Message();
msg.setChannelData({
    "attachment":{
        "type":"template",
        "payload":{
            "template_type":"receipt",
            "recipient_name":"Stephane Crozatier",
            "order_number":"12345678902",
            "currency":"USD",
            "payment_method":"Visa 2345",
            "order_url":"http://petersapparel.parseapp.com/order?order_id=123456",
            "timestamp":"1428444852",
            "elements":[
                {
                    "title":"Classic White T-Shirt",
                    "subtitle":"100% Soft and Luxurious Cotton",
                    "quantity":2,
                    "price":50,
                    "currency":"USD",
                    "image_url":"http://petersapparel.parseapp.com/img/whiteshirt.png"
                },
                {
                    "title":"Classic Gray T-Shirt",
                    "subtitle":"100% Soft and Luxurious Cotton",
                    "quantity":1,
                    "price":25,
                    "currency":"USD",
                    "image_url":"http://petersapparel.parseapp.com/img/grayshirt.png"
                }
            ],
            "address":{
                "street_1":"1 Hacker Way",
                "street_2":"",
                "city":"Menlo Park",
                "postal_code":"94025",
                "state":"CA",
                "country":"US"
            },
            "summary":{
                "subtotal":75.00,
                "shipping_cost":4.95,
                "total_tax":6.19,
                "total_cost":56.14
            },
            "adjustments":[
                {
                    "name":"New Customer Discount",
                    "amount":20
                },
                {
                    "name":"$10 Off Coupon",
                    "amount":10
                }
            ]
        }
    }
});
```
<img src="http://content.screencast.com/users/Makaron/folders/Jing/media/6806b527-dc0f-44d6-a5d4-494d29fe889d/00000068.png" width="256" alt="example">

## License

MIT License

* http://www.opensource.org/licenses/mit-license.php