const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/:id', async(req,res)=>{
    console.log(req.params.id)
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.session.loggedInUserId;
    const userNickName = req.session.loggedInUserNickName;
    const userName = req.session.loggedInUserName;

    const resultDeleteComments = await DeleteComments(postId)

    if (resultDeleteComments) {
        res.json({
            result : true
            }

        )
    } else {
        res.json({
                result : false
            }

        )
    }
});

const DeleteComments = async (boarder_code) =>{
    let conn;

    try{
        conn = await oracledb.getConnection(dbConfig);

        const sqlDeleteAllCommentsInpost = `DELETE FROM boarder_comments WHERE boarder_code = ${boarder_code}`
        const resultdeletecomments = await conn.execute(sqlDeleteAllCommentsInpost)
        await conn.commit();

        const deleteboard = `DELETE FROM boarder WHERE boarder_code = ${boarder_code}`
        const resultdeleteboard = await conn.execute(deleteboard)
        await conn.commit();

        return resultdeleteboard

    } catch (err) {
        console.log("오류남")
        console.error('게시글 삭제 중 오류 발생:', err);
        return null
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
}

module.exports = router;