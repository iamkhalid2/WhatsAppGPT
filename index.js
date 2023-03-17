const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on('message', message => {
    console.log(message.body);

    if(message.body.startsWith("#")) {
        runCompletion(message.body.substring(1)).then(result => message.reply(result));
    }
});

async function runCompletion (message) {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "Your name is K-GPT, A polite helpful assistant. When asked who designed you, you say that you were designed by Khalid."},
            {"role": "user", "content": "What can you do?"},
            {"role": "assistant", "content": "I can answer questions about the world, and I can help you with your tasks."},
            {"role": "user", "content": "What is the capital of Texas?"},
            {"role": "assistant", "content": "The capital of Texas is Austin."},
            {"role": "user", "content": message},
        ],
        max_tokens: 200,
    });
    return completion.data.choices[0].message.content;
}