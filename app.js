#!/usr/bin/nodejs

import { State } from './helper.js';
import sqlite3 from 'sqlite3';
import express from 'express'
import cors from 'cors';
const app = express();

let debugDB = {};

//import {State} from 'helper.js'

//console.log(__dirname)

// OPTIONS
app.set('view engine', 'ejs') // register view engine

// MIDDLEWARE
app.use((req, res, next) => {
    console.log(req.hostname, req.path, req.method) // debugging
    next()
})
app.use(express.static('static')) // static folder
app.use(express.urlencoded({ extended: true })) // post request
app.use(express.json()) // allow json requests
app.use(cors());



// DATABASE
const db = new sqlite3.Database('./game.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})


app.get("/", (req, res) => {
    res.render('index', { title: 'Startpage' })
})


app.get("/create", (req, res) => {

    let emptySet = "0000000000000000000000000001200000021000000000000000000000000000"

    let state = new State(0, 1, emptySet);
    let moveSet = state.moveStr()

    let counter = state.turn
    let player = state.player

    let sql = `UPDATE game SET state = ?, current = ?, winner = ?, moveStr = ?, counter = ? WHERE gameid = 1`

    db.run(sql, [emptySet, player, 0, moveSet, counter], (err) => {
        if (err) return console.log(err.message)
    })

    res.json({ title: 'Info', info: 'Empty Game field created' })
})


app.get("/debugDB", (req, res) => {

    const sql = `Select state, current, winner, moveStr, counter from game WHERE gameid = 1`

    db.all(sql, [req.params.gameid], (err, rows) => {
        if (err) return res.json({ "status": 0 })
        rows.forEach(row => {
            console.log(row)
            debugDB = row
        })
        res.json(debugDB)
    })
})

app.get("/resetDB", (req, res) => {

    const sql1 = `drop table if exists game;`
    const sql2 = `CREATE TABLE "game" (
    	"id"	INTEGER,
    	"gameid"	INTEGER UNIQUE,
    	"state"	TEXT,
    	"current"	INTEGER,
    	"winner"	INTEGER,
    	"moveStr"	TEXT,
    	"counter"	INTEGER,
    	PRIMARY KEY("id")
    );`
    const sql3 = `insert into game (gameid) values (?)`

    db.run(sql1, [], (err) => {
        if (err) return console.log(err.message)
        db.run(sql2, [], (err) => {
            if (err) return console.log(err.message)
            db.run(sql3, [1], (err) => {
                if (err) return console.log(err.message)
                res.json({ title: 'Info', info: 'Database deleted, created again and filles with gameid = 1.' })
            })
        })
    })
})




app.get("/game", (req, res) => {
    const sql = `select count(*) as amount from game where gameid = ${req.query.id}`

    db.all(sql, [], (err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row => {
            amount = row.amount
            test1(amount)
        })
    })


    function test1(result) {
        if (result == 0) {
            res.render('status', { title: 'Error', info: "No game can't be found with this id." })
        } else {
            res.render('game', { title: 'Game', gameid: req.query.id, player: req.query.player })
        }
    }
})


app.get("/gameinfo", (req, res) => {
    // Polling happens every second

    const sql = `select state from game where gameid = 1`

    db.all(sql, [], (err, rows) => {
        if (err) return res.json({ "status": 0 })
        rows.forEach(row => {
            let state = row.state
            return res.json(state)
        })
    })
})


app.post("/makeMove", (req, res) => {

    /*
    {
        "player": 1,
        "move": 30
    }
    
    Von Datenbank:
    - state (boardStr)
    - moveStr (was erlaubt ist)
    - currentPlayer, db: current
    - game02
    */

    const playerMove = req.body.move
    const playerId = req.body.player

    const sql = `select state, moveStr, current, counter from game where gameid = 1`

    db.all(sql, [], (err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row => {
            let stateDb = row.state
            let playerDb = row.current
            let moveStrDb = row.moveStr
            let counterDb = row.counter

            console.log("playerDb: ", playerDb, "playerId: ", playerId, "moveStrDb[playerMove]: ", moveStrDb[playerMove])
            if (playerDb === playerId && moveStrDb[playerMove] === "1") {
                console.log("Zug war in Ordnung.")
                let state = new State(counterDb, playerDb, stateDb)
                state.makeMove(playerMove)
                let newMoveStr = state.moveStr()
                let newState = state.boardStr
                let newPlayer = state.player
                let newCounter = counterDb + 1

                console.log(newState)

                const sql = `update game set moveStr = ?, state = ?, current = ?, counter = ? where gameid = 1`
                db.run(sql, [newMoveStr, newState, newPlayer, newCounter], (err) => {
                    if (err) return console.log(err.message)
                })
            }
        })
    })
    res.json({ "ok": 1 })
})



app.get("/jsonReturn", (req, res) => {
    const a = { "name": "benjamin", "age": 12 }
    res.json(a)
})


app.post("/receiveJson", (req, res) => {
    console.log(req.body)
    res.send("Hello where is JSON????")
})


app.use((req, res) => {
    res.status(404).render('404', { title: 'Page not found' })
})





app.listen(3000)