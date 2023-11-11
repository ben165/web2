const n = 8;

const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const DRAW = 3;

export class BoardElement {
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

export class State {
    constructor(turn, player, boardStr) {
        this.boardStr = boardStr;
        this.player = player; // 1 oder 2
        this.turn = turn;
        this.winner = 0;
        this.board = [];
        for (let i = 0; i < n * n; i++) {
            this.board.push(new BoardElement(i % 8, (i - i % 8) / 8, Number(this.boardStr[i])))
        }
        this.calculateAttributes();
    }

    calculateAttributes(){
        this.setPossibleFlips();
        this.setWinner();
    }

    setWinner(){
        if (this.skipNecessary()) {
            this.player = otherPlayer(this.player);
            this.setPossibleFlips();
            if (this.skipNecessary()) {
                debugger;
                let stones = this.board.map(x => x.stone);
                const filterReduce = (stoneColor) => { return stones.filter(x => x === stoneColor).reduce((previous, current) => previous + 1, 0) };
                let black = filterReduce(BLACK);
                let white = filterReduce(WHITE);
                if (black > white) this.winner = BLACK;
                else if (black === white) this.winner = DRAW;
                else this.winner = WHITE;
            }
        }
    }

    skipNecessary(){
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i].flips.length !== 0) {
                return false;
            }
        }
        return true;
    }

    update(turn, player, newBoardStr) {
        if (this.player !== player || this.boardStr != newBoardStr) {
            for (let i = 0; i < n * n; i++) {
                if (this.boardStr[i] !== newBoardStr[i]) {
                    this.board[i].stone = Number(newBoardStr[i]);
                }
            }
            this.turn = turn;
            this.player = player;
            this.boardStr = newBoardStr;
            this.calculateAttributes();
        }
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
                newBoardStr[flips[i]] = String(Number(this.player));
                this.board[flips[i]].stone = this.player;
                this.board[flips[i]].flips = [];
            }
            this.boardStr = newBoardStr.join("");
            this.player = otherPlayer(this.player);
            this.turn += 1;
            this.calculateAttributes();
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
}

export function otherPlayer(player) {
    return player === BLACK ? WHITE : BLACK;
}