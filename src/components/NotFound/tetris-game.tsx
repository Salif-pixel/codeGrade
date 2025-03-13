"use client"

import { useEffect, useCallback, useReducer, useState } from "react"

export const GRID_WIDTH = 10
export const GRID_HEIGHT = 20
export const TICK_SPEED = 500 // Vitesse augmentée pour plus de fluidité

export const TETROMINOES: Record<TetrominoType, number[][]> = {
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
    ],
}

// Couleurs plus vives et adaptées au thème éducatif
export const COLORS: Record<TetrominoType, string> = {
    I: "bg-blue-400 border border-blue-500",
    O: "bg-yellow-400 border border-yellow-500",
    T: "bg-purple-400 border border-purple-500",
    S: "bg-green-400 border border-green-500",
    Z: "bg-red-400 border border-red-500",
    J: "bg-indigo-400 border border-indigo-500",
    L: "bg-orange-400 border border-orange-500",
}




const createEmptyGrid = (): Grid => {
    return Array(GRID_HEIGHT)
        .fill(null)
        .map(() => Array(GRID_WIDTH).fill(null))
}

const initialState: GameState = {
    grid: createEmptyGrid(),
    currentPiece: null,
    nextPiece: "T",
    score: 0,
    lines: 0,
    gameOver: false,
    isPaused: false,
}

type Action =
    | { type: "MOVE_LEFT" }
    | { type: "MOVE_RIGHT" }
    | { type: "ROTATE" }
    | { type: "MOVE_DOWN" }
    | { type: "HARD_DROP" }
    | { type: "NEW_PIECE" }
    | { type: "GAME_OVER" }
    | { type: "TOGGLE_PAUSE" }
    | { type: "RESTART" }

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case "MOVE_LEFT":
            if (!state.currentPiece || state.gameOver || state.isPaused) return state
            const newPosLeft = { ...state.currentPiece.position, x: state.currentPiece.position.x - 1 }
            if (isValidMove(state.grid, state.currentPiece.type, newPosLeft, state.currentPiece.rotation)) {
                return {
                    ...state,
                    currentPiece: { ...state.currentPiece, position: newPosLeft },
                }
            }
            return state

        case "MOVE_RIGHT":
            if (!state.currentPiece || state.gameOver || state.isPaused) return state
            const newPosRight = { ...state.currentPiece.position, x: state.currentPiece.position.x + 1 }
            if (isValidMove(state.grid, state.currentPiece.type, newPosRight, state.currentPiece.rotation)) {
                return {
                    ...state,
                    currentPiece: { ...state.currentPiece, position: newPosRight },
                }
            }
            return state

        case "ROTATE":
            if (!state.currentPiece || state.gameOver || state.isPaused) return state
            const newRotation = (state.currentPiece.rotation + 1) % 4
            if (isValidMove(state.grid, state.currentPiece.type, state.currentPiece.position, newRotation)) {
                return {
                    ...state,
                    currentPiece: { ...state.currentPiece, rotation: newRotation },
                }
            }
            return state

        case "MOVE_DOWN":
            if (!state.currentPiece || state.gameOver || state.isPaused) return state
            const newPosDown = { ...state.currentPiece.position, y: state.currentPiece.position.y + 1 }
            if (isValidMove(state.grid, state.currentPiece.type, newPosDown, state.currentPiece.rotation)) {
                return {
                    ...state,
                    currentPiece: { ...state.currentPiece, position: newPosDown },
                }
            }
            // Si on ne peut pas descendre, on fixe la pièce
            const newGrid = placePiece(state.grid, state.currentPiece)
            const { clearedLines, updatedGrid } = clearLines(newGrid)
            return {
                ...state,
                grid: updatedGrid,
                currentPiece: null,
                score: state.score + clearedLines * 100 + (clearedLines > 1 ? clearedLines * 50 : 0), // Bonus pour lignes multiples
                lines: state.lines + clearedLines,
            }

        case "HARD_DROP":
            if (!state.currentPiece || state.gameOver || state.isPaused) return state
            const dropPos = { ...state.currentPiece.position }
            while (
                isValidMove(state.grid, state.currentPiece.type, { ...dropPos, y: dropPos.y + 1 }, state.currentPiece.rotation)
                ) {
                dropPos.y += 1
            }
            const droppedGrid = placePiece(state.grid, { ...state.currentPiece, position: dropPos })
            const { clearedLines: droppedLines, updatedGrid: droppedUpdatedGrid } = clearLines(droppedGrid)
            return {
                ...state,
                grid: droppedUpdatedGrid,
                currentPiece: null,
                score: state.score + droppedLines * 100 + (dropPos.y - state.currentPiece.position.y) * 2, // Points pour la distance
                lines: state.lines + droppedLines,
            }

        case "NEW_PIECE":
            if (state.gameOver || state.isPaused) return state
            const pieces: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"]
            const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
            const newPiece = {
                type: state.nextPiece,
                position: { x: Math.floor(GRID_WIDTH / 2) - 1, y: 0 },
                rotation: 0,
            }
            if (!isValidMove(state.grid, newPiece.type, newPiece.position, newPiece.rotation)) {
                return { ...state, gameOver: true }
            }
            return {
                ...state,
                currentPiece: newPiece,
                nextPiece: randomPiece,
            }

        case "GAME_OVER":
            return { ...state, gameOver: true }

        case "TOGGLE_PAUSE":
            return { ...state, isPaused: !state.isPaused }

        case "RESTART":
            return {
                ...initialState,
                nextPiece: ["I", "O", "T", "S", "Z", "J", "L"][Math.floor(Math.random() * 7)] as TetrominoType,
            }

        default:
            return state
    }
}

