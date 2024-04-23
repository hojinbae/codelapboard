const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', (req, res)=>{
   res.render('login');
});


router.post('/', async(req, res)=>{
    console.log("::::::insert")
    const { id, password } = req.body;
    console.log("이름 비번",id,password)
    // 사용자 인증작업
    const authenticatedUser = await varifyID(id, password);
    console.log("들어옴?", authenticatedUser)
    // 인증 성공시 보드메인으로 리다이렉트
    if (authenticatedUser){
        req.session.loggedIn = true;
        req.session.loggedInUserId = authenticatedUser.id; // 사용자 테이블의 ID (Primary key) 저장
        req.session.loggedInUserName = authenticatedUser.name;           // 사용자 테이블의 userID
        req.session.loggedInUserNickName = authenticatedUser.nickname; // 사용자 테이블에서 실제 이름 저장

        res.json({
            loggedIn:req.session.loggedIn,
            loginId:req.session.loggedInUserId
        })
        // res.redirect(`/boardmain`);
    } else {
        res.render('loginFail', { id });
    }
});

async function varifyID(id, password) {
    let connection;

    try{
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            'SELECT * FROM users WHERE ID = :id AND password = :password',
            { id, password }
        );

        if (result.rows.length > 0) {
            console.log('로그인성공', result.rows)
            return {
                id: result.rows[0][0],
                name: result.rows[0][2],
                nickname: result.rows[0][5]

            };
        } else {
            console.log("로그인실패")
           return null;
        }
    } catch (error) {
        console.error('오류 발생: ', error);
        return null;
    } finally{
        if(connection){
            await connection.close();
        }
    }
}

module.exports = router;