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
    res.render('status', {title: 'Game', info: "This page ist still in development. In future, a created game with the ID " + req.query.id + " will be happening here."})
})

app.get("/about", (req, res) => {
    res.render('about', {title: 'About us'})
})

app.use( (req, res) =>{
    res.status(404).render('404')
})





app.listen(3000)

