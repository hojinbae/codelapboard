const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser')
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/:id', async (req, res)=>{

    const boarder_code = req.params.id;
    const userId = req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userNickName = req.session.loggedInUserNickName;

    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 정보 가져오기
        const boardResult = await conn.execute(
            `SELECT * FROM boarder where boarder_code = :boarder_code`,
            [boarder_code],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        const board = {
            boarder_code: boardResult.rows[0][0],
            title: boardResult.rows[0][1],
            content: boardResult.rows[0][3]
        };

        res.render('boardedit', {
            board: board,
            userId: userId,
            username: userName,
            userNickName: userNickName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('서버에러');
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

router.post('/', async(req,res)=>{
    const { boarder_code, title, content } = req.body;
    if(!req.session.loggedInUserId){
        req.session.loggedInUserId=req.body.user_id
    }
    const userId = req.session.loggedInUserId
    const userName =  req.session.loggedInUserName;
    const userNickName = req.session.loggedInUserNickName;

    // console.log('boarddetail:: ', title)
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 수정
        await conn.execute(
            `UPDATE boarder SET title = :title, content = :content WHERE boarder_code = :boarder_code`,
            [title, content, boarder_code]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 수정 후 상세 페이지로 리다이렉트
        res.redirect(`/boarddetail/${boarder_code}?user_id=${userId}&username${userName}&userNickName=${userNickName}`);
    } catch (err) {
        console.error('게시글 수정 중 오류 발생:', err);
        res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

module.exports = router;