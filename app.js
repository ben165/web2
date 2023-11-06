#!/usr/bin/nodejs

const sqlite3 = require('sqlite3')
const express = require('express')
const app = express();

// OPTIONS
app.set('view engine', 'ejs') // register view engine

// MIDDLEWARE
app.use( (req, res, next) => {
    console.log(req.hostname, req.path, req.method) // debugging
    next()
} )
app.use(express.static('static')) // static folder
app.use(express.urlencoded({ extended: true })) // post request
app.use(express.json()) // allow json requests



// DATABASE
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

    //console.log(req.query)

    sql = `select count(*) as amount from game where gameid = ${req.query.id}`

    db.all(sql,[],(err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row=>{
            amount = row.amount
            test1(amount)
        })
    })

    
    function test1(result) {
        if (result == 0) {
            res.render('status', {title: 'Error', info: "No game can't be found with this id."})
        } else {
            res.render('game', {title: 'Game', gameid: req.query.id, player: req.query.player})
        }
    }


})

app.get("/about", (req, res) => {
    res.render('about', {title: 'About us'})
})


app.get("/gameinfo/:gameid", (req, res) => {

    sql = `select state from game where gameid = ?`

    db.all(sql,[req.params.gameid],(err, rows) => {
        if (err) return res.json({"status": 0})
        rows.forEach(row=>{
            state = row.state
            return res.json( state )
        })
    })
})


app.post("/makeMove", (req, res) => {
    move = req.body

    pos = req.body.pos
    player = req.body.player
    gameid = req.body.gameid

    sql = `select state from game where gameid = ?`

    db.all(sql,[gameid],(err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row=>{
            state = row.state
            if (player == 1) {
                state = state.substring(0, pos) + "1" + state.substring(pos+1, state.length)
            } else {
                state =  state.substring(0, pos) + "2" + state.substring(pos+1, state.length)
            }
            sql = `update game set state = ? where gameid = ?`
            db.run(sql, [state, gameid], (err) => {
                if (err) return console.log(err.message)
            })
        })
    })
    res.json({ "ok": 1 })
})



app.get("/jsonReturn", (req, res) => {
    a = { "name": "benjamin", "age": 12 }
    res.json(a)
})


app.post("/receiveJson", (req, res) => {
    console.log(req.body)
    res.send("Hello where is JSON????")
})


app.use( (req, res) =>{
    res.status(404).render('404', {title: 'Page not found'})
})





app.listen(3000)

