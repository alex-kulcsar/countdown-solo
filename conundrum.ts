namespace Countdown {
    function permute<T>(arr: T[]): T[][] {
        const result: T[][] = []
        const stack: { arr: T[], temp: T[] }[] = [{ arr, temp: [] }]

        while (stack.length) {
            const { arr, temp } = stack.pop()
            if (!arr.length) {
                result.push(temp)
            } else {
                for (let i = 0; i < arr.length; i++) {
                    const newArr = arr.slice(0, i).concat(arr.slice(i + 1))
                    stack.push({ arr: newArr, temp: temp.concat([arr[i],]) })
                }
            }
        }
        return result
    }
    
    //% block="get permutations of strings $s"
    export function stringPermutations(s: string[]): string[] {
        const perms: string[][] = permute(s)
        return perms.map((value: string[], index: number) => value.join(""))
    }

    const conundrumCombos = [[2, 7], [3, 6], [4, 5], [2, 2, 5], [2, 3, 4]]

    //% block
    export function generateConundrum(): string {
        if (WordLists.words2 == null) {
            WordLists.buildWordSets()
        }
        const conundrumWordLists: TernaryStringSet[] = getWordLists()
        let conundrum: string = ""
        while (true) {
            let combo: number[] = conundrumCombos._pickRandom()
            let words: string[] = []
            for (let len of combo) {
                words.push(WordLists.getRandomWordFromSet(conundrumWordLists[len]))
            }
            let candidates: string[] = stringPermutations(words)
            for (let c of candidates) {
                if (isWordValid(c)) {
                    continue
                }
            }
            let arrangements: string[] = WordLists.getArrangements(candidates[0], WordLists.words9)
            if (arrangements.length == 1) {
                let solution: string = arrangements[0]
                let newCandidates: string[] = []
                for (let c of candidates) {
                    if (String.distance(c, solution) >= 4) {
                        newCandidates.push(c)
                    }
                }
                if (newCandidates.length > 0) {
                    conundrum = newCandidates._pickRandom()
                    break
                }
            }
        }
        return conundrum
    }
}