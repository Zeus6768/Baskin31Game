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

app.get('/', (req, res) => {

	res.render('start.html');
})

app.get('/start', (req, res) => {

	res.render('ready.html');

})

app.get('/ready', (req, res) => {
	if(buffer==true){
	res.render('game.html')
	}
})

app.get('/game', (req, res) => {
	res.render('game.html');
})

var i = 0
var namearr = new Array() //넘겨줄 이름 저장 배열
var buffer = new Boolean(false)
var nameid = new Array()
var user = {
	id: '',
	name : ''
}
io.sockets.on('connection', socket => {
	socket.on('enter', data => { // 새로운 접속자가 이름을 입력할 시 다른 소켓에게 알려줌
		var user = {
			id: socket.id,
			name : data.msg
		}
		//console.log(userid)
		if (i < 4) {
			console.log(data.msg + '님이 접속했습니다.')
			namearr.push(user)
			i = i + 1
			console.log(i)
		}
		else if (i = 4) {
			console.log(data.msg + '님이 접속했습니다.')
			namearr.push(user)
			i = i + 1
			console.log(i)
			console.log('접속 인원 충족')
		}

	})
	io.emit('newUser', { name: namearr })
	console.log(namearr)
	if(i == 5){
		buffer = true
	}

	socket.on('disconnect', () => {
	})

})

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
})
