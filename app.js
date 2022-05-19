const express = require("express");
const app = express();
const http = require('http')
const port = 15000;

app.use(express.static("page"))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs')
app.set('views', __dirname + '/page');

app.get('/', (req, res) => {
	res.render('index.html');
})

app.get('/start', (req, res) => {
	res.render('standby.html');
})

app.get('/mainfront', (req, res) => {
	res.render('mainfront.html');
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})