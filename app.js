const express = require("express"); //express 모듈 불러오기
const socket = require('socket.io') //soket.io 모듈 불러오기
const http = require('http'); //node.js 기본 내장 모듈 불러오기
const app = express(); //express 객체 생성
const server = http.createServer(app) // express http server 생성
const io = socket(server) // 생성된 서버를 socket.io에 바인딩
const port = 15000; //접속포트번호

app.use(express.static("page")) //page dir 이용

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs')
app.set('views', __dirname + '/page');

app.get('/', (_, res) => {
	res.render('start.html', { userCount: getUserCount() });
})

app.get('/ready', (req, res) => {
	const username = req.query.username;
	res.render('ready.html', { username: username });
})

app.get('/game', (req, res) => {
	const username = req.query.username;
	res.render('game.html', { username: username });
})

const MAXUSER = 5;
const usersWaiting = new Array();
const usersInGame = new Object();

io.on('connection', socket => {
	const req = socket.request;
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(ip.substr(7));

	socket.on('userIn', data => { // 새로운 접속자가 이름을 입력할 시 다른 소켓에게 알려줌
		if (usersWaiting.length < MAXUSER) {
			usersWaiting.push(data.username);
			console.log(data.username + '님이 접속했습니다. 현재 유저 수 :', usersWaiting.length);
			console.log(usersWaiting);
		}
		io.emit('usersWaiting', usersWaiting);
	});

	socket.on('disconnect', () => {});
})

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

function getUserCount() {
	return usersWaiting.length;
}