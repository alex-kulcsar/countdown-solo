namespace SpriteKind {
    export const Setup = SpriteKind.create()
    export const SelectScreen = SpriteKind.create()
    export const LettersRound = SpriteKind.create()
    export const EnteringWord = SpriteKind.create()
    export const WordWaiting = SpriteKind.create()
    export const NumbersRound = SpriteKind.create()
    export const EnteringNumbers = SpriteKind.create()
    export const ConundrumRound = SpriteKind.create()
    export const Waiting = SpriteKind.create()
}

const COUNTDOWN_SPRITE_KINDS: number[] = [
    SpriteKind.Setup,
    SpriteKind.SelectScreen,
    SpriteKind.LettersRound,
    SpriteKind.EnteringWord,
    SpriteKind.WordWaiting,
    SpriteKind.NumbersRound,
    SpriteKind.ConundrumRound,
    SpriteKind.Waiting,
]

let gameMode: number = 0

/**
 * Variables and functions for letters round.
 */
let letterTiles: TextSprite[] = []
let currentLetterPuzzle: string = ""
let currentLetterSolution: string = ""
let numConsonants: number = 0
let numVowels: number = 0
let currLetter: number = 0
let instructionsSprite: TextSprite

function resetScreen(): void {
    for (let k of COUNTDOWN_SPRITE_KINDS) {
        sprites.destroyAllSpritesOfKind(k)
    }
    answerSprite = null
    doneButton = null
}

function addConsonant(): void {
    if (currLetter == 9) {
        return
    }
    if (numConsonants == 6) {
        game.showLongText("You must select at least three vowels.",
            DialogLayout.Bottom)
        return
    }
    numConsonants++
    addLetter(Countdown.getNextConsonant())
}

function addLetter(letter: string): void {
    letterTiles[currLetter].setText(letter)
    currentLetterPuzzle += letter
    currLetter++
    if (currLetter == 9) {
        instructionsSprite.setText("")
        info.startCountdown(30)
        timer.after(5000, findLetterPuzzleSolution)
    }
}

function addVowel(): void {
    if (currLetter == 9) {
        return
    }
    if (numVowels == 5) {
        game.showLongText("You must select at least four consonants.",
            DialogLayout.Bottom)
        return
    }
    numVowels++
    addLetter(Countdown.getNextVowel())
}

function beginLettersRound(): void {
    gameMode = SpriteKind.LettersRound
    Countdown.startLettersRound()
    resetScreen()
    currentLetterPuzzle = ""
    currentLetterSolution = ""
    numConsonants = 0
    numVowels = 0
    currLetter = 0
    letterTiles = []
    let x: number = 8
    let y: number = 60
    for (let i: number = 0; i < 9; i++) {
        let t: TextSprite = textsprite.create(" ",
            8, // background = blue
            1  // foreground = white
        )
        t.setBorder(1, 6 /* dark cyan */, 1)
        t.setMaxFontHeight(10)
        t.setPosition(x, y)
        t.setKind(gameMode)
        x += 18
        letterTiles.push(t)
    }
    instructionsSprite = textsprite.create("A = Consonant, B = Vowel",
        0, // background = transparent
        5   // foreground = yellow
    )
    instructionsSprite.setPosition(80, 90)
    instructionsSprite.setKind(gameMode)
}

function endLettersRound(): void {
    let header: TextSprite = textsprite.create(
        currentLetterSolution.length > 0 ?
            "Possible solution:" :
            "No nine-letter solution",
        0, // transparent background
        5  // foreground = yellow
    )
    header.setPosition(80, 10)
    header.setKind(gameMode)
    if (currentLetterSolution.length > 0) {
        answerText = currentLetterSolution
        answerSprite.fg = 5 // yellow
        answerSprite.update()
    }
    instructionsSprite.setText("")
    showWaiting()
}

