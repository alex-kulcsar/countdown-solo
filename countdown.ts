namespace Countdown {
    export function getWordLists(): TernaryStringSet[] {
        return [
            null, // No zero-length words.
            null, // No one-character words.
            WordLists.words2,
            WordLists.words3,
            WordLists.words4,
            WordLists.words5,
            WordLists.words6,
            WordLists.words7,
            WordLists.words8,
            WordLists.words9,
        ]
    }
}