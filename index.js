const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig');
const session = require('express-session');
const path = require("path");
const cors = require("cors")

const app = express();
const port = 3000;


app.use(express.static(__dirname+'\\public'));
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false, // 세션 정보가 수정되지 않은 경우에도 저장 하는지 여부 결정 (수정된 경우에만 저장)
    saveUninitialized: true, // 모든 세션 정보 저장
    // 세션의 유지 시간은 기본값은 브라우저 종료시까지 유지
    // cookie:{
    //     maxAge: 5000 // 단위는 밀리세컨드
    // }
}));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
console.log(__dirname)
oracledb.autoCommit = true;

oracledb.initOracleClient({ libDir: '../instantclient_21_13' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/home')
});

app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`); // 게시판 서버 시작
});

app.set('view engine', 'ejs');

// const WEB_SERVER_HOME = '../HOME/html';
// app.use('/', express.static(WEB_SERVER_HOME + '/'));

selectDatabase();

async function selectDatabase() {

    // console.log("!!!!! db conenction(여기가 제일먼저) !!!!!");

    // await: 비동기 수행시 해당 명령어가 완료될때까지 기다려주는 키워드
    let connection = await oracledb.getConnection(dbConfig);

    let binds = {};
    let options = {
        // 쿼리의 결과가 객체 형식으로 반환
        outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
    };
    // console.log(binds)
    // console.log(options)
    // console.log(connection)
    // console.log(selectDatabase)
    // console.log("!!!!! db select(여기가3번째) !!!!!");

    let result = await connection.execute("select * from users", binds, options);

    // console.log(result)
    // console.log("!!!!! db response(여기가4번째)` !!!!!");
    // console.log(result.rows); // 여기가 5번째
    // console.log(result.rows[0]); // 여기가 6번째 김철수씨 정보
    // // 이름 열을 접근하려면? 배열일 경우
    // console.log(result.rows[0][3]);
    // console.log(result.rows[0].NAME); // 여기가 7번째 김철수씨 이름

    // console.log("!!!!! db close(여기가 마지막) !!!!!");
    await connection.close();

}

app.get('/home',(req,res)=>{
    res.render('home')
})







app.use(cors());
app.use('/boardmain', require('./routes/boardmain')); // 게시판 메인 페이지 렌더링
app.use('/create', require('./routes/create')); // 글 작성 페이지 렌더링
app.use('/boarddetail', require('./routes/boarddetail')) // 상세 페이지 렌더링
app.use('/boardedit', require('./routes/boardedit')) // 수정 페이지 렌더링
app.use('/boarddelete', require('./routes/boarddelete')) // 삭제 처리
// app.use('/addComment', require('./routes/addComment')) // 댓글 추가 렌더링
// app.use('/deleteComment', require('./routes/deleteComment')) // 댓글 삭제 렌더링
// app.use('/editComment', require('./routes/editComment')) // 댓글 수정 렌더링
app.use('/login', require('./routes/login')) // 로그인 페이지 렌더링
app.use('/logout', require('./routes/logout')) // 로그아웃
app.use('/loginFail', require('./routes/loginFail')) // 로그인 실패
app.use('/signup', require('./routes/signup')) // 회원가입
app.use('/idcheck', require('./routes/IdCheck')) // 회원가입 시 아이디 중복 체크
app.use('/main', require('./routes/main')) // 임시 메인페이지