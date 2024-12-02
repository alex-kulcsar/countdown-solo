namespace SpriteKind {
    export const Setup = SpriteKind.create()
    export const SelectScreen = SpriteKind.create()
    export const LettersRound = SpriteKind.create()
    export const NumbersRound = SpriteKind.create()
    export const ConundrumRound = SpriteKind.create()
    export const Waiting = SpriteKind.create()
}

const COUNTDOWN_SPRITE_KINDS: number[] = [
    SpriteKind.Setup,
    SpriteKind.SelectScreen,
    SpriteKind.LettersRound,
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

function resetScreen(): void {
    for (let k of COUNTDOWN_SPRITE_KINDS) {
        sprites.destroyAllSpritesOfKind(k)
    }
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
    let instructions: TextSprite = textsprite.create("A = Consonant, B = Vowel",
        0, // background = transparent
        5   // foreground = yellow
    )
    instructions.setPosition(80, 80)
    instructions.setKind(gameMode)
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
        let soln: TextSprite = textsprite.create(
            currentLetterSolution,
            0, // transparent background
            5  // foreground = yellow
        )
        soln.setPosition(80, 20)
        soln.setKind(gameMode)
    }
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
    let y: number = 40
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
    let instructions: TextSprite = textsprite.create("A = Small, B = Big",
        0, // background = transparent
        5   // foreground = yellow
    )
    instructions.setPosition(80, 80)
    instructions.setKind(gameMode)
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
    }
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.SelectScreen) {
        beginNumbersRound()
    }
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.SelectScreen) {
        beginConundrum()
    }
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.LettersRound) {
        addConsonant()
    } else if (gameMode == SpriteKind.NumbersRound) {
        addSmall()
    } else if (gameMode == SpriteKind.Waiting) {
        showTitleScreen()
    }
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (gameMode == SpriteKind.LettersRound) {
        addVowel()
    } else if (gameMode == SpriteKind.NumbersRound) {
        addBig()
    }
})

info.onCountdownEnd(function () {
    if (gameMode == SpriteKind.LettersRound) {
        endLettersRound()
    } else if (gameMode == SpriteKind.NumbersRound) {
        endNumbersRound()
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