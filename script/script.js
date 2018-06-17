(function () {
    const btnNewGame = document.querySelector('.btn-new-game');
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.overlay');
    const difficulties = popup.querySelector('.difficulties');
    const cardStyles = popup.querySelector('.card-styles');
    const btnStart = popup.querySelector('.btn-start');
    const board = document.querySelector('.board');
    const timer = document.querySelector('.timer');
    let cardsNumber = 18;
    let shirtStyle = 1;
    let timerId;
    const removeActive = function (elems) {
        for (let i = 0; i < elems.length; i++) {
            elems[i].classList.remove('active');
        }
    };

    // run timer
    const runTimer = function () {
        let sec = 0;
        let min = 0;
        timerId = setTimeout(function tick() {
            if (sec === 59) {
                min++;
                sec = -1;
            }
            sec++;
            timer.innerHTML = `${min}:${sec}`;
            timerId = setTimeout(tick, 1000);
        }, 1000);
    };

    class Game {
        constructor() {
            this.cardsNumber = cardsNumber;
        }
        createField() {
            if (board.children.length > 0) {
                board.removeChild(board.firstElementChild);
                board.removeChild(board.lastElementChild);
            }
            this.field = new Field(this.cardsNumber / 2);
            this.field.renderField(this.cardsNumber);
        }
        // create field with cards
        generateCardSet() {
            this.cardIds = [];
            this.CARDS_NUMBER = 12;

            const shuffle = (arr) => {
                const len = arr.length;
                for (let i = 0; i < len - 1; i++) {
                    const randomIndex = Math.floor(Math.random() * len);
                    const temp = arr[randomIndex];
                    arr[randomIndex] = arr[len - 1];
                    arr[len - 1] = temp;
                }
                return arr;
            };

            for (let i = 0; i < this.cardsNumber / 2; i++) {
                const temp = Math.floor(Math.random() * this.CARDS_NUMBER);
                this.cardIds.push(temp, temp);
            }
            shuffle(this.cardIds);
        }
        // create cards on the field
        renderCards() {
            for (let i = 0; i < this.cardsNumber; i++) {
                const cardRender = document.createElement('div');
                cardRender.classList.add('card');
                const card = new Card(this.cardIds[i], this.field, cardRender);
                const cardShirt = document.createElement('div');
                cardShirt.classList.add('card-shirt');

                // select card
                switch (shirtStyle) {
                    case 1:
                        cardShirt.classList.add('shirt-style-1');
                        break;
                    case 2:
                        cardShirt.classList.add('shirt-style-2');
                        break;
                    case 3:
                        cardShirt.classList.add('shirt-style-3');
                        break;
                    // no default
                }
                const cardFace = document.createElement('div');
                cardFace.classList.add('card-face');
                const spriteDiv = document.createElement('div');
                const SPRITE_WIDTH = 165;
                const SPRITE_HEIGHT = 160;
                const COLUMNS_NUMBER = 4;
                const posY = Math.floor(this.cardIds[i] / COLUMNS_NUMBER) * SPRITE_HEIGHT;
                const posX = (this.cardIds[i] % COLUMNS_NUMBER) * SPRITE_WIDTH;
                spriteDiv.style.backgroundPosition = `-${posX}px -${posY}px`;
                cardFace.appendChild(spriteDiv);
                cardRender.appendChild(cardShirt);
                cardRender.appendChild(cardFace);
                cardRender.addEventListener('click', () => card.tryToTurn());
                this.field.fieldRender.appendChild(cardRender);
            }
        }
    }

    // create size field
    class Field {
        constructor(pairs) {
            this.turnedCard = null;
            this.clickable = true;
            this.pairs = pairs;
        }
        renderField(cardsNumber) {
            this.fieldRender = document.createElement('div');
            this.fieldRender.classList.add('field');
            switch (cardsNumber) {
                case 10:
                    this.fieldRender.classList.add('field-for-10');
                    break;
                case 18:
                    this.fieldRender.classList.add('field-for-18');
                    break;
                // no default
            }
            board.appendChild(this.fieldRender);
        }
    }

    class Card {
        constructor(cardId, field, render) {
            this.cardId = cardId;
            this.guessed = false;
            this.field = field;
            this.render = render;
        }
        tryToTurn() {
            if (!this.guessed && this !== this.field.turnedCard) {
                this.turn();
            }
        }
        turn() {
            if (!this.field.clickable) return;
            this.render.classList.toggle('turn');
            const { turnedCard } = this.field;
            if (turnedCard === null) {
                this.field.turnedCard = this;
            } else {
                this.field.clickable = false;
                if (this.cardId === turnedCard.cardId) {
                    this.guessed = true;
                    turnedCard.guessed = true;

                    setTimeout(() => {
                        this.render.classList.add('hide');
                        turnedCard.render.classList.add('hide');
                        this.field.clickable = true;

                        this.field.pairs -= 1;
                        if (this.field.pairs === 0) {
                            clearTimeout(timerId);
                            const recordsmen = [];
                            const nowUser = JSON.parse(localStorage.getItem('allUsers')).pop();
                            const watch = timer.innerHTML;
                            const sec = Number(watch.toString().replace(/^\d+:/, ''));
                            const min = Number(watch.toString().replace(/:\d+$/, ''));
                            nowUser['time'] = watch;
                            nowUser['score'] = ((min * 60) + sec);
                            if (!localStorage.getItem('usersRecordsmen')) {
                                recordsmen.push(nowUser);
                                localStorage.setItem('usersRecordsmen', JSON.stringify(recordsmen));
                            } else {
                                const newRecordsmen = JSON.parse(localStorage.getItem('usersRecordsmen'));
                                newRecordsmen.push(nowUser);
                                newRecordsmen.sort((a, b) => Number(a.score) - Number(b.score));
                                localStorage.setItem('usersRecordsmen', JSON.stringify(newRecordsmen));
                            }
                            const newRecordsmen = JSON.parse(localStorage.getItem('usersRecordsmen'));
                            btnNewGame.classList.add('none');
                            document.querySelector('.timer-section').classList.add('none');
                            // create table
                            document.querySelector('.tableOfRecords').classList.remove('none');
                            const table = document.querySelector('.tableOfRec');
                            table.classList.add('show-table');
                            for (let i = 0; i < 10; i++) {
                                const newRow = table.insertRow(i);
                                const newCell1 = newRow.insertCell(0);
                                const newCell2 = newRow.insertCell(1);
                                const newCell3 = newRow.insertCell(2);
                                newCell1.innerHTML = newRecordsmen[i].firstName;
                                newCell2.innerHTML = newRecordsmen[i].lastName;
                                newCell3.innerHTML = newRecordsmen[i].time;
                                document.querySelector('.tableOfRec').appendChild(newRow);
                            }

                            // congratulations
                            setTimeout(() => {
                                alert(`Congratulations, ${nowUser.firstName}! You Won.`);
                            }, 1300);
                        }
                    }, 600);

                    this.field.turnedCard = null;

                } else {
                    setTimeout(() => {
                        this.render.classList.toggle('turn');
                        turnedCard.render.classList.toggle('turn');
                        this.field.clickable = true;
                    }, 1000);
                    this.field.turnedCard = null;
                }
            }
        }
    }

    // open settings window

    btnNewGame.addEventListener('click', () => {
        clearTimeout(timerId);
        timer.innerHTML = '0:0';
        overlay.classList.add('show');
        popup.classList.add('show-anim');
    });

    // return to main page

    window.addEventListener('keydown', (event) => {
        if (event.keyCode === 27) {
            if (popup.classList.contains('show-anim')) {
                popup.classList.remove('show-anim');
                overlay.classList.remove('show');
            }
        }

        // start game

        const myEvent = new Event('click');
        if (event.keyCode === 13 || event.keyCode === 32) {
            if (popup.classList.contains('show-anim')) {
                btnStart.dispatchEvent(myEvent);
            }
        }
    });
    overlay.addEventListener('click', () => {
        if (popup.classList.contains('show-anim')) {
            popup.classList.remove('show-anim');
            overlay.classList.remove('show');
        }
    });

    // game settings

    cardStyles.addEventListener('click', (event) => {
        const lis = cardStyles.children;
        removeActive(lis);

        const li = event.target;
        li.classList.add('active');
        switch (li) {
            case lis[0]:
                shirtStyle = 1;
                break;
            case lis[1]:
                shirtStyle = 2;
                break;
            case lis[2]:
                shirtStyle = 3;
                break;
            // no default
        }
    });

    difficulties.addEventListener('click', (event) => {
        const lis = difficulties.children;
        removeActive(lis);

        const li = event.target;
        li.classList.add('active');
        switch (li) {
            case lis[0]:
                cardsNumber = 10;
                break;
            case lis[1]:
                cardsNumber = 18;
                break;
            case lis[2]:
                cardsNumber = 24;
                break;
            // no default
        }
    });

    // creating new game

    btnStart.addEventListener('click', () => {
        // add new user to Local Storage

        const users = document.querySelectorAll('input');
        const firstName = users[0].value;
        const lastName = users[1].value;
        const email = users[2].value;
        const allUsers = [];
        const newUser = {
            userId: firstName.toString() + lastName.toString() + email.toString(),
            firstName,
            lastName,
            email,
        };
        if (!localStorage.getItem('allUsers')) {
            allUsers.push(newUser);
            localStorage.setItem('allUsers', JSON.stringify(allUsers));
        } else {
            const retArr = JSON.parse(localStorage.getItem('allUsers'));
            if (!retArr.find(item => item.userId === newUser.userId)) {
                retArr.push(newUser);
                localStorage.setItem('allUsers', JSON.stringify(retArr));
            }
        }
        const game = new Game();

        game.createField();
        game.generateCardSet();
        game.renderCards();
        popup.classList.remove('show-anim');
        overlay.classList.remove('show');
        runTimer();
    });
}());
