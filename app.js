const express = require("express"); //express 모듈 불러오기
const socket = require('socket.io'); //soket.io 모듈 불러오기
const http = require('http'); //node.js 기본 내장 모듈 불러오기
const app = express(); //express 객체 생성
const server = http.createServer(app) // express http server 생성
const io = socket(server) // 생성된 서버를 socket.io에 바인딩
const port = 15000; //접속포트번호

app.use(express.static("page"))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/page');

///////////
// 라우팅 //
///////////
app.get('/', (_, res) => {
	res.render('start.html', { userCount: getUserCount() });
})

app.get('/ready', (req, res) => {
	const username = req.query.username;
	if (username === '') {
		res.send(
			`<script>
				alert('이름을 입력해주세요.');
				location.href = '/';
			</script>`
		);
	} else if (includeUser(username)) {
		res.send(
			`<script>
				alert('이미 접속한 유저의 이름입니다.');
				location.href = '/';
			</script>`
		);
	} else {
		res.render('ready.html', { username: username });
	}
})

app.get('/game', (req, res) => {
	const username = req.query.username;
	res.render('game.html', { username: username });
})


///////////
// 웹소켓 //
///////////
const MAXUSER = 5;
let usersInReady = new Array();
let usersInGame = new Array();
const usersInServer = () => usersInReady.concat(usersInGame);
const gameData = new Object();

io.on('connection', socket => {
	const req = socket.request;
	const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress.substr(7);

	socket.on('userInReady', data => {
		if (getUserCount() < MAXUSER) {
			const user = {
				id: socket.id,
				ip: ip,
				name: data.username,
				inGame: false
			}
			usersInReady.push(user);
			console.log(data.username, '님이 접속했습니다. 대기중 유저 수 :', getUserCount());
		}
		io.emit('usersInServer', usersInServer());
	});

	socket.on('userInGame', username => {
		if (usersInGame.length < MAXUSER) {
			const user = {
				id: socket.id,
				ip: ip,
				name: username,
				inGame: true
			}
			usersInGame.push(user);
			console.log(username, '님이 게임을 시작했습니다. 게임중 유저 수 :', getUserCount());	
		}
		io.emit('usersInServer', usersInServer());
		
		if (usersInGame.length === MAXUSER) {
			console.log('게임이 시작되었습니다');
			const data = {
				message: '게임이 시작되었습니다.',
				gameActive: true,
				firstUser: usersInGame[0].name
			}
			io.emit('gameStart', data);
		} else {
			console.log('유저가 모두 들어오지 않아 게임을 진행할 수 없습니다.');
			io.emit('gameStart', { message: '유저가 모두 들어오지 않아 게임을 진행할 수 없습니다.', gameActive: false });
		}
	})

	socket.on('submitNumber', number => {
		io.emit('broadcastNumber', number)
	})

	socket.on('disconnect', () => {
		const iw = usersInReady.findIndex(user => user.id === socket.id);
		const ig = usersInGame.findIndex(user => user.id === socket.id);
		if (iw !== -1) {
			console.log(usersInReady[iw].name, '님이 대기실에서 나갔습니다.');
			usersInReady = usersInReady.filter(user => user.id !== socket.id);
		} else if (ig !== -1) {
			console.log(usersInGame[ig].name, '님이 게임에서 나갔습니다.' );
			usersInGame = usersInGame.filter(user => user.id !== socket.id);
			io.emit('gameStart', { message: '유저가 모두 들어오지 않아 게임을 진행할 수 없습니다.', gameActive: false });
		} else {
			console.log(ip, socket.id, '올바르지 않은 접속입니다.')
		}
		console.log('users in server:', usersInServer());
		io.emit('usersInServer', usersInServer());
	});
})

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});


//////////////
// 전역 함수 //
//////////////
function getUserCount() {
	return usersInServer().length;
}

function includeUser(username) {
	return usersInServer().find(user => user.name === username);
}