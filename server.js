const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'praana_secret_token_123';
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const APP_PASSWORD = process.env.APP_PASSWORD || 'praana2026';

// 1. Meta Webhook Verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Receive Incoming Messages & Delivery Statuses
app.post('/webhook', (req, res) => {
  if (req.body.object === 'whatsapp_business_account') {
    console.log('Webhook event:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// 3. Universal Send Endpoint (Single & Bulk)
app.post('/api/send', async (req, res) => {
  const { password, phone, templateName, languageCode, parameters } = req.body;

  if (password !== APP_PASSWORD) {
    return res.status(401).json({ error: 'Invalid staff passcode.' });
  }

  // Clean phone number: strip spaces/symbols, auto-prepend 91 if 10 digits
  let cleanPhone = String(phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

  if (cleanPhone.length < 11) {
    return res.status(400).json({ error: `Invalid phone number: ${phone}` });
  }

  const templatePayload = {
    name: templateName,
    language: { code: languageCode || 'en' }
  };

  if (Array.isArray(parameters) && parameters.length > 0) {
    templatePayload.components = [
      {
        type: 'body',
        parameters: parameters.map((val) => ({ type: 'text', text: String(val) }))
      }
    ];
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v26.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: templatePayload
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ success: true, phone: cleanPhone, messageId: response.data.messages[0].id });
  } catch (error) {
    const metaErr = error.response?.data?.error?.message || error.message;
    console.error(`Send error (${cleanPhone}):`, metaErr);
    res.status(500).json({ error: metaErr });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
