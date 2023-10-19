#!/usr/bin/nodejs

const sqlite3 = require('sqlite3')
const express = require('express')
const app = express();

app.set('view engine', 'ejs') // register view engine

app.use( (req, res, next) => {
    console.log(req.hostname, req.path, req.method) // debugging
    next()
} )
app.use(express.static('static')) // static folder
app.use(express.urlencoded({ extended: true })) // post request

// database connection
const db = new sqlite3.Database('./games.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})

app.get("/", (req, res) => {
    res.render('index', {title: 'Startpage'})
})

app.post("/create", (req, res) => {
    //console.log(req.body)

    // Hier fehlen Abfragen:
    // - Check if string cointains only numbers and small characters
    // - Check if gameid is greater than 3
    // - Check if gameid is already taken

    emptySet = "0000000000000000000000000000000000000000000000000000000000000000"
    gameid = req.body.gameid

    sql = `insert into game(gameid, state, current, winner) values (?,?,?,?)`
    
    db.run(sql,[gameid, emptySet, 0, 0],(err) => {
        if (err) return console.log(err.message)
    })

    res.render('status', {title: 'Info', info: req.body.gameid + " created."})
})

app.get("/game", (req, res) => {
    //console.log(req.query)

    console.log(req.query)

    function test1(result) {
        if (result == 0) {
            res.render('status', {title: 'Error', info: "No game can't be found with this id."})
        } else {
            res.render('game', {title: 'Game', info: "Game with ID " + req.query.id + " will be happening here."})
        }
    }

    sql = `select count(*) as amount from game where gameid = ?`

    db.all(sql,[req.query.id],(err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row=>{
            amount = row.amount
            test1(amount)
        })
    })
})

app.get("/about", (req, res) => {
    res.render('about', {title: 'About us'})
})

app.use( (req, res) =>{
    res.status(404).render('404')
})





app.listen(3000)

