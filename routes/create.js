const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
const multer = require('multer');
const fs = require("fs");
const path = require('path');

const router = express.Router();
const UPLOADS_FOLDER = path.join(__dirname,'..', '\\public\\uploads');


const upload = multer({ dest: path.join(__dirname, 'temp'), encoding: 'utf8' });

router.get('/',(req,res)=>{
    // 로그인 여부 확인 로직 작성
    res.render('create', {
        loggedInUserId : req.session.loggedInUserId,
        loggedInUserName : req.session.loggedInUserName,
        loggedInUserNickName : req.session.loggedInUserNickName
    });
});

router.post('/', upload.array('files', 5), async(req,res)=>{
    const { title, content } = req.body;
    console.log("들어와라")
    const formData = req.body;
    console.log(formData)
    const files = req.files.map(file => {
        // return{
        //     // 업로드된 파일의 원본 이름
        //     image_path: file.image_path,
        //     // 업로드된 파일의 변환된 이름
        //     image_name: file.image_name
        // };
        return{
            // 업로드된 파일의 원본 이름
            image_path: file.path,
            // 업로드된 파일의 변환된 이름
            image_name: file.filename
        };
    });
    const user_id = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
    let conn;
    try{
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        const result = await conn.execute(
            `SELECT BOARDER_CODE_SEQ.NEXTVAL FROM DUAL `
        );
        const boarder_code = result.rows[0][0];

        // 게시글 삽입
        await conn.execute(
            `INSERT INTO BOARDER (boarder_code, user_id, title, content, image_path, image_name  ) VALUES(:boarder_code, :user_id, :title, :content, :image_path, :image_name)`,
            {
                boarder_code: boarder_code,
                user_id: user_id,
                title: title,
                content: content,
                image_path: files.map(file => file.image_path).join(';'), // 파일의 원본 이름을 세미콜론으로 구분하여 저장
                image_name: files.map(file => file.image_name).join(';') // 파일의 변환된 이름을 세미콜론으로 구분하여 저장
            }
        );

        // 변경 사항 커밋
        await conn.commit();

        //파일 이동 및 임시 폴더의 파일 삭제
        // for (개별 요소 of 전체요소) : 전체 요소를 순회할 때 향상된 for문
        for (const file of req.files) {
            // multer에서 관리하는 file 객체의 path속성은 시스템에서 지정하는 TEMP 환경변수에 지정된 경로를
            // 디폴트 값으로 임시저장 폴더를 지정한다.
            // 임시폴더와 타겟폴더를 지정하는 이유는 업로드한 파일의 위험성을 temp 디렉토리에서 검증하기 위한
            // 일반적인 절차이다.
            // 추가적으로 보안조치를 취할 경우 아래  fs.renameSync 메소드를 통해 최종 이동하기 전에 필요로직을 구현한다.
            const tempFilePath = file.path;
            const targetFilePath = path.join(UPLOADS_FOLDER, file.filename);

            // 임시폴더의 파일을 타겟 경로로 이동
            fs.renameSync(tempFilePath, targetFilePath);
        }

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/boardmain');
    } catch (err) {
        console.error('글 작성 중 오류 발생:', err);
        res.status(500).send('글 작성 중 오류가 발생했습니다.');
    } finally {
        if(conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

module.exports = router;