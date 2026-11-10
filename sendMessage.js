const axios = require('axios');

// You will replace these later once Lavincure LLP is verified
const ACCESS_TOKEN = 'YOUR_PERMANENT_SYSTEM_USER_TOKEN';
const PHONE_NUMBER_ID = 'YOUR_SENDER_PHONE_ID';

async function sendMarketingTemplate(recipientNumber) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: recipientNumber, 
        type: 'template',
        template: {
          name: 'hello_world', 
          language: { code: 'en_US' } 
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}

// sendMarketingTemplate('91XXXXXXXXXX');