function findLetterPuzzleSolution(): void {
    let lists: TernaryStringSet[] = [
        WordLists.words9,
        WordLists.words8,
        WordLists.words7,
        WordLists.words6,
        WordLists.words5,
        WordLists.words4,
        WordLists.words3,
    ]
    for (let s of lists) {
        let candidates: string[] = s.getArrangementsOf(currentLetterPuzzle)
        if (candidates.length > 0) {
            currentLetterSolution = candidates._pickRandom()
            break
        }
    }
}

let answerText: string = ""
let selectedLetter: number = 0
let doneButton: TextSprite = null
let answerSprite: TextSprite = null
function startEnteringWord(): void {
    gameMode = SpriteKind.EnteringWord
    for (let l of letterTiles) {
        l.fg = 1 // white
        l.update()
    }
    answerText = ""
    selectedLetter = 0
    highlightLetter(selectedLetter, true)
    if (doneButton == null) {
        doneButton = textsprite.create("Done",
            8, // background = blue
            5  // foreground = yellow
        )
        doneButton.setBorder(1, 6 /* dark cyan */, 2)
        doneButton.setPosition(80, 75)
        doneButton.setKind(gameMode)
    }
    if (answerSprite == null) {
        answerSprite = textsprite.create("",
            0, // transparent background
            1  // foreground = white
        )
        answerSprite.maxFontHeight = 12
        answerSprite.y = 20
        answerSprite.setKind(gameMode)
    }
    answerSprite.fg = 1 // white
    updateAnswerSprite()
    instructionsSprite.setText("")
}

function highlightLetter(index: number, highlightOn: boolean): void {
    letterTiles[index].borderColor =
        highlightOn ? 5 /* yellow */ : 6 /* dark cyan */
    letterTiles[index].update()
}

function moveToDone(): void {
    highlightLetter(selectedLetter, false)
    doneButton.borderColor = 5 // yellow
    doneButton.update()
}

function moveToLetter(): void {
    doneButton.borderColor = 6 // dark cyan
    doneButton.update()
    highlightLetter(selectedLetter, true)
}

function addSelectedLetter(): void {
    let l: TextSprite = letterTiles[selectedLetter]
    if (l.fg != l.bg) {
        l.fg = l.bg
        l.update()
        answerText += l.text
        updateAnswerSprite()
    }
}

function deleteLetter(): void {
    let deleted: string = answerText.substr(-1)
    answerText = answerText.substr(0, answerText.length - 1)
    updateAnswerSprite()
    for (let l of letterTiles) {
        if (l.fg == l.bg && l.text == deleted) {
            l.fg = 1 // white
            l.update()
            break
        }
    }
}

function updateAnswerSprite(): void {
    answerSprite.setText(answerText)
    answerSprite.x = 80
    answerSprite.update()
}

function verifyWord(): void {
    if (answerText.length > 2 && Countdown.isWordValid(answerText)) {
        info.setScore(answerText.length)
        answerSprite.fg = 7 // green
        music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
    } else {
        answerSprite.fg = 2 // red
        music.play(music.melodyPlayable(music.buzzer), music.PlaybackMode.UntilDone)
    }
    answerSprite.update()
    doneButton.borderColor = 6 // dark cyan
    doneButton.update()
    instructionsSprite.setText("A=New round B=Enter word")
    instructionsSprite.x = 80
    instructionsSprite.update()
    gameMode = SpriteKind.WordWaiting
}

/**
 * Variables and functions for numbers round.
 */
let numberTiles: TextSprite[] = []
let targetTile: TextSprite = null
let numbersRound: Countdown.NumbersRound = null
let numBigs: number = 0
let numSmalls: number = 0
let currNumber: number = 0
let currRandomization: number = 0

function addBig(): void {
    if (currNumber == 6) {
        return
    }
    if (numBigs == 4) {
        game.showLongText("There are only 4 big numbers.",
            DialogLayout.Bottom)
        return
    }
    numBigs++
    addNumber(Countdown.getNextBig())
}

