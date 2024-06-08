const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.post('/:id', async(req,res)=>{
    // 로그인 여부 확인
    // if(!req.session.loggedIn) {
    //     return res.redirect('/login'); //  로그인되지 않은 경우 로그인 페이지로 리다이렉트
    // }

    const comment_id = req.params.id;
    const boarder_code = req.body.boarder_code;
    console.log(comment_id,boarder_code,"::::::::")
    let conn;

    try{
        conn = await oracledb.getConnection(dbConfig);
        await conn.execute(
            `DELETE FROM boarder_comments WHERE comment_id = :comment_id OR parent_comment_id = :parent_comment_id`,
            { comment_id: comment_id, parent_comment_id: comment_id }
        );

        conn.commit();

        // 삭제 후 상세 페이지로 리다이렉트
        // res.redirect(`/boarddetail/${boarder_code}`);
        res.json({
            result:true
        })
    } catch (err) {
        // res.status(500).send('댓글 삭제 중 오류 발생.');
        res.json({
            result:false
        })
    } finally {
        if(conn) {
            try{
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 에러 발생', err);
            }
        }
    }
});

module.exports = router;