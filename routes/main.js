const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', async (req, res)=>{
    const clientIP = req.ip; // 클라이언트의 IP 주소 확인
    console.log('Client IP address: ' + clientIP);
    // const currentDomain = window.location.hostname;
    // console.log("현재 도메인:", currentDomain);
    const currentDomain = req.hostname;
    console.log("현재 도메인:", currentDomain);

    let conn;
    if(!req.session.loggedInUserId){
        req.session.loggedInUserId=req.query.user_id
        // console.log("::::::",req.query)
    }
    console.log("boradmain:::::",req.query.user_id);

    // console.log("session 없어도 진행")

    const loggedInUserId = req.session.loggedInUserId;
    const loggedInUserName = req.session.loggedInUserName;
    const loggedInUserNickName = req.session.loggedInUserNickName;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT * FROM (SELECT * FROM BOARDER ORDER BY likes DESC)
             WHERE ROWNUM <= 5`,[],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );
        // result.rows.forEach(row => {
        //     const content = row.CONTENT.toString(); // CLOB 데이터를 문자열로 변환
        //     console.log(content);
        // });
        // console.log(result.rows[0])
        res.json({
            result:result.rows
        })
    } catch (err) {
        console.error(err);
        res.json(500).send('Internal Server Error');
    } finally{
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }

    res.render('main')
})

// router.post('/', async(req, res)=>{
//     res.redirect('/main')
// })

module.exports = router;