function addNumber(n: number): void {
    let t: string = n.toString()
    if (t.length == 1) {
        t = " " + t + " "
    } else if (t.length == 2) {
        t = " " + t
    }
    numberTiles[currNumber].setText(t)
    numbersRound.nums.push(n)
    currNumber++
    if (currNumber == 6) {
        instructionsSprite.setText("")
        startTargetRandomization()
    }
}

function addSmall(): void {
    if (currNumber == 6) {
        return
    }
    numSmalls++
    addNumber(Countdown.getNextSmall())
}

function beginNumbersRound(): void {
    gameMode = SpriteKind.NumbersRound
    Countdown.startNumbersRound()
    resetScreen()
    numbersRound = {
        nums: [],
        target: 0,
        solution: null,
        allSolutions: [],
        ready: false,
        started: false,
        solved: false,
    }
    numBigs = 0
    numSmalls = 0
    currNumber = 0
    numberTiles = []
    targetTile = textsprite.create("   ",
        8, // blue background
        1  // white foreground
    )
    targetTile.maxFontHeight = 12
    targetTile.setBorder(1, 6 /* dark cyan */, 2)
    targetTile.setPosition(80, 20)
    targetTile.setKind(gameMode)
    let x: number = 17
    let y: number = 60
    for (let i: number = 0; i < 6; i++) {
        let tile: TextSprite = textsprite.create("   ",
            8, // blue background
            1  // white foreground
        )
        tile.setBorder(1, 6, 1)
        tile.setPosition(x, y)
        tile.setKind(gameMode)
        numberTiles.push(tile)
        x += 25
    }
    instructionsSprite = textsprite.create("A = Small, B = Big",
        0, // background = transparent
        5   // foreground = yellow
    )
    instructionsSprite.setPosition(80, 100)
    instructionsSprite.setKind(gameMode)
}

function endNumbersRound(): void {
    music.stopAllSounds()
    let msg: string = ""
    if (numbersRound.solution != null) {
        msg = "Solution:\n" +
            numbersRound.solution.listSteps()
    } else {
        msg = "No solution found."
    }
    game.showLongText(msg, DialogLayout.Bottom)
    showWaiting()
}

function startTargetRandomization(): void {
    currRandomization = 0
    timer.after(500, updateTargetRandomization)
}

function updateNumbersSolution(): void {
    if (gameMode != SpriteKind.NumbersRound
        || numbersRound == null
        || !numbersRound.ready
        // || numbersRound.solved
    ) {
        return
    }
    Countdown.nextSolveStep(numbersRound)
}

function updateTargetRandomization(): void {
    let target: number = randint(100, 999)
    targetTile.setText(target.toString())
    currRandomization++
    if (currRandomization >= 20) {
        numbersRound.target = target
        info.startCountdown(30)
        // music.play(music.stringPlayable("E F G F E G B C5 ", 120), music.PlaybackMode.LoopingInBackground)
        // timer.after(2000, () => Countdown.solve(numbersRound))
        timer.after(2000, () => {
            numbersRound.ready = true
        })
    } else {
        timer.after(100, updateTargetRandomization)
    }
}

let operationSprites: TextSprite[] = []
let operations: string[] = ["+", "-", "x", "/", "="]
let selectedNumber: number = 0
let selectedOperation: number = 0
interface calculation {
    // tile indices
    lhs: number
    op: number
    rhs: number
}
let currOperation: calculation = null
enum numberRoundLocation {
    LeftNumber,
    Operator,
    RightNumber,
}
let currCalcLocation: numberRoundLocation
function startEnteringNumbers(): void {
    gameMode = SpriteKind.EnteringNumbers
    operationSprites = []
    let x: number = 29
    let y: number = 75
    for (let o of operations) {
        let s: TextSprite = textsprite.create(o,
            8, // background = blue
            1  // foreground = white
        )
        s.setBorder(1, 6, 1)
        s.setPosition(x, y)
        s.setKind(gameMode)
        operationSprites.push(s)
        x += 25
    }
    answerSprite = textsprite.create("",
        0, // transparent background
        1  // foreground = white
    )
    answerText = ""
    answerSprite.fg = 1 // white
    answerSprite.y = 45
    updateAnswerSprite()
    currOperation = {
        lhs: -1,
        op: -1,
        rhs: -1,
    }
    currCalcLocation = numberRoundLocation.LeftNumber
    selectedNumber = 0
    selectedOperation = 0
    instructionsSprite.setText("Choose = when done")
    instructionsSprite.x = 80
    instructionsSprite.update()
    highlightNumber(0, true)
}

