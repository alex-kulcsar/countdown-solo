namespace Countdown {
    interface LetterFreqency {
        letter: string
        count: number
    }
    const CONSONANT_DISTRIBUTION: LetterFreqency[] = [
        { letter: "B", count: 2 },
        { letter: "C", count: 3 },
        { letter: "D", count: 6 },
        { letter: "F", count: 2 },
        { letter: "G", count: 4 },
        { letter: "H", count: 2 },
        { letter: "J", count: 1 },
        { letter: "K", count: 1 },
        { letter: "L", count: 5 },
        { letter: "M", count: 4 },
        { letter: "N", count: 8 },
        { letter: "P", count: 4 },
        { letter: "Q", count: 1 },
        { letter: "R", count: 9 },
        { letter: "S", count: 9 },
        { letter: "T", count: 9 },
        { letter: "V", count: 2 },
        { letter: "W", count: 2 },
        { letter: "X", count: 1 },
        { letter: "Y", count: 1 },
        { letter: "Z", count: 1 },
    ]
    const VOWEL_DISTRIBUTION: LetterFreqency[] = [
        { letter: "A", count: 15 },
        { letter: "E", count: 21 },
        { letter: "I", count: 13 },
        { letter: "O", count: 13 },
        { letter: "U", count: 5 },
    ]
    let consonants: string[] = []
    let vowels: string[] = []
    let currConsonant: number = 0
    let currVowel: number = 0

    function buildLetters(dist: LetterFreqency[]): string[] {
        let toReturn: string[] = []
        for (let d of dist) {
            for (let i: number = 0; i < d.count; i++) {
                toReturn.push(d.letter)
            }
        }
        Array.shuffle(toReturn)
        return toReturn
    }

    function init(): void {
        consonants = buildLetters(CONSONANT_DISTRIBUTION)
        currConsonant = 0
        vowels = buildLetters(VOWEL_DISTRIBUTION)
        currVowel = 0
        if (!WordLists.isReady()) {
            WordLists.buildWordSets()
        }
    }

    export function isWordValid(word: string): boolean {
        const wordLists: TernaryStringSet[] = getWordLists()
        if (wordLists.length <= word.length) {
            return false
        }
        if (wordLists[word.length] == null) {
            return false
        }
        return wordLists[word.length].has(word)
    }

    export function getNextConsonant(): string {
        currConsonant++
        return consonants[currConsonant - 1]
    }

    export function getNextVowel(): string {
        currVowel++
        return vowels[currVowel - 1]
    }

    export function startLettersRound(): void {
        if (consonants.length == 0) {
            init()
        }
        if (consonants.length - currConsonant < 6) {
            consonants = buildLetters(CONSONANT_DISTRIBUTION)
            currConsonant = 0
        }
        if (vowels.length - currVowel < 5) {
            vowels = buildLetters(VOWEL_DISTRIBUTION)
            currVowel = 0
        }
    }
}