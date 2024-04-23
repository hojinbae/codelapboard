const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/',(req, res)=>{
    const postId = req.params.id;
    const userId =  req.session.loggedInUserId;
    const username = req.session.loggedInUserName;
    const userRealName =  req.session.loggedInUserRealName;

    res.render('addComment', {postId: postId, userId:userId, userName:username, userRealName:userRealName});
    console.log(postId);
});

// console.log(postId);

router.post('/', async(req,res)=>{
    // // 로그인 여부 확인
    // if (!req.session.loggedIn) {
    //     return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트게시판 댓글
    // }
    // const{ content, post_id, author_id} = req.body;
    const{ content, post_id, author_id} = req.body;
    const comment_id = req.body.comment_id;
    // author_id=3

    console.log("author_id", author_id);
    let conn;

    try {
        conn = await oracledb.getConnection(dbConfig);

        console.log("post_id", post_id);
        console.log("author_id", author_id);
        console.log("content", content);

        await conn.execute(
            `INSERT INTO Team1_comments (ID, post_id, author_id, content, parent_comment_id) 
             VALUES  (Team1_comment_id_seq.nextval, :post_id, :author_id, :content, :parent_id)`,
            [post_id, author_id, content[0], comment_id]
        );
        await conn.commit();

        res.redirect(`/detailPost/${post_id}`);
        } catch (err) {
            console.log(err);
        res.status(500).send('Internal Server Error');
        } finally {
            if (conn){
                try {
                    await conn.close();
                }   catch (err) {
                    console.error(err);
                }
            }
    }
});

module.exports = router;