function showCurrOperation(): void {
    answerText = ""
    if (currOperation.lhs > -1) {
        answerText += numberTiles[currOperation.lhs].text
    }
    if (currOperation.op > -1) {
        answerText += " " + operationSprites[currOperation.op].text
    }
    updateAnswerSprite()
}

function highlightNumber(index: number, highlightOn: boolean): void {
    numberTiles[index].borderColor =
        highlightOn ? 5 /* yellow */ : 6 /* dark cyan */
    numberTiles[index].update()
}

function highlightOp(index: number, highlightOn: boolean): void {
    operationSprites[index].borderColor =
        highlightOn ? 5 /* yellow */ : 6 /* dark cyan */
    operationSprites[index].update()
}

function moveToOps(): void {
    highlightNumber(selectedNumber, false)
    highlightOp(selectedOperation, true)
}

function moveToNumbers(): void {
    highlightNumber(selectedNumber, true)
    highlightOp(selectedOperation, false)
}

function numbersSelect(): void {
    let ts: TextSprite
    switch (currCalcLocation) {
        case numberRoundLocation.LeftNumber:
            ts = numberTiles[selectedNumber]
            if (ts.fg != ts.bg) {
                currOperation.lhs = selectedNumber
                showCurrOperation()
                ts.fg = ts.bg
                moveToOps()
                currCalcLocation = numberRoundLocation.Operator
            }
            break

        case numberRoundLocation.Operator:
            if (selectedOperation == 4) {
                let answer: number = parseInt(numberTiles[currOperation.lhs].text)
                let difference: number = Math.abs(answer - numbersRound.target)
                if (difference == 0) {
                    music.play(music.melodyPlayable(music.powerUp), music.PlaybackMode.UntilDone)
                    info.setScore(10)
                } else if (difference < 6) {
                    music.play(music.melodyPlayable(music.jumpUp), music.PlaybackMode.UntilDone)
                    info.setScore(7)
                } else if (difference < 11) {
                    music.play(music.melodyPlayable(music.baDing), music.PlaybackMode.UntilDone)
                    info.setScore(5)
                } else {
                    music.play(music.melodyPlayable(music.wawawawaa), music.PlaybackMode.UntilDone)
                    info.setScore(0)
                }
                endNumbersRound()
            } else {
                currOperation.op = selectedOperation
                showCurrOperation()
                moveToNumbers()
                currCalcLocation = numberRoundLocation.RightNumber
            }
            break

        case numberRoundLocation.RightNumber:
            ts = numberTiles[selectedNumber]
            if (ts.fg != ts.bg) {
                currOperation.rhs = selectedNumber
                let lhs: number = parseInt(numberTiles[currOperation.lhs].text)
                let rhs: number = parseInt(numberTiles[currOperation.rhs].text)
                let calc: number = 0
                switch (currOperation.op) {
                    case 0:
                        calc = lhs + rhs
                        break

                    case 1:
                        calc = lhs - rhs
                        break

                    case 2:
                        calc = lhs * rhs
                        break

                    case 3:
                        calc = lhs / rhs
                        break
                }
                if (calc < 0 || Math.round(calc) != calc) {
                    music.play(music.melodyPlayable(music.buzzer), music.PlaybackMode.UntilDone)
                    endNumbersRound()
                } else {
                    if (calc < 10) {
                        numberTiles[currOperation.rhs].setText(` ${calc} `)
                    } else if (calc < 100) {
                        numberTiles[currOperation.rhs].setText(` ${calc}`)
                    } else {
                        numberTiles[currOperation.rhs].setText(`${calc}`)
                    }
                    currOperation.lhs = currOperation.op = currOperation.rhs = -1
                    showCurrOperation()
                    currCalcLocation = numberRoundLocation.LeftNumber
                }
            }
            break
    }
}

