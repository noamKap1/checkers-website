class Field {
    constructor(game, row, col) {
        this.game = game;
        this.row = row;
        this.col = col;
        const dark = Boolean((row + col) % 2);
        const colorStr = dark ? 'dark' : 'light';
        this.el = document.createElement('div');
        this.el.className = 'checkers-field';
        this.el.classList.add('checkers-field' + '-' + colorStr);
        // this.el.className += '-' + colorStr;
        const num = row * game.cols + col;
        this.num = num;
        this.el.setAttribute('data-num', num);
        this.el.style.left = this.getBoardLeft(col);
        this.el.style.top = this.getBoardTop(row);

    }
    getBoardLeft(col) {
        return col * 100 / this.game.cols + '%';
    }
    getBoardTop(row) {
        return row * 100 / this.game.rows + '%';
    }

    highlight() {
        this.el.classList.add('checkers-field-highlight');
    }
    unhighlight() {
        this.el.classList.remove('checkers-field-highlight');
    }
}
 export default Field;