import './CheckersGame.css'; 
import Field from './Field';
import Piece from './Piece';
import {DARK, LIGHT} from './consts';
import { getColorString } from './utils';
import { db } from '../../config/firebase'
import { collection, addDoc, onSnapshot, doc, getDocs, query, where, deleteDoc, Timestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';

class CheckersGame {
    constructor(container, config) {
        this.navg = config.nav;
        this.config = {
            rows: 8,
            cols: 8,
            fillRows: 2,
        };

        if( config && typeof config === 'object') {
            Object.assign(this.config, config);
        }

        this.container = container;
        this.el = document.createElement('div');
        this.el.className = 'checkers-board';
        this.container.appendChild(this.el);
        this.fieldsByNum = {};
        this.piecesByNum = {};
        this.movesByNum = {};
        this.createFieldStyle();
        this.createFields();
        this.createPieces();
        const colorPlayer = localStorage.getItem('colorOfPlayer');
        this.setPlayer(colorPlayer);
        this.onCurrentClick = this.playerMoveClick;
        this.el.addEventListener('click', this.onClick);
        localStorage.setItem('keepIt', "no");

    }
    getBoardLeft(col) {
        return col * 100 / this.config.cols + '%';
    }
    getBoardTop(row) {
        return row * 100 / this.config.rows + '%';
    }
    onClick = (e) => {
        console.log(e);
        this.onCurrentClick(e);
    }
    startGameSnapshot() {
        const colrefrence = collection(db, "moves" + localStorage.getItem('gameId'));
        onSnapshot(colrefrence, (snapshot) => {
            let docRef = '';
            const lowestTimestamp = new Date(0); // January 1, 1970, 00:00:00 UTC
            let firebaseLowestTimestamp = Timestamp.fromDate(lowestTimestamp);
            snapshot.docs.forEach(async (docR) => {
                if(firebaseLowestTimestamp < docR.data().timestamp){
                    firebaseLowestTimestamp = docR.data().timestamp;
                    docRef = docR;
                }
            });
            console.log("time:" + firebaseLowestTimestamp + "doc:" + docRef.id);
            snapshot.docs.forEach(async (docR) => {
                if(docR.id == docRef.id){
                    console.log("im cute please, color of player" + localStorage.getItem('colorOfPlayer') + "player color" + docR.data().playedNow);
                if (localStorage.getItem('colorOfPlayer') == docR.data().playedNow) {
                    if(docR.data().canDo == "yes"){

                    } else {
                        this.changePlayer("no");
                    console.log("i entered correctly");
                    }
                    
                } else {
                    console.log("somehow here")
                    // const attackedPiece = docR.data().deletePiece;
                    // if (attackedPiece) {
                    //     attackedPiece.remove();
                    // }
                    if(docR.data().attackingRow != 7 || docR.data().attackingCol != 7){
                        const attackedRow = docR.data().attackingRow;
                        const attackedCol = docR.data().attackingCol;
                        console.log("idk" + attackedRow + "," + attackedCol);
                        const attackedField = this.getField(attackedRow, attackedCol);
                        console.log(attackedField);
                        if(attackedField){
                            const attackedPiece = attackedField.piece;
                            // attackedPiece.remove();
                            if(attackedPiece){
                                this.lightCount--;
                                attackedPiece.remove();
                                this.checkEmpty();
                            }
                            console.log(attackedPiece)
                        }
                    }
                    const row = docR.data().newRow;
                    const col = docR.data().newCol;
                    const field = this.getField(row, col);
                    const oldRow = docR.data().oldRow;
                    const oldCol = docR.data().oldCol;
                    const oldField = this.getField(row, col);
                    // console.log(oldField);
                    // console.log(this.piecesByNum[oldField.num]);
                    console.log(oldRow + "old row," + oldCol + "old col");
                    console.log(row + "new row," + col + "new col");

                    const oldOldField = this.getField(oldRow, oldCol);
                    console.log(oldOldField + "," +oldOldField.piece);
                    const changeplace = oldOldField.piece;
                    changeplace.setField(field);
                    console.log(row);
                    if(row == 7){
                        changeplace.setQueen(true);
                        changeplace.makeQueen();
                    }
                    console.log(changeplace);
                    // const piece = oldField.piece;
                    // piece.setField(field);
                    // this.highlightPossibleMoves(col, row, "show");
                    if(docR.data().canDo == "yes"){
                        
                    } else {
                        this.changePlayer("my turn");
                    }
                }
                }
            });
        });
    }
    clearSelection(str) {
        if(this.selectedPiece && localStorage.getItem("canAgain") == "yes" && str=="yes") {
            localStorage.setItem('canAgain', "no");
        } else if(this.selectedPiece){
            this.selectedPiece.unselect();
        }
        if(this.moves) {
            this.moves.forEach((move) => {
                console.log(move);
                const field = this.getField(move.row, move.col);
                delete this.movesByNum[move.row * this.config.cols + move.col];
                field.unhighlight();
            });
            this.moves.length = 0;
        }
        if(this.oldValues){
            this.oldValues.length = 0;
        }
    }
    clearSelectionComplete() {
        localStorage.setItem('canAgain', "no");
        if(this.selectedPiece){
            this.selectedPiece.unselect();
        }
        if(this.moves) {
            this.moves.forEach((move) => {
                console.log(move.row + "moving" + move.col + "loling but here");
                const field = this.getField(move.row, move.col);
                delete this.movesByNum[move.row * this.config.cols + move.col];
                field.unhighlight();
            });
            this.moves.length = 0;
        }
        if(this.oldValues){
            this.oldValues.length = 0;
        }
    }
    clearNext(fieldNum){
        const move = this.movesByNum[fieldNum];
        if(this.moves2){
            console.log(this.moves2);
            this.moves2.forEach((moving) => {
                console.log(moving.row + "moving" + moving.col + "loling but cleaningggg");
                // if(moving.row + 2==  move.row || moving.row -2 ==  move.row){
                //     const field = this.getField(moving.row, moving.col);
                //     this.movesByNum[moving.row * this.config.cols + moving.col] = moving;
                //     field.unhighlight();
                // }
                // if(moving.col + 2==  move.col || moving.col -2 ==  move.col){
                //     const field = this.getField(moving.row, moving.col);
                //     this.movesByNum[moving.row * this.config.cols + moving.col] = moving;
                //     field.unhighlight();
                // }
                    const field = this.getField(moving.row, moving.col);
                    this.movesByNum[moving.row * this.config.cols + moving.col] = moving;
                    field.unhighlight();
                
            });
            this.moves2.length = 0;
        }
    }
    getNum(element){
        while (element) {
            if( element.dataset && element.dataset.num) {
                return element.dataset.num;
            }
            element = element.parentNode;
        }
    }
    playerMoveClick(e) {
        const el = e.target;
        const playerColor = getColorString(this.player);
        console.log(playerColor);
        const fieldNum = this.getNum(el);
        if(localStorage.getItem('keepIt') == "yes" && el.classList.contains('checkers-field-highlight')){
            localStorage.setItem('keepIt', "no");
            const move = this.movesByNum[fieldNum];
            let canDo = '';
            let count =0;
            this.clearNext(fieldNum);
            this.nextMoves(move.row, move.col);
                this.moves2.forEach((moving) => {
                console.log(moving.row + "moving" + move.row + "loling");
                if(moving.row + 2==  move.row || moving.row -2 ==  move.row){
                    canDo = "yes";
                    count++;
                    
                }
            });
            if(count == 0){
                canDo = "no";
            }   
            this.movePiece(this.selectedPiece, move, canDo);
            // this.selectedPiece.field.unhighlight();
            console.log("real time");
            console.log("move");
            if(canDo == "yes" && localStorage.getItem('canAgain') == "yes"){
                this.clearSelection(canDo);
                localStorage.setItem('keepIt', "yes");
                this.moves2.forEach((moving) => {
                console.log(moving.row + "moving" + move.row + "loling");
                if(moving.row + 2==  move.row || moving.row -2 ==  move.row){
                    const field = this.getField(moving.row, moving.col);
                    this.movesByNum[moving.row * this.config.cols + moving.col] = moving;
                    field.highlight();
                    this.oldValues.length = 0;
                    const oldValues = [];
                    oldValues.push({
                        row: move.row,
                        col: move.col,
                    });
                    this.oldValues = oldValues;
                } 
            });

            } else {
                
                this.clearNext(fieldNum);
                this.clearSelectionComplete();
            }
            
            this.checkEmpty();
            if(canDo == "yes" && localStorage.getItem('canAgain') == "yes"){
                
            } else {
                this.changePlayer("my turn");
            }
            return;
        } else if (localStorage.getItem('keepIt') == "yes"){
            return;
        }
        if(el.classList.contains(`checkers-piece-${playerColor}`)){
            // if(localStorage.getItem('keepIt') == "yes"){
            //     return;
            // }
            console.log("helo loca");
            this.clearSelectionComplete();
            this.piecesByNum[fieldNum].select();
            const row = Math.floor(fieldNum / this.config.cols);
            const col = fieldNum % this.config.cols;
            console.log(this.selectedPiece.queen);
            if(this.selectedPiece.queen){
                this.queenHighlightPossibleMoves(row, col, "show");
            } else {
                this.highlightPossibleMoves(row, col, "show");
            }
            console.log("its here");
            console.log(this.moves);
            // this.moves.forEach((move) => {
            //     this.nextMoves(move.row, move.col);
            // });
        } else if (el.classList.contains('checkers-field-highlight')) {
            localStorage.setItem('keepIt', "no");
            const move = this.movesByNum[fieldNum];
            let canDo = '';
            let count =0;
            this.clearNext(fieldNum);
            this.nextMoves(move.row, move.col);
                this.moves2.forEach((moving) => {
                console.log(moving.row + "moving" + move.row + "loling");
                if(moving.row + 2==  move.row || moving.row -2 ==  move.row){
                    canDo = "yes";
                    count++;
                    
                }
            });
            if(count == 0){
                canDo = "no";
            }   
            this.movePiece(this.selectedPiece, move, canDo);
            this.selectedPiece.field.unhighlight();
            console.log("real time");
            console.log("move");
            if(canDo == "yes" && localStorage.getItem('canAgain') == "yes"){
                this.clearSelection(canDo);
                localStorage.setItem('keepIt', "yes");
                this.moves2.forEach((moving) => {
                console.log(moving.row + "moving" + move.row + "loling");
                if(moving.row + 2==  move.row || moving.row -2 ==  move.row){
                    const field = this.getField(moving.row, moving.col);
                    this.movesByNum[moving.row * this.config.cols + moving.col] = moving;
                    field.highlight();
                    this.oldValues.length = 0;
                    const oldValues = [];
                    oldValues.push({
                        row: move.row,
                        col: move.col,
                    });
                    this.oldValues = oldValues;
                } 
            });

            } else {
                
                this.clearNext(fieldNum);
                this.clearSelectionComplete();
            }
            
            this.checkEmpty();
            if(canDo == "yes" && localStorage.getItem('canAgain') == "yes"){
                
            } else {
                this.changePlayer("my turn");
            }
        } else {
            this.clearSelectionComplete();
        }
    }
    displayResultMessage(message) {
        const resultMessageDiv = document.createElement('div');
        resultMessageDiv.id = 'resultMessage';
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        resultMessageDiv.appendChild(messageParagraph);
        const backButton = document.createElement('button');
        backButton.textContent = 'Go Back to Lobby';
        backButton.addEventListener('click', () => {
            this.navg('/openingScreen');
            resultMessageDiv.style.display = 'none';
        });
        resultMessageDiv.appendChild(backButton);
        this.container.appendChild(resultMessageDiv);
        resultMessageDiv.style.display = 'block';
    }
    checkEmpty(){
        console.log("finished");
        console.log(this.lightCount + "light" + this.darkCount + "dark");
        if (this.lightCount === 0) {
            this.displayResultMessage('You Lost!');
        } else if (this.darkCount === 0) {
            this.displayResultMessage('You Won!');
        }
    }
    queenHighlightPossibleMoves(row, col, str) {
        const playerColor = getColorString(this.player);
        const otherPlayer = localStorage.getItem('colorOfEnemy');
        let rowChange = this.player === playerColor ? 1 : -1;
        const oldValues = [];
        oldValues.push({
            row: row,
            col: col,
        });
        this.oldValues = oldValues;
        let possibleRow = row + rowChange;
        const moves = [];
        const nextMoves = [];
        [1, -1].forEach((colChange) => {
            console.log("im here");
            let field = this.getField(possibleRow, col + colChange);
            if (field) {
                console.log(field.piece);
                if (!field.piece) {
                    console.log("im here3");
                    moves.push({
                        row: possibleRow,
                        col: col + colChange,
                    });
                } else if(field.piece.color === otherPlayer) {
                    field = this.getField(possibleRow + rowChange, col + colChange * 2);
                    if(field && !field.piece) {
                        moves.push({
                            row: possibleRow + rowChange,
                            col: col + colChange * 2,
                            attacking: {
                                row: possibleRow,
                                col: col + colChange,
                            },
                        });
                    }
                } else {
                    console.log("what is happening" + field.piece.color + "otherrrr" + otherPlayer);
                }
            }
        });
        rowChange = -1 * rowChange;
        possibleRow = row + rowChange;
        [1, -1].forEach((colChange) => {
            console.log("im here");
            let field = this.getField(possibleRow, col + colChange);
            if (field) {
                console.log(field.piece);
                if (!field.piece) {
                    console.log("im here3");
                    moves.push({
                        row: possibleRow,
                        col: col + colChange,
                    });
                } else if(field.piece.color === otherPlayer) {
                    field = this.getField(possibleRow + rowChange, col + colChange * 2);
                    if(field && !field.piece) {
                        moves.push({
                            row: possibleRow + rowChange,
                            col: col + colChange * 2,
                            attacking: {
                                row: possibleRow,
                                col: col + colChange,
                            },
                        });
                    }
                } else {
                    console.log("what is happening" + field.piece.color + "otherrrr" + otherPlayer);
                }
            }
        });
        console.log("what is here");
        console.log(moves);
        if(str == "show"){
            moves.forEach((move) => {
                const field = this.getField(move.row, move.col);
                this.movesByNum[move.row * this.config.cols + move.col] = move;
                field.highlight();
            });
        }
        this.moves = moves;
    }

    async movePiece(piece, move, str){
        console.log(piece, move);
        console.log("is queen before:" + piece.queen);
        const {row, col, attacking} = move;
        let oldRow=0;
        let oldCol=0;
        this.oldValues.forEach((old) => {
            oldRow = old.row;
            oldCol = old.col;
        });
        console.log(this.oldValues);
        const field = this.getField(row, col);
        piece.setField(field);
        let attackedPiece = '';
        let attackingCol =0;
        let attackingRow =0;
        if(attacking) {
            const attackedField = this.getField(attacking.row, attacking.col);
            attackedPiece = attackedField.piece;
            if (attackedPiece) {
                attackingCol = attacking.col;
                attackingRow = attacking.row;
                this.darkCount--;
                attackedPiece.remove();
                localStorage.setItem('canAgain', "yes");
            } else {
                str = "no";
                localStorage.setItem('canAgain', "no");
            }
        } else {
            str = "no";
        }
        const idForGame = localStorage.getItem('gameId');
        const q = query(collection(db, "game"), where("numOfGame", "==", idForGame));
        const querySnapshot = await getDocs(q);
        let playerOneEmail = '';
        let playerTwoEmail = '';
        // let moveToPlay = [];
        querySnapshot.forEach((doc) => {
          console.log("first" + doc.data().firstPlayer + "second" + doc.data().secondPlayer);
          playerOneEmail=doc.data().firstPlayer;
          playerTwoEmail=doc.data().firstPlayer;
        });
        const playerColor = getColorString(this.player);
        let color = '';
        if(playerColor == 'light'){
            color = 'LIGHT';
        } else {
            color = 'DARK';
        }
        // console.log("old row"+ this.config.rows - oldRow - 1);
        // console.log("old col"+ this.config.cols - oldCol - 1);
        // console.log("new row"+ this.config.rows - row - 1);
        // console.log("new col"+ this.config.cols - col - 1);
        // console.log("row"+ this.config.rows - attackingRow -1);
        // console.log("col" +this.config.cols - attackingCol -1);
        const calc = this.config.rows - row - 1;
        console.log("calc:" +calc);
        if(calc == 7){
            piece.setQueen(true);
            piece.makeQueen();
        }
        const docRef = await addDoc(collection(db, "moves" + idForGame), {
            oldRow: this.config.rows - oldRow - 1,
            oldCol: this.config.cols - oldCol - 1,
            newRow: this.config.rows - row - 1,
            newCol: this.config.cols - col - 1,
            playedNow: color,
            canDo: str,
            attackingRow: this.config.rows - attackingRow -1,
            attackingCol: this.config.cols - attackingCol -1,
            // deletePiece: attackedPiece,
            timestamp: new Date().toISOString(),
        });
        console.log("is queen after:" + piece.queen);
        // this.changePlayer("no");
    }
    nextMoves(row, col){
        const playerColor = getColorString(this.player);
        const otherPlayer = localStorage.getItem('colorOfEnemy');
        let rowChange = this.player === playerColor ? 1 : -1;
        let possibleRow = row + rowChange;
        
        const moves = [];
        [1, -1].forEach((colChange) => {
            console.log("im here");
            let field = this.getField(possibleRow, col + colChange);
            if (field) {
                console.log(field.piece);
                if (!field.piece) {
                    console.log("im here3");
                    moves.push({
                        row: possibleRow,
                        col: col + colChange,
                    });
                } else if(field.piece.color === otherPlayer) {
                    field = this.getField(possibleRow + rowChange, col + colChange * 2);
                    if(field && !field.piece) {
                        moves.push({
                            row: possibleRow + rowChange,
                            col: col + colChange * 2,
                            attacking: {
                                row: possibleRow,
                                col: col + colChange,
                            },
                        });
                    }
                } else {
                    console.log("what is happening" + field.piece.color + "otherrrr" + otherPlayer);
                }
            }
        });
        rowChange = -1 * rowChange;
        possibleRow = row + rowChange;
        [1, -1].forEach((colChange) => {
            console.log("im here");
            let field = this.getField(possibleRow, col + colChange);
            if (field) {
                console.log(field.piece);
                if (!field.piece) {
                    console.log("im here3");
                    moves.push({
                        row: possibleRow,
                        col: col + colChange,
                    });
                } else if(field.piece.color === otherPlayer) {
                    field = this.getField(possibleRow + rowChange, col + colChange * 2);
                    if(field && !field.piece) {
                        moves.push({
                            row: possibleRow + rowChange,
                            col: col + colChange * 2,
                            attacking: {
                                row: possibleRow,
                                col: col + colChange,
                            },
                        });
                    }
                } else {
                    console.log("what is happening" + field.piece.color + "otherrrr" + otherPlayer);
                }
            }
        });
        console.log("what is here");
        console.log(moves);
        this.moves2 = moves;
    }
    highlightPossibleMoves(row, col, str) {
        const playerColor = getColorString(this.player);
        const otherPlayer = localStorage.getItem('colorOfEnemy');
        const rowChange = this.player === playerColor ? 1 : -1;
        const oldValues = [];
        oldValues.push({
            row: row,
            col: col,
        });
        this.oldValues = oldValues;
        const possibleRow = row + rowChange;
        const moves = [];
        const nextMoves = [];
        [1, -1].forEach((colChange) => {
            console.log("im here");
            let field = this.getField(possibleRow, col + colChange);
            if (field) {
                console.log(field.piece);
                if (!field.piece) {
                    console.log("im here3");
                    moves.push({
                        row: possibleRow,
                        col: col + colChange,
                    });
                } else if(field.piece.color === otherPlayer) {
                    field = this.getField(possibleRow + rowChange, col + colChange * 2);
                    if(field && !field.piece) {
                        moves.push({
                            row: possibleRow + rowChange,
                            col: col + colChange * 2,
                            attacking: {
                                row: possibleRow,
                                col: col + colChange,
                            },
                        });
                    }
                } else {
                    console.log("what is happening" + field.piece.color + "otherrrr" + otherPlayer);
                }
            }
        });
        console.log("what is here");
        console.log(moves);
        if(str == "show"){
            moves.forEach((move) => {
                const field = this.getField(move.row, move.col);
                this.movesByNum[move.row * this.config.cols + move.col] = move;
                field.highlight();
            });
        }
        this.moves = moves;
    }
    getField(row, col){
        if( col >= this.config.cols || col < 0) return null;
        return this.fieldsByNum[row * this.config.cols + col];
    }
    createFieldStyle(){
        const { rows, cols} = this.config;
        const style = document.createElement('style');
        const width = 100/cols;
        const height = 100/rows;
        style.innerHTML = `.checkers-field { width: ${width}%; height: ${height}%; }`;
        
        document.head.appendChild(style);
        this.fieldStyle = style;
    }
    createFields() {
        const { rows, cols} = this.config;
    
        for (let row = 0; row < rows; row += 1) {
            for(let col = 0; col < cols; col += 1){
                const field = new Field(this.config, row, col);
                this.fieldsByNum[field.num] = field;
                this.el.appendChild(field.el);
            }
        }
    }

    createPieces() {
        this.lightCount = 12;
        this.darkCount =12;
        const {rows, cols, fillRows} = this.config;
        const colorPlayer = localStorage.getItem('colorOfPlayer');
        const colorEnemy = localStorage.getItem('colorOfEnemy');
        console.log(colorEnemy);
        for (let i = 0; i < fillRows; i +=1 ) {
            for( let j=i%2; j<cols; j+=2){
                const piece = new Piece(this, colorEnemy, false);
                const field = this.fieldsByNum[i * cols + j];
                piece.setField(field);
            }
        }
        for (let i = rows-fillRows; i < rows; i +=1 ) {
            for( let j=i%2; j<cols; j+=2){
                const piece = new Piece(this, colorPlayer, false);
                const field = this.fieldsByNum[i * cols + j];
                piece.setField(field);
            }
        }
    }

    setPlayer(player){
        this.player = player;
        this.setNamespaceClass('player', player);
    }
    changePlayer(str){
        // const {rows, cols, fillRows} = this.config;
        // const otherPlayer = this.player === DARK ? LIGHT : DARK;
        // for (let i = 0; i < fillRows; i +=1 ) {
        //     for( let j=i%2; j<cols; j+=2){
        //         const piece = this.piecesByNum[i * cols + j];
        //         piece.setColor(this.player);
        //     }
        // }
        // for (let i = rows-fillRows; i < rows; i +=1 ) {
        //     for( let j=i%2; j<cols; j+=2){
        //         const piece = this.piecesByNum[i * cols + j];
        //         piece.setColor(otherPlayer);
        //     }
        // }
        if(str == "my turn"){
            console.log("im here honey")
            this.setPlayer(localStorage.getItem('colorOfPlayer'));
        } else {
            this.setPlayer(undefined);
        }

    }
    setNamespaceClass(namespace, cls){
        const namespaceStr = `checkers--${namespace}`
        const className = this.el.className.split(' ').filter((part) => part.indexOf(namespaceStr) !== 0);
        className.push(`${namespaceStr}_${cls}`);
        this.el.className = className.join(' ');
    }
    clear() {
        this.container.innerHTML = '';
        if(this.fieldStyle) {
            this.fieldStyle.parentNode.removeChild(this.fieldStyle);
        }
    }
}

export default CheckersGame;