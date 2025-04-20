import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

dotenv.config({path: '/home/austinm/envs/lab6.env'});

//setting up database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true
});
const conn = await pool.getConnection();

//routes
app.get('/', async (req, res) => {
    let rows = [];

    // SQL query to get all authors for the dropdown
    let authorsSql = `SELECT authorId, firstName, lastName FROM authors`;
    let [authors] = await conn.query(authorsSql);

    let categoriesSql = 'SELECT DISTINCT category FROM quotes';
    let [categories] = await conn.query(categoriesSql);

    res.render('home.ejs', { rows, authors, categories });
});


app.get('/quoteFinder', async (req, res) => {

    let keyword = req.query.keyword;
    let categories = [];

    let sql = `SELECT q.quote, q.quoteId, a.firstName, a.lastName, a.authorId
    FROM quotes q
    NATURAL JOIN authors a
    WHERE quote LIKE ?`;

    const [params] = [`%${keyword}%`];
    const [rows] = await conn.query(sql, params);
    
    let authorsSql = `SELECT authorId, firstName, lastName FROM authors`;

    let [authors] = await conn.query(authorsSql);
    res.render('quotes.ejs', { rows, authors, categories});
});

app.get('/searchCategory', async (req, res) => {

    let keyword = req.query.category;

    let sql = `SELECT q.quote, q.quoteId, a.firstName, a.lastName, a.authorId
    FROM quotes q
    NATURAL JOIN authors a
    WHERE q.category LIKE ?`;

    const [params] = [`%${keyword}%`];
    const [rows] = await conn.query(sql, params);
    
    let authorsSql = `SELECT authorId, firstName, lastName FROM authors`;

    let [authors] = await conn.query(authorsSql);
    res.render('quotes.ejs', { rows, authors });
});

app.get('/searchAuthor', async (req, res) => {

    let authorId = req.query.author;

    let sql = `SELECT q.quote, q.quoteId, a.firstName, a.lastName, a.authorId
    FROM quotes q
    NATURAL JOIN authors a
    WHERE a.authorId = ?`;

    const [params] = [authorId];
    const [rows] = await conn.query(sql, params);

    let authorsSql = `SELECT authorId, firstName, lastName FROM authors`;

    let [authors] = await conn.query(authorsSql);

    res.render('quotes.ejs', { rows, authors});
});

app.get('/searchLikes', async (req, res) => {

    let likes = req.query.likes;

    let sql = `
    SELECT q.quote, q.quoteId, a.firstName, a.lastName, a.authorId
    FROM quotes q
    NATURAL JOIN authors a
    WHERE q.likes = ?
  `;
  

    const [rows] = await conn.query(sql, [likes]);

    let authorsSql = `SELECT authorId, firstName, lastName FROM authors`;

    let [authors] = await conn.query(authorsSql);
    console.log(rows);

    res.render('quotes.ejs', { rows, authors});
});


app.get('/api/authors/:authorId', async (req, res) => {
    const id = req.params.authorId;

    const sql = `SELECT * FROM authors WHERE authorId = ?`;
    const [rows] = await conn.query(sql, [id]);

    res.send(rows);
});


app.get("/dbTest", async (req, res) => {
    let sql = "SELECT CURDATE()";
    const [rows] = await conn.query(sql);
    res.send(rows);
});//dbTest

app.listen(3000, () => {
    console.log("Express server running")
});
