namespace Countdown {
    const OPERATIONS: string[] = ['+', '-', 'x', '/',]
    const BIGS: number[] = [25, 50, 75, 100,]
    const BIGS_ALT: number[] = [12, 37, 62, 87,]

    export interface NumbersRound {
        nums: number[]
        target: number
        solution: Value
        allSolutions: Value[]
        ready: boolean
        started: boolean
        solved: boolean
    }

    class Value {
        public lhs: Value
        public operator: string
        public rhs: Value
        public steps: number
        public value: number

        constructor(v: number) {
            this.value = v
            this.lhs = null
            this.rhs = null
            this.operator = ''
            this.steps = 0
        }

        public combine(rhs: Value, operator: string): Value {
            let n: number
            switch (operator) {
                case '+':
                    n = this.value + rhs.value
                    break

                case 'x':
                case '*':
                    n = this.value * rhs.value
                    break

                case '-':
                    n = this.value - rhs.value
                    if (n < 1) {
                        return null
                    }
                    break

                case '/':
                    n = this.value / rhs.value
                    if (Math.floor(n) != n) {
                        return null
                    }
                    break

                default:
                    throw `Value.combine: Unknown operator ${operator}`
            }

            let v: Value = new Value(n)
            v.lhs = this
            v.rhs = rhs
            v.operator = operator
            let steps: number = 0
            if (this.lhs != null) {
                steps += this.lhs.steps
            }
            if (this.rhs != null) {
                steps += this.rhs.steps
            }
            v.steps = steps + 1
            return v
        }

        /**
         * Compares this value to another value, returning zero if the values are equal,
         * a negative number if this value precedes the other value, or a positive number
         * otherwise.
         *
         * @param {Value} rhs The other value to compare this value to.
         * @param {number} target The round's target number.
         */
        public compareTo(rhs: Value, target: number): number {
            const lDist: number = Math.abs(this.value - target)
            const rDist: number = Math.abs(rhs.value - target)
            if (lDist != rDist) {
                return lDist - rDist
            }

            const lSteps: number = this.steps
            const rSteps: number = rhs.steps
            if (lSteps != rSteps) {
                return lSteps - rSteps
            }

            return this.listSteps().length - rhs.listSteps().length
        }

        public listSteps(): string {
            if (this.lhs == null) {
                return `${this.value} = ${this.value}`
            }

            function steps(v: Value): string {
                if (v.lhs == null) {
                    return ''
                }
                const prevSteps: string = steps(v.lhs) + steps(v.rhs)
                return prevSteps + `${v.lhs.value} ${v.operator} ${v.rhs.value} = ${v.value}\n`
            }

            return steps(this).trim()
        }
    }

    let bigs: number[] = []
    let smalls: number[] = []
    let currBig: number = 0
    let currSmall: number = 0

    function init() {
        bigs = BIGS.slice()
        smalls = []
        for (let i: number = 1; i <= 10; i++) {
            smalls.push(i)
            smalls.push(i)
        }
    }

    export function getNextBig(): number {
        currBig++
        if (currBig > bigs.length) {
            currBig = 1
        }
        return bigs[currBig - 1]
    }

    export function getNextSmall(): number {
        currSmall++
        if (currSmall > smalls.length) {
            currSmall = 1
        }
        return smalls[currSmall - 1]
    }

    export function startNumbersRound(): void {
        if (smalls.length == 0) {
            init()
        }
        Array.shuffle(bigs)
        Array.shuffle(smalls)
        currBig = 0
        currSmall = 0
    }

    /**
     * Numbers solver
     * Reference: https://www.cgjennings.ca/articles/countdown-numbers/
     */
    function consider(value: Value, n: NumbersRound): void {
        if (value.compareTo(n.solution, n.target) < 0) {
            n.solution = value
        }

        if (value.value == n.target) {
            n.allSolutions.push(value)
        }
    }

    function reduce(values: Value[], skipIndex1: number, skipIndex2: number, combined: Value) {
        const copy: Value[] = [combined,]
        for (let i: number = 0; i < values.length; i++) {
            if (i == skipIndex1 || i == skipIndex2) {
                continue
            }
            copy.push(values[i])
        }
        return copy
    }

    function solveImpl(values: Value[], n: NumbersRound): void {
        for (let i: number = 0; i < values.length - 1; i++) {
            for (let j: number = i + 1; j < values.length; j++) {
                solveInnerLoop(values, n, i, j)
            }
        }
    }

    function solveInnerLoop(
        values: Value[], n: NumbersRound, i: number, j: number
    ): void {
        // Get pair of values to combine and ensure that they are in sorted order.
        let lhs: Value = values[i]
        let rhs: Value = values[j]
        if (lhs.value < rhs.value) {
            [lhs, rhs] = [rhs, lhs]
        }

        // Try combining the values with each operation.
        for (let op of OPERATIONS) {
            const result: Value = lhs.combine(rhs, op)
            if (result == null) {
                continue
            }
            consider(result, n)

            // If there are more than two values left in the list,
            // + then we can still make more pairs from the shorter list.
            if (values.length > 2) {
                const reducedValues: Value[] = reduce(values, i, j, result)
                solveImpl(reducedValues, n)
            }
        }
    }

    export function solve(n: NumbersRound): void {
        let values: Value[] = n.nums.map((num: number, index: number) => new Value(num))
        n.solution = values[0]
        values.forEach((v: Value, index: number) => consider(v, n))
        solveImpl(values, n)
        n.allSolutions.sort((v1: Value, v2: Value) => v1.compareTo(v2, n.target))
        n.solved = true
    }

    /**
     * Allow solution to be built asynchronously.
     */
    let asyncValues: Value[] = null
    let currValue: number = 0
    let lhsIndex: number = 0
    let rhsIndex: number = 0
    let finalLog: boolean = false

    export function initSolve(n: NumbersRound): void {
        // console.log(`Init started ${game.runtime()}.`)
        asyncValues = n.nums.map((num: number, index: number) => new Value(num))
        n.solution = asyncValues[0]
        n.started = true
        n.solved = false
        finalLog = false
        currValue = 0
        lhsIndex = 0
        rhsIndex = 1
    }

    export function nextSolveStep(n: NumbersRound): void {
        if (n.solved) {
            if (!finalLog) {
                // console.log(`Solved @ ${game.runtime()}.`)
                finalLog = true
            }
            return
        }
        if (!n.started) {
            initSolve(n)
            return
        }
        if (currValue < asyncValues.length) {
            // console.log(`Consider pass ${currValue} started @ ${game.runtime()}.`)
            consider(asyncValues[currValue], n)
            currValue++
        } else {
            // Update indices
            if (rhsIndex >= asyncValues.length) {
                lhsIndex++
                if (lhsIndex >= asyncValues.length - 1) {
                    // Finished both loops; we're done.
                    /*
                    console.log(`Sort started on ${n.allSolutions.length} items @ ${game.runtime()}.`)
                    n.allSolutions.sort((v1: Value, v2: Value) =>
                        v1.compareTo(v2, n.target))
                        */
                    n.solved = true
                } else {
                    rhsIndex = lhsIndex + 1
                }
            }
            if (!n.solved) {
                // console.log(`Inner loop pass ${lhsIndex}-${rhsIndex} started @ ${game.runtime()}.`)
                solveInnerLoop(asyncValues, n, lhsIndex, rhsIndex)
                rhsIndex++
            }
        }
    }
}