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

app.use(cors({
    origin: true, //['http://localhost:3001','http://192.168.0.23:3001','http://192.168.0.10:3000','http://192.168.0.21:3000','http://192.168.0.15:3000','http://localhost:3000'], // React 앱의 origin
    credentials: true, // 세션 쿠키를 전송하기 위해 필요
    methods: ['GET', 'POST', 'PUT', 'DELETE']

}));

app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false, // 세션 정보가 수정되지 않은 경우에도 저장 하는지 여부 결정 (수정된 경우에만 저장)
    saveUninitialized: true, // 모든 세션 정보 저장
    credentials : true,

    // 세션의 유지 시간은 기본값은 브라우저 종료시까지 유지
    // cookie:{
    //     maxAge: 5000 // 단위는 밀리세컨드
    // }
    cookie: {
        // domain: '192.168.0.23', //['192.168.0.23','192.168.0.10','192.168.0.15','192.168.0.21','http://localhost:3001'],
        // path:'/',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
        secure: false, // HTTPS를 통해 전송하는 경우 true로 설정
        httpOnly: true, // JavaScript에서 세션 쿠키에 접근하지 못하도록 설정
    }
}));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/', express.static(path.join(__dirname, 'public', 'build')));
console.log(__dirname)
oracledb.autoCommit = true;

oracledb.initOracleClient({ libDir: './instantclient_21_13' });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.redirect('/home')
});
app.get('/like/:id', async (req, res) => {
    if(!req.session.loggedInUserId){
        req.session.loggedInUserId=req.query.user_id
    }
    // const user_id = req.session.loggedInUserId;

    let board_code = req.params.id;
    // console.log(board_code)
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // console.log(`board_code: ${board_code}`);
        // 조회수 증가 처리
        const result = await conn.execute(
            `UPDATE BOARDER SET likes = likes + 1 WHERE boarder_code = :board_code`,
            [board_code]
        );
        console.log(result)

        res.json({
            result:"ok"
        })
    } catch (err) {
        console.error(err);
        res.status(500).send('서버에러');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }



});
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`); // 게시판 서버 시작
});

app.set('view engine', 'ejs');

// const WEB_SERVER_HOME = '../HOME/html';
// app.use('/', express.static(WEB_SERVER_HOME + '/'));

// selectDatabase();

// async function selectDatabase() {
//
//     // console.log("!!!!! db conenction(여기가 제일먼저) !!!!!");
//
//     // await: 비동기 수행시 해당 명령어가 완료될때까지 기다려주는 키워드
//     let connection = await oracledb.getConnection(dbConfig);
//
//     let binds = {};
//     let options = {
//         // 쿼리의 결과가 객체 형식으로 반환
//         outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
//     };
//     // console.log(binds)
//     // console.log(options)
//     // console.log(connection)
//     // console.log(selectDatabase)
//     // console.log("!!!!! db select(여기가3번째) !!!!!");
//
//     let result = await connection.execute("select * from users", binds, options);
//
//     // console.log(result)
//     // console.log("!!!!! db response(여기가4번째)` !!!!!");
//     // console.log(result.rows); // 여기가 5번째
//     // console.log(result.rows[0]); // 여기가 6번째 김철수씨 정보
//     // // 이름 열을 접근하려면? 배열일 경우
//     // console.log(result.rows[0][3]);
//     // console.log(result.rows[0].NAME); // 여기가 7번째 김철수씨 이름
//
//     // console.log("!!!!! db close(여기가 마지막) !!!!!");
//     await connection.close();
//
// }

// app.get('/home',(req,res)=>{
//     res.render('home')
// })








app.use('/svboardmain', require('./routes/boardmain')); // 게시판 메인 페이지 렌더링
app.use('/svcreate', require('./routes/create')); // 글 작성 페이지 렌더링
app.use('/svboarddetail', require('./routes/boarddetail')) // 상세 페이지 렌더링
app.use('/svboardedit', require('./routes/boardedit')) // 수정 페이지 렌더링
app.use('/svboarddelete', require('./routes/boarddelete')) // 삭제 처리
app.use('/svaddcomment', require('./routes/addcomment')) // 댓글 추가 렌더링
app.use('/svdeletecomment', require('./routes/deletecomment')) // 댓글 삭제 렌더링
app.use('/sveditcomment', require('./routes/editcomment')) // 댓글 수정 렌더링
app.use('/svlogin', require('./routes/login')) // 로그인 페이지 렌더링
app.use('/svlogout', require('./routes/logout')) // 로그아웃
app.use('/svloginFail', require('./routes/loginFail')) // 로그인 실패
app.use('/svsignup', require('./routes/signup')) // 회원가입
app.use('/svidcheck', require('./routes/IdCheck')) // 회원가입 시 아이디 중복 체크
app.use('/svmain', require('./routes/main')) // 임시 메인페이지
app.use('/svfestivalselect', require('./routes/festivalselect')) // 임시 메인페이지


const { exec } = require('child_process');

// Python 실행 파일 경로에 큰따옴표를 사용
exec('"C:\\Users\\EZEN\\anaconda3\\python.exe" ./python/festival.py', (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
// AWS 환경에서 실행시 아래 내역 수정
// exec('/usr/bin/python3 ./festival.py', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`exec error: ${error}`);
//         console.error(`stderr: ${stderr}`);
//         return;
//     }
//     console.log(`stdout: ${stdout}`);
// });