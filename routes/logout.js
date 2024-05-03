const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/',(req,res)=>{
    console.log(req.session.loggedIn)
    req.session.destroy(err => {

        console.log(req.session);
        if (err) {
            console.error('세션 삭제 중 오류 발생: ', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
        }
    });
});

module.exports = router;