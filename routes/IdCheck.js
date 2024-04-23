const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
const session = require('express-session');
const bodyParser = require('body-parser')

const router = express.Router();

router.get('/',(req,res)=>{
    res.render('/idcheck')
});

router.post('/', async(req, res)=>{
    const Id = req.body.inputUserId;
    let checkId = true;
    let conn;
    // console.log("req:::",req.body)
    // console.log("inputU:::",inputUserId)

    try {
        const conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(
            `select * from users WHERE ID = :id`,
            { Id }
        );

            console.log(result);
        if(result.rows.length > 0){
            checkId = false;

        }
        res.json({
            result:checkId
        })
        // checkId = result;
        // if ( checkId === inputUserId){
        //     console.log('이미 있는 id입니다.', 'inputUserId:::', inputUserId, 'result:::', result)
        //     alert('이미 있는 ID입니다.')
        // } else {
        //     alert('사용가능한 ID입니다.')
        // }
    } catch (error) {
        console.error('오류 발생: ', error);
        alert('오류가 발생했습니다.')
    } finally{
        if(conn){
            await connection.close();
        }
    }
})

module.exports = router;
