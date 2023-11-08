const n = 8;

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