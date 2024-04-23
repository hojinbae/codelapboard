const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
const e = require("express");

const router = express.Router();

router.get('/', async(req,res)=>{
    let conn;
    console.log(req.session.loggedInUserId);
    if(!req.session.loggedIn){
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const loggedInUserId = req.session.loggedInUserId;
    const loggedInUserName = req.session.loggedInUserName;
    const loggedInUserNickName = req.session.loggedInUserNickName;


    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `SELECT COUNT(*) AS total FROM BOARDER`
        );
        const totalPosts = result.rows[0];
        const postPerPage = 10; // 한페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postPerPage); // 총 페이지수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postPerPage + 1;
        const endRow = currentPage * postPerPage;

        // 정렬 방식에 따른 SQL 쿼리 작성
        let orderByClause = 'ORDER BY b.created_at DESC'; // 기본적으로 최신순 정렬

        if (req.query.sort === 'views_desc') {
            orderByClause = 'ORDER BY b.views DESC, b.created_at DESC'; // 조회수 내림차순, 최신순
        }

        // 검색 조건에 따른 SQL 쿼리 작성
        let searchCondition = ''; // 기본적으로 검색 조건 없음

        if (req.query.searchType && req.query.searchInput) {
            const searchType = req.query.searchType;
            const searchInput = req.query.searchInput;

            // 검색 조건에 따라 WHERE 절 설정
            if (searchType === 'title') {
                searchCondition = `AND b.title LIKE '%${searchInput}%'`;
            } else if (searchType === 'content') {
                searchCondition = ` AND b.content LIKE '%${searchInput}%'`;
            } else if (searchType === 'user_id') {
                searchCondition = ` AND u.nickname LIKE '%${searchInput}%'`;
            }
        }
// if() 다음 블록에 들어가는 조건: true, truesy (false가 아닌 모든값)
// if() 다음 블록이 수행되지 않는 조건: false, falsy(0, null, NaN)
        const sql_query = `SELECT
                boarder_code, title, author, to_char(created_at, 'YYYY-MM-DD'), views, likes,
                (SELECT COUNT(*) FROM boarder_comments c WHERE c.boarder_code = b.boarder_code) AS comments_count
            FROM(
                    SELECT
                        b.boarder_code, b.title, u.id AS author, b.created_at, b.views, b.likes,
                        ROW_NUMBER() OVER (${orderByClause}) AS rn
                    FROM boarder b
                            JOIN USERS u ON b.user_id = u.id
                    WHERE 1=1
                        ${searchCondition}
                ) b
        WHERE rn BETWEEN :startRow AND :endRow
        `;
    result = await conn.execute(sql_query,
        {
            startRow: startRow,
            endRow: endRow
        }
    );

        const MAX_PAGE_LIMIT = 5;
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages)

        // res.render('index',{
        //     userId: loggedInUserId,
        //     userNickName: loggedInUserNickName,
        //     username: loggedInUserName,
        //     posts: result.rows,
        //     startPage: startPage,
        //     currentPage: currentPage,
        //     endPage: endPage,
        //     totalPages: totalPages,
        //     maxPageNumber: MAX_PAGE_LIMIT
        // });

        res.json({
            userId: loggedInUserId,
            userNickName: loggedInUserNickName,
            username: loggedInUserName,
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally{
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