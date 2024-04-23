const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/',(req, res)=>{
    res.render('/loginFail');
});


module.exports = router;