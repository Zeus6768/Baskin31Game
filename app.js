// Settings
const express = require("express");
const app = express();
const http = require('http');
const port = 15000;
const { WebSocketServer } = require("ws");
const server = new WebSocketServer({ port: 15001 });

app.use(express.static("page"));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/page');

// Routings
app.get('/', (req, res) => {
	const context = { isOpen: isServerOpen() }
	res.render('home.html', context);
});

app.get('/start', (req, res) => {
	const isOpen = isServerOpen();
	if (isOpen) {
		const name = req.query.username;
		clientRoom.push(name);
		res.render('waiting_room.html', { username: name, users: clientRoom });
	} else {
		console.log('서버가 가득 찼습니다.');
		res.redirect('/');
	}
});

app.get('/mainfront', (req, res) => {
	res.render('game_room.html');
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

// WebSocket
let clientRoom = new Array();

function isServerOpen() {
	return clientRoom.length < 5;
}

server.on("connection", (ws, request) => {

	if (clientRoom.length < 5) {

		const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress;
		console.log(`새로운 클라이언트 ${ip} 접속`);
		server.clients.forEach((client) => {
			client.send(clientRoom.toString());
		})

		if (ws.readyState === ws.OPEN) {
			ws.send("배스킨라빈스 서버 접속을 환영합니다.");
		};

		ws.on("message", data => {
			console.log(`Received from user: ${data}`);
		});

		ws.on('error', error => {
			console.log(error);
		});

		ws.on('close', () => { // 작업량 과다하여 작업 안 할 예정.
			console.log(new Date() + '클라이언트 접속 해제', request.socket.remoteAddress);
			server.clients.forEach((client) => {
				client.send(clientRoom.toString());
			})
		})
	}

});