function isValidMove(grid: Grid, type: TetrominoType, position: Position, rotation: number): boolean {
    const piece = TETROMINOES[type]
    const size = piece.length

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const pieceCell = piece[(y + rotation) % size][x]
            if (pieceCell) {
                const worldX = x + position.x
                const worldY = y + position.y
                if (worldX < 0 || worldX >= GRID_WIDTH || worldY >= GRID_HEIGHT || (worldY >= 0 && grid[worldY][worldX])) {
                    return false
                }
            }
        }
    }
    return true
}

function placePiece(grid: Grid, piece: NonNullable<GameState["currentPiece"]>): Grid {
    const newGrid = grid.map((row) => [...row])
    const tetromino = TETROMINOES[piece.type]
    const size = tetromino.length

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = tetromino[(y + piece.rotation) % size][x]
            if (cell) {
                const worldX = x + piece.position.x
                const worldY = y + piece.position.y
                if (worldY >= 0 && worldY < GRID_HEIGHT && worldX >= 0 && worldX < GRID_WIDTH) {
                    newGrid[worldY][worldX] = piece.type
                }
            }
        }
    }
    return newGrid
}

function clearLines(grid: Grid): { clearedLines: number; updatedGrid: Grid } {
    let clearedLines = 0
    const newGrid = grid.filter((row) => {
        const isLineFull = row.every((cell) => cell !== null)
        if (isLineFull) clearedLines++
        return !isLineFull
    })

    while (newGrid.length < GRID_HEIGHT) {
        newGrid.unshift(Array(GRID_WIDTH).fill(null))
    }

    return { clearedLines, updatedGrid: newGrid }
}