function numbersMoveLeft(): void {
    switch (currCalcLocation) {
        case numberRoundLocation.LeftNumber:
        case numberRoundLocation.RightNumber:
            highlightNumber(selectedNumber, false)
            selectedNumber--
            if (selectedNumber < 0) {
                selectedNumber = 5
            }
            highlightNumber(selectedNumber, true)
            break

        case numberRoundLocation.Operator:
            highlightOp(selectedOperation, false)
            selectedOperation--
            if (selectedOperation < 0) {
                selectedOperation = 3
            }
            highlightOp(selectedOperation, true)
            break
    }
}

function numbersMoveRight(): void {
    switch (currCalcLocation) {
        case numberRoundLocation.LeftNumber:
        case numberRoundLocation.RightNumber:
            highlightNumber(selectedNumber, false)
            selectedNumber++
            if (selectedNumber > 5) {
                selectedNumber = 0
            }
            highlightNumber(selectedNumber, true)
            break

        case numberRoundLocation.Operator:
            highlightOp(selectedOperation, false)
            selectedOperation++
            if (selectedOperation > 4) {
                selectedOperation = 0
            }
            highlightOp(selectedOperation, true)
            break
    }
}

/**
 * Variables and functions for conundrum round.
 */

let conundrum: string = ""
let conundrumSolution: string = ""
let conundrumSolnTiles: TextSprite[] = []

function beginConundrum() {
    gameMode = SpriteKind.ConundrumRound
    resetScreen()
    conundrumSolnTiles = []
    conundrum = Countdown.generateConundrum()
    let x: number = 8
    let y: number = 60
    let t: TextSprite
    for (let i: number = 0; i < conundrum.length; i++) {
        t = textsprite.create(conundrum[i],
            8, // background = blue
            1  // foreground = white
        )
        t.setBorder(1, 6 /* dark cyan */, 1)
        t.setMaxFontHeight(10)
        t.setPosition(x, y)
        t.setKind(gameMode)

        t = textsprite.create(" ",
            8, // background = blue
            1  // foreground = white
        )
        t.setBorder(1, 6 /* dark cyan */, 1)
        t.setMaxFontHeight(10)
        t.setPosition(x, y + 20)
        t.setKind(gameMode)
        conundrumSolnTiles.push(t)
        x += 18
    }
    info.startCountdown(30)
    timer.after(2000, solveConundrum)
}

function endConundrum(): void {
    for (let i: number = 0; i < conundrumSolution.length; i++) {
        conundrumSolnTiles[i].setText(conundrumSolution[i])
    }
    showWaiting()
}

function solveConundrum(): void {
    let arrangements: string[] =
        WordLists.words9.getArrangementsOf(conundrum)
    if (arrangements.length > 0) {
        conundrumSolution = arrangements._pickRandom()
    }
}

/**
 * Variables and functions for title, selection, and waiting screens.
 */

let currBuildSprite: TextSprite

function setupScreen(): void {
    gameMode = SpriteKind.Setup
    let ts: TextSprite
    ts = textsprite.create("Countdown",
        8, // background = blue
        1  // foreground = white
    )
    ts.maxFontHeight = 12
    ts.setBorder(2, 6 /* dark cyan */, 2)
    ts.setPosition(80, 20)
    ts.setKind(gameMode)

    ts = textsprite.create("Please wait....")
    ts.setPosition(80, 60)
    ts.setKind(gameMode)

    WordLists.startBuildingWordSets()
    currBuildSprite = textsprite.create(WordLists.currentBuild().toString())
    currBuildSprite.setPosition(80, 100)
    currBuildSprite.setKind(gameMode)
}

