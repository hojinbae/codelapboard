const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/:id', async (req, res) => {
    console.log(req.params.id)
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId =  req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userRealName =  req.session.loggedInUserRealName;

    console.log('111111111')
    const resultDeletdComments = await DeleteComments(postId)
    console.log(JSON.stringify(resultDeletdComments, null, 2))

    if (resultDeletdComments) {
        res.redirect(`/boardMain?id= ${userId}&username=${userName}&name=${userRealName}`);
    } else {
        res.send("에러났다")
    }
});

const DeleteComments = async (postId)=>{
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        console.log("deletecomments::::",postId)
        const sqlDeleteAllCommnetsInPost = `DELETE FROM Team1_comments WHERE post_id = ${postId}`
        const resultDeleteComments = await conn.execute(sqlDeleteAllCommnetsInPost)
        await conn.commit();

        const deletepost = `DELETE FROM Team1_POSTS WHERE ID = ${postId}`
        const resultdeletpost = await conn.execute(deletepost)
        await conn.commit();

        // console.log('commit 시도')

        // console.log('댓글부터 삭제. '+ JSON.stringify(resultDeleteComments,null,2))

        return resultdeletpost


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

// const DeletePostst = (postId)=>{
//
// }

module.exports = router;