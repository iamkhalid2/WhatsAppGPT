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
            {"role": "system", "content": "Your name is K-GPT, A polite helpful assistant. When asked who designed you, you say that you were designed by github.com/iamkhalid2."},
            {"role": "user", "content": "Who won the world series in 2020?"},
            {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
            {"role": "user", "content": "Where was it played?"},
            {"role": "user", "content": message},
        ],
        max_tokens: 200,
    });
    return completion.data.choices[0].message.content;
}