function showTitleScreen(): void {
    gameMode = SpriteKind.SelectScreen
    resetScreen()
    let ts: TextSprite
    ts = textsprite.create("Countdown",
        8, // background = blue
        1  // foreground = white
    )
    ts.maxFontHeight = 12
    ts.setBorder(2, 6 /* dark cyan */, 2)
    ts.setPosition(80, 20)
    ts.setKind(gameMode)

    const selections: string[][] = [
        ["←", "= Letters round",],
        ["→", "= Numbers round",],
        ["↑", "= Conundrum",],
    ]
    let left: number[] = [30, 45,]
    let y: number = 60
    for (let s of selections) {
        for (let i: number = 0; i < 2; i++) {
            ts = textsprite.create(s[i], 0, 5)
            ts.left = left[i]
            ts.y = y
            ts.setKind(gameMode)
            ts.update()
        }
        y += 20
    }
}

function showWaiting(): void {
    gameMode = SpriteKind.Waiting
    let ts: TextSprite = textsprite.create("Press A to start new round.",
        0, 3 /* pink */)
    ts.setPosition(80, 110)
    ts.setKind(gameMode)
}

/**
 * Event handlers
 */
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.SelectScreen) {
        beginLettersRound()
    } else if (gameMode == SpriteKind.EnteringWord) {
        highlightLetter(selectedLetter, false)
        selectedLetter--
        if (selectedLetter < 0) {
            selectedLetter = 8
        }
        highlightLetter(selectedLetter, true)
    } else if (gameMode == SpriteKind.EnteringNumbers) {
        numbersMoveLeft()
    }
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.SelectScreen) {
        beginNumbersRound()
    } else if (gameMode == SpriteKind.EnteringWord) {
        highlightLetter(selectedLetter, false)
        selectedLetter++
        if (selectedLetter > 8) {
            selectedLetter = 0
        }
        highlightLetter(selectedLetter, true)
    } else if (gameMode == SpriteKind.EnteringNumbers) {
        numbersMoveRight()
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.SelectScreen) {
        beginConundrum()
    } else if (gameMode == SpriteKind.EnteringWord) {
        if (doneButton.borderColor == 5) {
            moveToLetter()
        } else {
            moveToDone()
        }
    }
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.EnteringWord) {
        if (doneButton.borderColor == 5) {
            moveToLetter()
        } else {
            moveToDone()
        }
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.LettersRound) {
        addConsonant()
    } else if (gameMode == SpriteKind.NumbersRound) {
        addSmall()
    } else if (gameMode == SpriteKind.Waiting) {
        showTitleScreen()
    } else if (gameMode == SpriteKind.EnteringWord) {
        if (doneButton.borderColor == 5) {
            verifyWord()
        } else {
            addSelectedLetter()
        }
    } else if (gameMode == SpriteKind.WordWaiting) {
        endLettersRound()
    } else if (gameMode == SpriteKind.EnteringNumbers) {
        numbersSelect()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.LettersRound) {
        addVowel()
    } else if (gameMode == SpriteKind.NumbersRound) {
        addBig()
    } else if (gameMode == SpriteKind.WordWaiting) {
        startEnteringWord()
    } else if (gameMode == SpriteKind.EnteringWord) {
        deleteLetter()
    }
})

info.onCountdownEnd(function () {
    if (gameMode == SpriteKind.LettersRound) {
        // endLettersRound()
        startEnteringWord()
    } else if (gameMode == SpriteKind.NumbersRound) {
        // endNumbersRound()
        startEnteringNumbers()
    } else if (gameMode == SpriteKind.ConundrumRound) {
        endConundrum()
    }
})

game.onUpdate(() => {
    switch (gameMode) {
        case SpriteKind.Setup:
            if (WordLists.isReady()) {
                showTitleScreen()
            } else if (!WordLists.isBuilding()) {
                currBuildSprite.setText(WordLists.currentBuild().toString())
                WordLists.buildNextWordSet()
            }
            break

        case SpriteKind.NumbersRound:
            updateNumbersSolution()
            break
    }
})

/**
 * Main
 */

// beginLettersRound()
// beginNumbersRound()
// beginConundrum()
setupScreen()