const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig');
const bodyParser = require("body-parser");

const router = express.Router();

router.get('/:id', async (req, res)=>{
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    let board_code = req.params.id;
    // console.log(board_code)

    const user_id = req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userNickName = req.session.loggedInUserNickName;
    // console.log(`username: ${userName}`);

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // console.log(`board_code: ${board_code}`);
        // 조회수 증가 처리
        await conn.execute(
            `UPDATE BOARDER SET views = views + 1 WHERE boarder_code = :board_code`,
            [board_code]
        );

        // 변경 사항을 커밋
        await conn.commit();

        // 게시글 정보 가져오기
        const boardResult = await conn.execute(
            `SELECT b.boarder_code, b.title, u.id AS author, b.content, TO_CHAR(b.created_at, 'YYYY-MM-DD') AS created_at,
                    b.views, b.likes, b.image_path, b.image_name,f.festivalname
             FROM BOARDER b      
                   JOIN USERS u ON b.user_id = u.id
                   JOIN FESTIVALS f on b.festival_code = f.festivalid
             WHERE b.boarder_code = :id`,
            [board_code],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글 가져오기
        const commentResult = await conn.execute(
            `SELECT c.comment_id, c.boarder_code, c.content, u.id AS author, TO_CHAR(c.create_at, 'YYYY-MM-DD HH:MM') AS create_at, c.parent_comment_id 
            FROM boarder_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.boarder_code = :id
            ORDER BY c.comment_id`,
            [board_code],
            { fetchInfo: { CONTENT: { type: oracledb.STRING } } }
        );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];
        const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장

        commentResult.rows.forEach(row => {
            const comment = {
                comment_id: row[0],
                boarder_code : row[1],
                content: row[2],
                author : row[3],
                created_at: row[4],
                children: [] // 자식 댓글을 저장할 배열
            };

            const parentId = row[5]; // 부모 댓글의 id

            if(parentId === null) {
                // 부모 댓글이 null이면 바로 댓글 배열에 추가
                comments.push(comment);
                commentMap.set(comment.comment_id, comment); // 맵에 추가
            } else {
                // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
                const parentComment = commentMap.get(parentId);
                parentComment.children.push(comment);
            }
        });

        const board = {
            board_code: boardResult.rows[0][0],
            title: boardResult.rows[0][1],
            author: boardResult.rows[0][2],
            content: boardResult.rows[0][3],
            created_at: boardResult.rows[0][4],
            views: boardResult.rows[0][5],
            likes: boardResult.rows[0][6],
            image_path: boardResult.rows[0][7],
            image_name: boardResult.rows[0][8],
            festival_name:boardResult.rows[0][9]
        };
        console.log(board);
        // res.render('boarddetail',{
        //     board: board,
        //     user_id: user_id,
        //     userName: userName,
        //     userNickName: userNickName,
        //     comments: comments
        // });
        res.json({
            board: board,
            user_id: user_id,
            userName: userName,
            userNickName: userNickName,
            comments: comments
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

module.exports = router;