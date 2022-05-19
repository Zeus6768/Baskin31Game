// Settings
const express = require("express");
const app = express();
const http = require('http');
const port = 15000;
const { WebSocketServer } = require("ws")
const server = new WebSocketServer({ port: 15001 });

app.use(express.static("page"))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs')
app.set('views', __dirname + '/page');

// Routings
app.get('/', (req, res) => {
	const context = { checkClientRoom: checkClientRoom() };
	res.render('index.html', context);
})

app.get('/check', (req, res) => {
	const result = checkClientRoom();
	if (result) {
		res.redirect('/start');
	} else {
		console.log('서버가 가득 찼습니다.');
		res.redirect('/');
	}
})

app.get('/start', (req, res) => {
	const name = req.get('username');
	const result = checkClientRoom();
	if (result) {
		res.render('standby.html', { username: '신재우' });
	} else {
		console.log('서버가 가득 찼습니다.');
		res.redirect('/');
	}
})

app.get('/mainfront', (req, res) => {
	res.render('mainfront.html');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

// WebSocket
let clientRoom = [];

server.on("connection", (ws, request) => {

	if (clientRoom.length < 5) {
		const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress
		clientRoom.push(ip);
		console.log(`새로운 클라이언트 ${clientRoom.length} 접속`);

		if (ws.readyState === ws.OPEN) {
			ws.send("배스킨라빈스 서버 접속을 환영합니다.");
		}

		ws.on("message", data => {
			console.log(`Received from user: ${data}`);
			ws.send(`Received ${data}`);
		})
	}

})

function checkClientRoom() {
	return clientRoom.length < 5;
}