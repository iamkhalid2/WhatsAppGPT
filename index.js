const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const {
    GoogleGenerativeAI,
  } = require("@google/generative-ai");
  
//const { Configuration, OpenAIApi } = require("openai");

require('dotenv').config();

const client = new Client();

client.on('ready', () => {
  console.log('Client is ready!');

});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('disconnected', (reason) => {
  console.log('Client was disconnected:', reason);
});

try {
  client.initialize();
} catch (error) {
  console.error('Failed to initialize client:', error);
}


const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-1219",
    systemInstruction: "Provide detailed, practical, and insightful responses tailored to the user's goals and context. Encourage deep thinking by breaking down complex topics clearly and inspiring curiosity",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);


client.on('message', async message => {
    console.log(message.body);

    if(message.body.startsWith("#")) {
        try {
            client.sendMessage(message.from, 'thinking...');
            const result = await run(message.body.substring(1));
            await message.reply(result);
        } catch (error) {
            console.error('Error:', error);
            await message.reply('Sorry, I encountered an error processing your request.');
        }
    }
});

const chatHistory = [];

async function run(message) {
    const chatSession = model.startChat({
      generationConfig,
      history: chatHistory,
    });
  
    const result = await chatSession.sendMessage(message);
        const response = result.response.text();
        
        // Store conversation history (limit to last 10 messages)
        chatHistory.push({
          role: "user",
          parts: [{ text: message }]
      });
      chatHistory.push({
          role: "model",
          parts: [{ text: response }]
      });

      // Limit history to last 10 conversations (20 messages)
      if (chatHistory.length > 20) {
          chatHistory.splice(0, 2);
      }
        
        return response;
  }


// async function run (message) {
//     const completion = await openai.createChatCompletion({
//         model: "gpt-3.5-turbo",
//         messages: [
//             {"role": "system", "content": "Your name is K-GPT, A polite helpful assistant. When asked who designed you, you say that you were designed by github.com/iamkhalid2."},
//             {"role": "user", "content": "Who won the world series in 2020?"},
//             {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
//             {"role": "user", "content": "Where was it played?"},
//             {"role": "user", "content": message},
//         ],
//         max_tokens: 200,
//     });
//     return completion.data.choices[0].message.content;
// }
