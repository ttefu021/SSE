const express = require('express');
const cors = require('cors');
const app = express();
const prompt = require('prompt-sync')({sigint: true});

app.use(cors());
app.use(express.json());

let response;
let interval;
let id;
let connectionCounter = 0;
let cancel

app.post('/generate', (req, res_gen) => {
  console.log("Starting process");

  const clientData = {
    cellphoneNumber: '07* **** *21',
    correlationId: "e8441f41-84a8-4fb3-be4a-b33b08d2cf58"
  };

  res_gen.json(clientData);
})

app.get('/verify/:correlationId', (req, res) => {
  id = req.params.correlationId;
  console.log(`Client ${id} connected and waiting for notifications`)

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  response = res;

  connectionCounter++;
  console.log("Clients connected: " + connectionCounter);
  
   // Listen for client disconnect
   res.on('close', () => {
    console.log("Client disconnected. Closing the connection.");
    clearInterval(interval);
    connectionCounter--;
    console.log("Clients connected: " + connectionCounter);
  });
  
  //Listen for console input
  let scenario = prompt('Enter scenario number: ');
  scenario = Number(scenario);

  if (scenario === 1) {
    sendMessages([
      "Pending",
      "sms sent",
      "Delivered",
      "Approved",
      "DISCONNECT"
    ], res, false);
  } else if (scenario === 2) {
    sendMessages([
      "Pending",
      "sms sent",
      "Delivered",
      "rejected",
      "DISCONNECT"
    ], res, false);
  } else if (scenario === 3) {
    sendMessages([
      "sms sent",
      "sms failed",
      "DISCONNECT"
    ], res, false);
  } else if (scenario === 4) {
    sendMessages([
      "Pending",
      "Contact number updated in last 14 days",
      "DISCONNECT"
    ], res, false)
  } else if (scenario === 5) {
    sendMessages([
      "Pending",
      "did not request",
      "DISCONNECT"
    ], res, false)
  } else if (scenario === 6) {
    sendMessages([
      "Pending",
      "sms sent",
      "Delivered",
      "no reponse"
    ], res, true)
  }
});

app.get('/cancel/:correlationId', (req, res) => {
  console.log("Hello");
  id = req.params.correlationId;
  clearInterval(interval);
  console.log(`Cancelling client ${id} connection`);
  
  sendMessages([
    "Cancelled",
    "Disconnect"
  ], response, false)
})

function sendMessages(messages, res, delay) {
  let index = 0;
  interval = setInterval(() => {
    if (index < messages.length) {
      console.log("Sending data: ", messages[index]);
      res.write(`id: 1\n`);
      res.write(`event: ${id}\n`);
      res.write(`data: ${messages[index]}\n\n`);

      if (delay === true && messages[index] === "Delivered") {
        console.log("Pausing for 35 seconds");
        clearInterval(interval);
        interval = setInterval(sendMessages, 35000, messages, res)
      } else {
        index++
      }
    } else {
      clearInterval(interval);
      console.log("Closing connection with client");
      res.end();
    }
  }, 3000);
}
    
app.listen(3000, '0.0.0.0', () => {
  console.log('Server is running on http://localhost:3000');
});
