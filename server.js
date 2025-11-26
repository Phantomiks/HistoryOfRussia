// server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: http });
const bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.json());

let users = {}; // userId: {points:0,achievements:[]}

// REST API для сохранения результатов
app.post('/result', (req,res)=>{
  const {userId, points} = req.body;
  if(!users[userId]) users[userId]={points:0,achievements:[]};
  users[userId].points += points;
  res.json({status:'ok', total: users[userId].points});
});

// WebSocket для дуэлей
wss.on('connection', ws=>{
  ws.on('message', msg=>{
    const data = JSON.parse(msg);
    console.log("WS",data);
    // Здесь будем синхронизировать игроков
  });
});

http.listen(3000,()=>console.log("Server running on 3000"));
