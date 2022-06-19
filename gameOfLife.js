let boardWidth = 50
let boardHeight = 50
let play = false
let mouseDown = false
let cellColor = ""
let aliveCells = []
let deadCells = []

function createBoard() {
    let width = parseInt(document.getElementById("boardWidthInput").value);
    let height = parseInt(document.getElementById("boardHeightInput").value);
    boardWidth = width
    boardHeight = height
    let board = getBoard()
    board.innerHTML = ""
    board.style.backgroundColor = document.getElementById("backGroundColorInput").value
    cellColor = document.getElementById("cellColorInput").value
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let cell = document.createElement("span")
            cell.setAttribute("onmousedown", "boardMouseDown(this)")
            cell.setAttribute("onmouseover", "cellMousedOver(this)")
            cell.setAttribute("onmouseup", "boardMouseUp()")
            cell.setAttribute("position", i*width+j)
            if(document.getElementById("cellBorderInput").checked) {
                cell.style.borderStyle = "solid"
                cell.style.borderWidth = "1px"
                cell.style.borderColor = document.getElementById("borderColorInput").value
            }
            let size = document.getElementById("cellSizeInput").value
            let pixels = `${size}px`
            cell.style.height = pixels
            cell.style.width = pixels
            cell.classList.add("cell")
            board.append(cell)
        }
        board.append(document.createElement("br"))
    }
}

function isCellAlive(cells, position) {
    return !isCellDead(cells, position)
}

function isCellDead(cells, position) {
    return cells[position].style.backgroundColor === ""
}

function createCell(cells, position) {
    cells[position].style.backgroundColor = cellColor
}

function killCell(cells, position) {
    cells[position].style.backgroundColor = ""
}

function getBoard() {
    return document.getElementById("board")
}

function getCells() {
    return document.getElementsByClassName("cell")
}

function boardMouseDown(element){
    mouseDown = true
    cellMousedOver(element)
}

function boardMouseUp(){
    mouseDown = false
}

function cellMousedOver(element) {
    if(mouseDown) {
        let position = element.getAttribute("position")
        aliveCells.push(position)
    }
}

function fillBoardRandomly() {
    let cells = getCells()
    let generation = []
    for (let i = 0; i < cells.length; i++) {
        let randomNumber = Math.floor(Math.random() * 100)
        if (randomNumber < 25) {
            generation[i] = true
        }
    }
    fillBoard(generation)
}

function fillBoard(cellStates) {
    aliveCells = []
    deadCells = []
    let cells = getCells()
    for (let i = 0; i < cells.length; i++) {
        if (cellStates[i]) {
            createCell(cells, i)
            aliveCells.push(i)
        } else {
            killCell(cells, i)
        }
    }
}

async function playGame() {
    play = true
    let generations = 0
    let sleepDuration = 1000 / Math.abs(parseInt(document.getElementById("generationsPerSecondInput").value))
    let endTime = Date.now() + 1000
    while (play) {
        let currentTime = Date.now()
        if(currentTime >= endTime) {
            endTime = currentTime + 1000
            document.getElementById("generationsPerSecond").innerText = generations
            generations = 0
            
            let actualRate = Math.abs(parseInt(document.getElementById("generationsPerSecond").innerText))
            let targetRate = Math.abs(parseInt(document.getElementById("generationsPerSecondInput").value))
            if(actualRate === 0) {
                sleepDuration = 1
            }else if(targetRate === 0) {
                sleepDuration = 1
                stop()
            } else {
                let genTime = (1000 / actualRate) - sleepDuration
                sleepDuration = (1000 / targetRate)  - genTime
                if(sleepDuration < 0) {
                    sleepDuration = 0
                }
            }
        }
        nextGeneration()
        generations++
        await sleep(sleepDuration)
    }
}

function stop() {
    play = false
    document.getElementById("generationsPerSecond").innerText = "0"
}

function nextGeneration() {
    let cells = getCells()
    let nextGeneration = []
    for(let i = 0; i < aliveCells.length; i++) {
        let aliveNeighbors = getAliveNeighbors(cells, aliveCells[i])
        if(aliveNeighbors === 3 || aliveNeighbors === 2) {
            nextGeneration[aliveCells[i]] = true
        }
    }
    for(let i = 0; i < deadCells.length; i++) {
        if(deadCells[i] === 3){
            nextGeneration[i] = true
        }
    }
    fillBoard(nextGeneration)
}

// function nextGeneration() {
//     let cells = getCells()
//     let nextGeneration = []
//     for (let i = 0; i < cells.length; i++) {
//         let aliveNeighbors = getAliveNeighbors(cells, i)
//         if(aliveNeighbors === 3 || (aliveNeighbors === 2 && isCellAlive(cells, i))){
//             nextGeneration[i] = true
//         } else {
//             nextGeneration[i] = false
//         }
//     }
//     fillBoard(nextGeneration)
// }

function getAliveNeighbors(cells, position) {
    let leftEdge = false
    let rightEdge = false
    let remainder = position % boardWidth
    if (remainder === 0) {
        leftEdge = true
    } else if (remainder === boardWidth - 1) {
        rightEdge = true
    }

    let possibleNeighbors = [
        position - boardWidth - 1,
        position - boardWidth,
        position - (boardWidth - 1),
        position - 1, position + 1,
        position + (boardWidth - 1),
        position + boardWidth,
        position + boardWidth + 1
    ]

    let aliveNeighbors = 0;
    for (let n = 0; n < possibleNeighbors.length; n++) {
        let neighbor = possibleNeighbors[n]
        if (neighbor < 0 || neighbor >= boardWidth * boardHeight) {
            continue
        }
        if (leftEdge && neighbor % boardWidth === boardWidth - 1) {
            continue
        }
        if (rightEdge && neighbor % boardWidth === 0) {
            continue
        }
        if(isCellAlive(cells, neighbor)) {
            aliveNeighbors++
        } else {
            if(deadCells[neighbor] !== undefined) {
                deadCells[neighbor]++
            } else {
                deadCells[neighbor] = 1
            }
        }
    }
    return aliveNeighbors
}

// function getAliveNeighbors(cells, position) {
//     let leftEdge = false
//     let rightEdge = false
//     let remainder = position % boardWidth
//     if (remainder === 0) {
//         leftEdge = true
//     } else if (remainder === boardWidth - 1) {
//         rightEdge = true
//     }
//
//     let possibleNeighbors = [
//         position - boardWidth - 1,
//         position - boardWidth,
//         position - (boardWidth - 1),
//         position - 1, position + 1,
//         position + (boardWidth - 1),
//         position + boardWidth,
//         position + boardWidth + 1
//     ]
//
//     let aliveNeighbors = 0;
//     for (let n = 0; n < possibleNeighbors.length; n++) {
//         let neighbor = possibleNeighbors[n]
//         if (neighbor < 0 || neighbor >= boardWidth * boardHeight) {
//             continue
//         }
//         if (leftEdge && neighbor % boardWidth === boardWidth - 1) {
//             continue
//         }
//         if (rightEdge && neighbor % boardWidth === 0) {
//             continue
//         }
//         if(isCellAlive(cells, neighbor)) {
//             aliveNeighbors++
//         }
//     }
//     return aliveNeighbors
// }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
