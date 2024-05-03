const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.post('/:commentId', async (req,res)=>{
    const {commentId} = req.params;
    const {content, board_code} = req.body;
    // console.log(content, board_code, commentId);
    try {
        // 댓글 수정 쿼리 실행
        const connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `UPDATE BOARDER_COMMENTS SET content = :content WHERE comment_id = :commentId`,
            { content, commentId}
        );
        // 삭제 후 상세 페이지로 리다이렉트
        // res.redirect(`/boarddetail/${board_code}`);
        console.log(":::::::result::::",result)
        if(result.rowsAffected === 1) {
            res.json({

                result: true
            })
        }else{
            res.json({

                result: false
            })
        }

    } catch (error) {
        // 댓글 수정 실패 시 에러 응답 반환
        res.status(500), send('댓글 수정 중 오류가 발생했습니다.');
    }
});

module.exports = router;