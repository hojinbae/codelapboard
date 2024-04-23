const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
const session = require('express-session');
const bodyParser = require('body-parser')
const router = express.Router();

// 회원가입 폼을 렌더링하는 라우트
router.get('/',(req,res)=>{
    res.render('signup');
});

// 기존 회원가입 요청을 처리하는 라우트 코드
router.post('/',async(req, res)=>{
    const { id, password, name, gender, birth, nickname, locationX, locationY, tagFamily, tagLike } = req.body;
    let conn;
    console.log(req.body)


    console.log("ID:::",id)
    console.log("password:::", password)
    try{
        const conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `INSERT INTO users (ID, PASSWORD, NAME, GENDER, BIRTH, NICKNAME, locationX, locationY, TAGFAMILY, TAGLIKE)
            VALUES (:id, :password, :name, :gender, to_date(:birth,\'YYYY-MM-DD\'), :nickname, :locationX,:locationY, :tagFamily, :tagLike)  `,
        {
            id,
            password,
            name,
            gender,
            birth,
            nickname,
            locationX,
            locationY,
            tagFamily,
            tagLike

        },

            { autoCommit: true }
        );
        console.log(result.outBinds)
        console.log(result)
        if (result.rowsAffected === 1) {
            // 회원가입 성공 후, 사용자 세션에 로그인 정보 추가
            const user = { // 이 부분은 데이터 베이스의 실제 응답에 따라 조정해야 합니다.
                ID: id,
                PW: password,
                NAME: name,
                GENDER: gender,

                NICKNAME: nickname,
                LOCATIONX: locationX,
                LOCATIONY: locationY,
                TAGFAMILY: tagFamily,
                TAGLIKE: tagLike
            };

            // 세션에 사용자 정보 저장
            req.session.loggedIn = true;
            req.session.user = user;
            res.json({
                result:true
            })

            // 로그인 후 화면으로 리디렉션
            res.render('home')
        } else {
            // 회원가입에 실패한 경우
            res.status(400).send('회원가입에 실패했습니다.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('회원가입 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            await conn.close();
        }
    }
});

module.exports = router;