export default function TetrisGame() {
    const [state, dispatch] = useReducer(gameReducer, initialState)
    const [ghostPosition, setGhostPosition] = useState<Position | null>(null)

    // Calcul de la position fantôme (où la pièce atterrira)
    useEffect(() => {
        if (!state.currentPiece || state.gameOver || state.isPaused) {
            setGhostPosition(null)
            return
        }

        const dropPos = { ...state.currentPiece.position }
        while (
            isValidMove(state.grid, state.currentPiece.type, { ...dropPos, y: dropPos.y + 1 }, state.currentPiece.rotation)
            ) {
            dropPos.y += 1
        }
        setGhostPosition(dropPos)
    }, [state.currentPiece, state.grid, state.gameOver, state.isPaused])

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft":
                dispatch({ type: "MOVE_LEFT" })
                break
            case "ArrowRight":
                dispatch({ type: "MOVE_RIGHT" })
                break
            case "ArrowDown":
                dispatch({ type: "MOVE_DOWN" })
                break
            case "ArrowUp":
                dispatch({ type: "ROTATE" })
                break
            case " ":
                event.preventDefault() // Empêche le défilement de la page
                dispatch({ type: "HARD_DROP" })
                break
            case "p":
            case "P":
                dispatch({ type: "TOGGLE_PAUSE" })
                break
            case "r":
            case "R":
                dispatch({ type: "RESTART" })
                break
        }
    }, [])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    useEffect(() => {
        if (!state.currentPiece && !state.gameOver && !state.isPaused) {
            dispatch({ type: "NEW_PIECE" })
        }
    }, [state.currentPiece, state.gameOver, state.isPaused])

    useEffect(() => {
        if (state.gameOver || state.isPaused) return

        const tick = () => {
            dispatch({ type: "MOVE_DOWN" })
        }

        const intervalId = setInterval(tick, TICK_SPEED - Math.min(300, state.lines * 5)) // Accélération progressive
        return () => clearInterval(intervalId)
    }, [state.gameOver, state.isPaused, state.lines])

    const renderGrid = () => {
        const displayGrid = state.grid.map((row) => [...row])

        // Ajouter la pièce fantôme
        if (state.currentPiece && ghostPosition && !state.gameOver && !state.isPaused) {
            const piece = TETROMINOES[state.currentPiece.type]
            const size = piece.length
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const cell = piece[(y + state.currentPiece.rotation) % size][x]
                    if (cell) {
                        const worldX = x + ghostPosition.x
                        const worldY = y + ghostPosition.y
                        if (
                            worldY >= 0 &&
                            worldY < GRID_HEIGHT &&
                            worldX >= 0 &&
                            worldX < GRID_WIDTH &&
                            displayGrid[worldY][worldX] === null
                        ) {
                            displayGrid[worldY][worldX] = "ghost"
                        }
                    }
                }
            }
        }

        // Ajouter la pièce actuelle
        if (state.currentPiece) {
            const piece = TETROMINOES[state.currentPiece.type]
            const size = piece.length
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    const cell = piece[(y + state.currentPiece.rotation) % size][x]
                    if (cell) {
                        const worldX = x + state.currentPiece.position.x
                        const worldY = y + state.currentPiece.position.y
                        if (worldY >= 0 && worldY < GRID_HEIGHT && worldX >= 0 && worldX < GRID_WIDTH) {
                            displayGrid[worldY][worldX] = state.currentPiece.type
                        }
                    }
                }
            }
        }

        return displayGrid.map((row, y) => (
            <div key={y} className="flex">
                {row.map((cell, x) => (
                    <div
                        key={`${x}-${y}`}
                        className={`w-6 h-6 border border-gray-800 transition-all duration-100 ${
                            cell === "ghost"
                                ? "bg-gray-800 border-dashed border-gray-600"
                                : cell
                                    ? COLORS[cell as TetrominoType]
                                    : "bg-gray-900"
                        }`}
                    />
                ))}
            </div>
        ))
    }

    const renderNextPiece = () => {
        const piece = TETROMINOES[state.nextPiece]
        return (
            <div className="grid grid-cols-4 gap-1 p-2 bg-gray-800 rounded">
                {piece.map((row: any[], y: any) =>
                    row.map((cell, x) => (
                        <div key={`${x}-${y}`} className={`w-4 h-4 ${cell ? COLORS[state.nextPiece] : "bg-transparent"}`} />
                    )),
                )}
            </div>
        )
    }

    const handleButtonClick = (action: Action["type"]) => {
        dispatch({ type: action })
    }

    return (
        <div className="flex flex-col items-center gap-4 bg-gray-900 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col gap-2">
                    <div className="bg-gray-950 p-1 rounded">{renderGrid()}</div>

                    {/* Contrôles tactiles pour mobile */}
                    <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
                        <button onClick={() => handleButtonClick("MOVE_LEFT")} className="bg-gray-800 p-2 rounded text-center">
                            ←
                        </button>
                        <button onClick={() => handleButtonClick("ROTATE")} className="bg-gray-800 p-2 rounded text-center">
                            ↑
                        </button>
                        <button onClick={() => handleButtonClick("MOVE_RIGHT")} className="bg-gray-800 p-2 rounded text-center">
                            →
                        </button>
                        <button
                            onClick={() => handleButtonClick("MOVE_DOWN")}
                            className="bg-gray-800 p-2 rounded text-center col-span-2"
                        >
                            ↓
                        </button>
                        <button onClick={() => handleButtonClick("HARD_DROP")} className="bg-gray-800 p-2 rounded text-center">
                            ⤓
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-gray-400 mb-2 font-mono">NEXT</h3>
                        {renderNextPiece()}
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 mb-1 font-mono">LINES</div>
                        <div className="text-2xl font-mono">{state.lines.toString().padStart(4, "0")}</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 mb-1 font-mono">SCORE</div>
                        <div className="text-2xl font-mono">{state.score.toString().padStart(4, "0")}</div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded">
                        <div className="text-gray-400 mb-1 font-mono">CONTROLS</div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>↑ Rotate</p>
                            <p>← → Move</p>
                            <p>↓ Down</p>
                            <p>Space Drop</p>
                            <p>P Pause</p>
                            <p>R Restart</p>
                        </div>
                    </div>

                    {(state.gameOver || state.isPaused) && (
                        <div className="bg-gray-800 p-4 rounded text-center">
                            <div className="text-xl font-bold mb-2">{state.gameOver ? "GAME OVER" : "PAUSED"}</div>
                            <button
                                onClick={() => dispatch({ type: "RESTART" })}
                                className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                            >
                                {state.gameOver ? "Restart" : "Resume"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}



export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"

export interface Position {
    x: number
    y: number
}

export interface Tetromino {
    type: TetrominoType
    position: Position
    rotation: number
}

export type Grid = (string | null)[][]

export interface GameState {
    grid: Grid
    currentPiece: Tetromino | null
    nextPiece: TetrominoType
    score: number
    lines: number
    gameOver: boolean
    isPaused: boolean
}



