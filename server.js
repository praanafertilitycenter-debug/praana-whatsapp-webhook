const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "praana_secret_token_123";

// 1. Meta Webhook Verification Endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully by Meta!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Receive Messages Endpoint
app.post('/webhook', (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    console.log("Incoming webhook update:", JSON.stringify(body, null, 2));
    res.sendStatus(200); 
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000, () => console.log('Webhook server listening on port 3000'));