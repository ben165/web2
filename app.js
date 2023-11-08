#!/usr/bin/nodejs

const sqlite3 = require('sqlite3')
const express = require('express')
const app = express();

debugDB = {};

//import {State} from 'helper.js'

//console.log(__dirname)

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
const db = new sqlite3.Database('./game.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message)
})


app.get("/", (req, res) => {
    res.render('index', {title: 'Startpage'})
})


app.get("/create", (req, res) => {

    emptySet = "0000000000000000000000000001200000021000000000000000000000000000"

    let state = new State(0,1,emptySet);
    let moveSet = state.moveStr()

    let counter = state.turn
    let player = state.player

    sql = `UPDATE game SET state = ?, current = ?, winner = ?, moveStr = ?, counter = ? WHERE gameid = 1`
    
    db.run(sql,[emptySet, player, 0, moveSet, counter],(err) => {
        if (err) return console.log(err.message)
    })

    res.json({title: 'Info', info: 'Empty Game field created'})
})


app.get("/debugDB", (req, res) => {

    sql = `Select state, current, winner, moveStr, counter from game WHERE gameid = 1`

    var rowDB;
    db.all(sql,[req.params.gameid],(err, rows) => {
        if (err) return res.json({"status": 0})
        rows.forEach(row=>{
            console.log(row)
            debugDB = row
        })
        res.json(debugDB)
    })
})

app.get("/resetDB", (req, res) => {

sql1 = `drop table if exists game;`
sql2 = `CREATE TABLE "game" (
    	"id"	INTEGER,
    	"gameid"	INTEGER UNIQUE,
    	"state"	TEXT,
    	"current"	INTEGER,
    	"winner"	INTEGER,
    	"moveStr"	TEXT,
    	"counter"	INTEGER,
    	PRIMARY KEY("id")
    );`
sql3 = `insert into game (gameid) values (?)`
    
    db.run(sql1,[],(err) => {
        if (err) return console.log(err.message)
        db.run(sql2,[],(err) => {
            if (err) return console.log(err.message)
            db.run(sql3,[1],(err) => {
                if (err) return console.log(err.message)
                res.json({title: 'Info', info: 'Database deleted, created again and filles with gameid = 1.'})
            })
        })
    })
})

app.get("/cancel", (req, res) => {
    emptySet = "0000000000000000000000000000000000000000000000000000000000000000"
    //gameid = req.body.gameid // not needed cause there is only one game...

    sql = `UPDATE game SET state = ?, current = ?, winner = ? WHERE gameid = 1`

    db.run(sql,[emptySet, 0, 0],(err) => {
        if (err) return console.log(err.message)
        else return res.json({title: 'Info', info: 'Game reset'})
    })
})




app.get("/game", (req, res) => {
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


app.get("/gameinfo", (req, res) => {
    // Polling happens every second

    sql = `select state from game where gameid = 1`

    db.all(sql,[],(err, rows) => {
        if (err) return res.json({"status": 0})
        rows.forEach(row=>{
            state = row.state
            return res.json( state )
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

    playerMove = req.body.move
    playerId = req.body.player

    sql = `select state, moveStr, current, counter from game where gameid = 1`

    db.all(sql,[],(err, rows) => {
        if (err) return console.log(err.message)
        rows.forEach(row=>{
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

                sql = `update game set moveStr = ?, state = ?, current = ?, counter = ? where gameid = 1`
                db.run(sql, [newMoveStr, newState, newPlayer, newCounter], (err) => {
                    if (err) return console.log(err.message)
                })
            }
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












const n = 8;

 class BoardElement {
    constructor(x, y, stone) {
        this.x = x;
        this.y = y;
        this.stone = stone;  // 0 leer, 1 Spieler1, 2 Spieler2
        this.flips = []; // integer
    }

    setPossibleFlips(flips) {
        this.flips = flips;
    }

    getIndex() {
        return n * this.y + this.x;
    }
}

 class State {
    constructor(turn, player, boardStr) {
        this.boardStr = boardStr;
        this.player = player; // 1 oder 2
        this.turn = turn;
        this.board = [];
        for (let i = 0; i < n * n; i++) {
            this.board.push(new BoardElement(i % 8, (i - i % 8) / 8, Number(this.boardStr[i])))
        }
        this.setPossibleFlips();
    }

    moveStr() {
        let moveStr = "";
        let c;
        for(let i = 0; i < this.board.length; i++) {
            c = this.board[i].flips.length === 0 ? 0 : 1;
            moveStr += c;
        }
        return moveStr;
    }

    makeMove(k) {
        let flips = this.board[k].flips;
        if (flips.length > 0) {
            let newBoardStr = Array.from(this.boardStr);
            for (let i = 0; i < flips.length; i++) {
                newBoardStr[flips[i]] = this.player;
                this.board[flips[i]].stone = this.player;
                this.board[flips[i]].flips = [];
            }
            this.boardStr = newBoardStr.join("");
            this.player = this.otherPlayer();
            this.turn += 1;
            this.setPossibleFlips();
        }   
    }

    setPossibleFlips() {
        for (const i in this.board) {
            this.board[i].setPossibleFlips(this.possibleFlips(Number(i)));
        }
    }

    possibleFlips(i) {
        let elm = this.board[i];
        let result = [];
        if (elm.stone === 0) {
            const dd = [[1, 0], [1, 1], [0, 1], [-1, 1,], [-1, 0], [-1, -1], [0, -1], [1, -1]];
            for (const d in dd) {
                let temp = [];
                let nextI = i;
                let nextStone;
                while (true) {
                    nextI = this.neighbor(nextI, dd[d]);
                    if (nextI === -1) {
                        temp = [];
                        break;
                    }
                    nextStone = this.board[nextI].stone;
                    if (nextStone === this.player) {
                        break;
                    }
                    if (nextStone === 0) {
                        temp = [];
                        break;
                    }
                    temp.push(nextI);
                }
                result = result.concat(temp);
            }
        }
        if (result.length !== 0) {
            result.push(i);
        }
        return result;
    }

    neighbor(i, d) {
        let elm = this.board[i]
        const newX = elm.x + d[0];
        const newY = elm.y + d[1];
        if (newX < 0 || newX >= n || newY < 0 || newY >= n) {
            return -1;
        } else {
            return (n * newY + newX);
        }
    }

    otherPlayer() {
        return this.player === 1 ? 2 : 1;
    }
}