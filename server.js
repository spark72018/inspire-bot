const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.get('/auth', function(req, res) {
  var data = {form: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code
  }};
  request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // Get an auth token
      var token = JSON.parse(body).access_token;

      // Get the team domain name to redirect to the team URL after auth
      request.post('https://slack.com/api/team.info', {form: {token: token}}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          // if(JSON.parse(body).error == 'missing_scope') {
          //   res.send('NavBuddy has been added to your team!');
          // } else {
            var team = JSON.parse(body).team.domain;
            res.redirect('http://'+team+'.slack.com');
          //}
        }
      });
    }
  })
});

app.post('/', (req, res) => {
    console.log('req is', req);
    const options = {
        url: 'http://apimk.com/motivationalquotes?get_quote=yes',
        headers: {
            'content-type': 'application/json'
        }
    }
    
    request.get(options, (err, response, body) => {
        if(err) console.log('error is', err)
        const obj = JSON.parse(response.body);
        console.log(obj[0]);
        const quoteObj = {
            "response_type": "in_channel",
            "text" : '\"' + obj[0].quote + '\"' + '    -' + obj[0].author_name 
        }
        res.send(quoteObj);
    });
});


let port = process.env.PORT || 3001;

app.listen(port, () => console.log(`listening on ${port}`));