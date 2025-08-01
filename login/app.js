"use strict";

// === DATA ===

const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2020-05-27T17:01:17.194Z",
        "2020-07-11T23:36:17.929Z",
        "2020-07-12T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT",
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        "2024-11-01T13:15:33.035Z",
        "2024-11-30T09:48:16.867Z",
        "2024-12-25T06:04:23.907Z",
        "2025-01-25T14:18:46.235Z",
        "2025-02-05T16:33:06.386Z",
        "2025-07-14T14:43:26.374Z",
        "2025-07-17T18:49:59.371Z",
        "2025-07-18T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
};

const account3 = {
    owner: "Steven Thomas Williams",
    movements: [200, -200, 340, -300, -20, 50, 400, -460],
    interestRate: 0.7,
    pin: 3333,
};

const account4 = {
    owner: "Sarah Smith",
    movements: [430, 1000, 700, 50, 90],
    interestRate: 1,
    pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// === DOM ELEMENTS ===

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// === APP UTILS / HELPERS ===

// --- formatMovementDate ---

const formatMovementDate = (date, locale) => {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
};

// --- formatCur ---

const formatCur = (value, locale, currency) => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
};

// --- displayMovements ---

const displayMovements = (acc, sort = false) => {
    containerMovements.innerHTML = "";

    const combinedMovsDates = acc.movements.map((mov, i) => ({
        movement: mov,
        movementDate: acc.movementsDates.at(i),
    }));

    sort ? combinedMovsDates.sort((a, b) => a.movement - b.movement) : combinedMovsDates;

    combinedMovsDates.forEach((mov, i) => {
        const { movement, movementDate } = mov;
        const type = movement > 0 ? "deposit" : "withdrawal";

        const date = new Date(movementDate);
        const displayDate = formatMovementDate(date, acc.locale);
        const formattedMov = formatCur(movement, acc.locale, acc.currency);

        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1}
                ${type === "deposit" ? "DEPOSIT" : "WITHDRAWAL"}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>

        `;
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

// --- createUsernames ---

const createUsernames = accs =>
    accs.forEach(
        acc =>
            (acc.username = acc.owner
                .toLowerCase()
                .split(" ")
                .map(acc => acc[0])
                .join("")),
    );

createUsernames(accounts);

// === DISPLAY & BALANCE MANAGEMENT ===

// --- calcDisplaySummary ---

const calcDisplaySummary = acc => {
    const incomes = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

    const outcomes = Math.abs(acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0));
    labelSumOut.textContent = formatCur(outcomes, acc.locale, acc.currency);

    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter(int => int >= 1)
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

// --- calcDisplayBalance ---

const calcDisplayBalance = acc => {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

// --- updateBalances ---

const updateBalances = acc => {
    displayMovements(acc);
    calcDisplayBalance(acc);
    calcDisplaySummary(acc);
};

// --- startLogOutTimer ---

const startLogOutTimer = () => {
    let time = 300;

    const tick = () => {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;

        if (time == 0) {
            clearInterval(timer);
            labelWelcome.textContent = "Log in to get started";
            containerApp.style.opacity = 0;
        }
        time--;
    };

    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};

// === EVENT LISTENERS ===

// --- Login ---

let currentAccount, timer;

btnLogin.addEventListener("click", e => {
    e.preventDefault();

    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

    if (currentAccount?.pin === +inputLoginPin.value) {
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;

        containerApp.style.opacity = 100;
        inputLoginUsername.value = inputLoginPin.value = "";

        const now = new Date();
        const options = {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        };

        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        inputLoginPin.blur();
        inputLoginUsername.blur();

        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
        updateBalances(currentAccount);
    } else {
        containerApp.style.opacity = 0;
        labelWelcome.textContent = "Log in to get started";
    }
});

// --- Transfer Money ---

btnTransfer.addEventListener("click", e => {
    e.preventDefault();

    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    inputTransferAmount.value = inputTransferTo.value = "";

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        updateBalances(currentAccount);

        clearInterval(timer);
        timer = startLogOutTimer();
    }
});

// --- Request Loan ---

btnLoan.addEventListener("click", e => {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(() => {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(new Date().toISOString());
            updateBalances(currentAccount);

            clearInterval(timer);
            timer = startLogOutTimer();
        }, 2500);

        inputLoanAmount.value = "";
    }
});

// --- Close Account ---

btnClose.addEventListener("click", e => {
    e.preventDefault();

    if (currentAccount.pin === +inputClosePin.value && currentAccount.username === inputCloseUsername.value) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        accounts.splice(index, 1);
        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin = "";
});

// --- Sort Transfers ---

let sorted = false;
btnSort.addEventListener("click", e => {
    e.preventDefault();
    sorted = !sorted;
    displayMovements(currentAccount, sorted);
});
