const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/',async(req,res)=>{
    // const boarder_code = req.params.id;
    const userId =  req.session.loggedInUserId;
    const username = req.session.loggedInUserName;
    const usernickname =  req.session.loggedInUserNickName;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        const result = await conn.execute(
            `SELECT *
             FROM festivals
             WHERE STARTDATE <= SYSDATE AND ENDDATE >= SYSDATE-14`
        );
        await conn.commit();
        console.log(result.rows)

        // res.redirect(`/boarddetail/${boarder_code}`);
        res.json({
           festival:result.rows
        })
    } catch (err) {
        // res.status(500).send('서버 에러');
        res.json({result:false})
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

router.post('/',async(req, res)=>{
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트 게시판 댓글
    }

    const { content, boarder_code, user_id} = req.body;
    const comment_id = req.body.comment_id;

    let conn;
    console.log(boarder_code, user_id, content, comment_id);
    try {
        conn = await oracledb.getConnection(dbConfig);

        await conn.execute(
            `INSERT INTO BOARDER_COMMENTS (comment_id, boarder_code, user_id, content, parent_comment_id)
             VALUES (comment_id_seq.nextval, :boarder_code, :user_id, :content, :parent_id)`,
            [boarder_code, user_id, content, comment_id]
        );
        await conn.commit();

        // res.redirect(`/boarddetail/${boarder_code}`);
        res.json({
            result:true
        })
    } catch (err) {
        // res.status(500).send('서버 에러');
        res.json({result:false})
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


module.exports = router;