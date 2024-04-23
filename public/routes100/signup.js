const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

// 회원가입 폼을 렌더링하는 라우트
router.get('/',(req, res)=>{
    res.render('signup');
});

// 기존 회원가입 요청을 처리하는 라우트
router.post('/', async (req, res)=>{
    const {id, name, userID, password} = req.body;
    let conn;
    try{
       const conn = await oracledb.getConnection(dbConfig);
       const result = await conn.execute(
           `INSERT INTO Team1 (ID, userID, name, password) VALUES (Team1_seq.NEXTVAL, :userID, :name, :password) returning ID INTO :id`,
           {
               id,
               userID,
               name,
               password,
               id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
           },
           { autoCommit: true }
       );
       conn.commit()
       console.log(result.rowsAffected)
       if (result.rowsAffected === 1) {
           // 회원가입 성공 후, 사용자 세션에 로그인 정보 추가
           const user = {
               id: result.outBinds.id[0],
               userID: userID,
               name: name,
           };
            console.log(user, userID, name)
           // 세션에 사용자 정보 저장
           req.session.loggedIN = true;
           req.session.user = user;

           // 로그인 후 화면으로 리디렉션
           res.redirect('boardmain');
       } else {
           console.log(name)
           // 회원가입에 실패한 경우
           res.status(400).send('회원가입에 실패했습니다.');
       }
    } catch (err) {
        console.error(err);
        res.status(500).send('회원가입 중 오류가 발생했습니다.');
    } finally {
        if(conn) {
            await conn.close();
        }
    }
});

module.exports = router;