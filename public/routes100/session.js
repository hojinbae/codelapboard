const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const session = require('express-session');
const dbConfig = require('./dbconfig');

oracledb.autoCommit = true;

const app = express();
const port = 3000;