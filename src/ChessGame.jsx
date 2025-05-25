import React, { useState, useRef } from 'react';

// Helper to initialize the chess board
function initialBoard() {
  return [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
  ];
}

// Unicode chess pieces
const pieceUnicode = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

// Utility functions for move logic
function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}
function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}
function inBounds(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Castling rights helper
function initialCastlingRights() {
  return {
    whiteKing: true,
    whiteQueenside: true,
    whiteKingside: true,
    blackKing: true,
    blackQueenside: true,
    blackKingside: true,
  };
}

// Generate all possible moves for a piece at (row, col)
function getLegalMoves(board, row, col, whiteTurn, castlingRights, checkCastling = true) {
  const piece = board[row][col];
  if (!piece) return [];
  const moves = [];
  const directions = {
    N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1],
    NE: [-1, 1], NW: [-1, -1], SE: [1, 1], SW: [1, -1]
  };
  const isWhitePiece = isWhite(piece);

  // Only allow moves for the correct color
  if ((whiteTurn && !isWhitePiece) || (!whiteTurn && isWhitePiece)) return [];

  switch (piece.toUpperCase()) {
    case 'P': {
      // Pawn moves
      const dir = isWhitePiece ? -1 : 1;
      const startRow = isWhitePiece ? 6 : 1;
      // Forward move
      if (inBounds(row + dir, col) && !board[row + dir][col]) {
        moves.push([row + dir, col]);
        // Double move from starting position
        if (row === startRow && !board[row + 2 * dir][col] && !board[row + dir][col]) {
          moves.push([row + 2 * dir, col]);
        }
      }
      // Captures
      for (let dc of [-1, 1]) {
        const nr = row + dir, nc = col + dc;
        if (
          inBounds(nr, nc) &&
          board[nr][nc] &&
          ((isWhitePiece && isBlack(board[nr][nc])) ||
            (!isWhitePiece && isWhite(board[nr][nc])))
        ) {
          moves.push([nr, nc]);
        }
      }
      break;
    }
    case 'N': {
      // Knight moves
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (let [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc;
        if (
          inBounds(nr, nc) &&
          (!board[nr][nc] ||
            (isWhitePiece && isBlack(board[nr][nc])) ||
            (!isWhitePiece && isWhite(board[nr][nc])))
        ) {
          moves.push([nr, nc]);
        }
      }
      break;
    }
    case 'B': {
      // Bishop moves
      for (let [dr, dc] of [directions.NE, directions.NW, directions.SE, directions.SW]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) {
            moves.push([nr, nc]);
          } else {
            if (
              (isWhitePiece && isBlack(board[nr][nc])) ||
              (!isWhitePiece && isWhite(board[nr][nc]))
            ) {
              moves.push([nr, nc]);
            }
            break;
          }
        }
      }
      break;
    }
    case 'R': {
      // Rook moves
      for (let [dr, dc] of [directions.N, directions.S, directions.E, directions.W]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) {
            moves.push([nr, nc]);
          } else {
            if (
              (isWhitePiece && isBlack(board[nr][nc])) ||
              (!isWhitePiece && isWhite(board[nr][nc]))
            ) {
              moves.push([nr, nc]);
            }
            break;
          }
        }
      }
      break;
    }
    case 'Q': {
      // Queen moves
      for (let [dr, dc] of [
        directions.N, directions.S, directions.E, directions.W,
        directions.NE, directions.NW, directions.SE, directions.SW
      ]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i;
          if (!inBounds(nr, nc)) break;
          if (!board[nr][nc]) {
            moves.push([nr, nc]);
          } else {
            if (
              (isWhitePiece && isBlack(board[nr][nc])) ||
              (!isWhitePiece && isWhite(board[nr][nc]))
            ) {
              moves.push([nr, nc]);
            }
            break;
          }
        }
      }
      break;
    }
    case 'K': {
      // King moves
      for (let [dr, dc] of [
        directions.N, directions.S, directions.E, directions.W,
        directions.NE, directions.NW, directions.SE, directions.SW
      ]) {
        const nr = row + dr, nc = col + dc;
        if (
          inBounds(nr, nc) &&
          (!board[nr][nc] ||
            (isWhitePiece && isBlack(board[nr][nc])) ||
            (!isWhitePiece && isWhite(board[nr][nc])))
        ) {
          moves.push([nr, nc]);
        }
      }
      // Castling
      if (checkCastling) {
        // White castling
        if (
          isWhitePiece &&
          row === 7 &&
          col === 4 &&
          castlingRights.whiteKing
        ) {
          // Kingside
          if (
            castlingRights.whiteKingside &&
            !board[7][5] &&
            !board[7][6] &&
            !isKingInCheck(board, true) &&
            !isKingInCheck(makeMove(board, [7, 4], [7, 5]), true) &&
            !isKingInCheck(makeMove(board, [7, 4], [7, 6]), true)
          ) {
            moves.push([7, 6]);
          }
          // Queenside
          if (
            castlingRights.whiteQueenside &&
            !board[7][3] &&
            !board[7][2] &&
            !board[7][1] &&
            !isKingInCheck(board, true) &&
            !isKingInCheck(makeMove(board, [7, 4], [7, 3]), true) &&
            !isKingInCheck(makeMove(board, [7, 4], [7, 2]), true)
          ) {
            moves.push([7, 2]);
          }
        }
        // Black castling
        if (
          !isWhitePiece &&
          row === 0 &&
          col === 4 &&
          castlingRights.blackKing
        ) {
          // Kingside
          if (
            castlingRights.blackKingside &&
            !board[0][5] &&
            !board[0][6] &&
            !isKingInCheck(board, false) &&
            !isKingInCheck(makeMove(board, [0, 4], [0, 5]), false) &&
            !isKingInCheck(makeMove(board, [0, 4], [0, 6]), false)
          ) {
            moves.push([0, 6]);
          }
          // Queenside
          if (
            castlingRights.blackQueenside &&
            !board[0][3] &&
            !board[0][2] &&
            !board[0][1] &&
            !isKingInCheck(board, false) &&
            !isKingInCheck(makeMove(board, [0, 4], [0, 3]), false) &&
            !isKingInCheck(makeMove(board, [0, 4], [0, 2]), false)
          ) {
            moves.push([0, 2]);
          }
        }
      }
      break;
    }
    default:
      break;
  }
  return moves;
}

// Helper to make a move on a board (returns a new board)
function makeMove(board, from, to) {
  const newBoard = board.map(row => row.slice());
  newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
  newBoard[from[0]][from[1]] = null;
  return newBoard;
}

// Check if the king of the given color is in check
function isKingInCheck(board, white) {
  let kingPos = null;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && ((white && piece === 'K') || (!white && piece === 'k'))) {
        kingPos = [r, c];
        break;
      }
    }
  }
  if (!kingPos) return false;
  // Check all opponent moves
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && ((white && isBlack(piece)) || (!white && isWhite(piece)))) {
        const moves = getLegalMoves(board, r, c, !white, initialCastlingRights(), false);
        if (moves.some(([mr, mc]) => mr === kingPos[0] && mc === kingPos[1])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Generate all legal moves for the current player, filtering out moves that leave king in check
function getAllLegalMoves(board, whiteTurn, castlingRights) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))) {
        const pieceMoves = getLegalMoves(board, r, c, whiteTurn, castlingRights);
        for (let [mr, mc] of pieceMoves) {
          // Simulate move
          const newBoard = makeMove(board, [r, c], [mr, mc]);
          if (!isKingInCheck(newBoard, whiteTurn)) {
            moves.push({ from: [r, c], to: [mr, mc] });
          }
        }
      }
    }
  }
  return moves;
}

function ChessGame() {
  const [board, setBoard] = useState(initialBoard());
  const [selected, setSelected] = useState(null);
  const [whiteTurn, setWhiteTurn] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [status, setStatus] = useState('');
  const [dragged, setDragged] = useState(null);
  const [premove, setPremove] = useState(null);
  const [castlingRights, setCastlingRights] = useState(initialCastlingRights());
  const [history, setHistory] = useState([{ board: initialBoard(), whiteTurn: true, castlingRights: initialCastlingRights() }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const boardRef = useRef();

  // Update board and state when historyIndex changes
  React.useEffect(() => {
    const entry = history[historyIndex];
    setBoard(entry.board.map(row => row.slice()));
    setWhiteTurn(entry.whiteTurn);
    setCastlingRights({ ...entry.castlingRights });
    setSelected(null);
    setPremove(null);
    setStatus('');
  // eslint-disable-next-line
  }, [historyIndex]);

  // Check for checkmate or stalemate
  React.useEffect(() => {
    const legalMoves = getAllLegalMoves(board, whiteTurn, castlingRights);
    if (legalMoves.length === 0) {
      if (isKingInCheck(board, whiteTurn)) {
        setStatus(whiteTurn ? 'Checkmate! Black wins.' : 'Checkmate! White wins.');
      } else {
        setStatus('Stalemate!');
      }
    } else if (isKingInCheck(board, whiteTurn)) {
      setStatus('Check!');
    } else {
      setStatus('');
    }
  }, [board, whiteTurn, castlingRights]);

  // Handle drop logic for drag-and-drop
  function handleDrop(toRow, toCol) {
    if (!dragged) return;
    const [fromRow, fromCol] = dragged;
    const piece = board[fromRow][fromCol];
    if (!piece) return;
    // Only allow legal moves
    const legalMoves = getLegalMoves(board, fromRow, fromCol, whiteTurn, castlingRights)
      .filter(([mr, mc]) => {
        const newBoard = makeMove(board, [fromRow, fromCol], [mr, mc]);
        return !isKingInCheck(newBoard, whiteTurn);
      });
    const isLegal = legalMoves.some(([mr, mc]) => mr === toRow && mc === toCol);
    if (isLegal && ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))) {
      makeAndHandleMove([fromRow, fromCol], [toRow, toCol]);
      setDragged(null);
      setPremove(null);
    } else if (
      piece &&
      ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))
    ) {
      setSelected([toRow, toCol]);
      setDragged(null);
    } else {
      // If not legal, treat as premove
      setPremove({ from: [fromRow, fromCol], to: [toRow, toCol] });
      setDragged(null);
    }
  }

  // Handle mouse/touch drag events
  function handleDragStart(row, col, e) {
    if (status.startsWith('Checkmate') || status === 'Stalemate!') return;
    const piece = board[row][col];
    if (
      piece &&
      ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))
    ) {
      setDragged([row, col]);
      setSelected([row, col]);
      e.dataTransfer?.setData('text/plain', `${row},${col}`);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDropEvent(row, col, e) {
    e.preventDefault();
    handleDrop(row, col);
  }

  // Try to execute premove after turn changes
  React.useEffect(() => {
    if (
      premove &&
      board[premove.from[0]][premove.from[1]] &&
      ((whiteTurn && isWhite(board[premove.from[0]][premove.from[1]])) ||
        (!whiteTurn && isBlack(board[premove.from[0]][premove.from[1]])))
    ) {
      // Only allow legal moves
      const legalMoves = getLegalMoves(
        board,
        premove.from[0],
        premove.from[1],
        whiteTurn,
        castlingRights
      ).filter(([mr, mc]) => {
        const newBoard = makeMove(board, premove.from, [mr, mc]);
        return !isKingInCheck(newBoard, whiteTurn);
      });
      const isLegal = legalMoves.some(
        ([mr, mc]) => mr === premove.to[0] && mc === premove.to[1]
      );
      if (isLegal) {
        makeAndHandleMove(premove.from, premove.to);
        setPremove(null);
      }
    }
    // eslint-disable-next-line
  }, [whiteTurn]);

  function makeAndHandleMove(from, to) {
    const piece = board[from[0]][from[1]];
    let newBoard = makeMove(board, from, to);
    let newCastlingRights = { ...castlingRights };

    // Handle castling move
    if (piece === 'K' && from[0] === 7 && from[1] === 4) {
      // White king moved
      newCastlingRights.whiteKing = false;
      newCastlingRights.whiteKingside = false;
      newCastlingRights.whiteQueenside = false;
      // Kingside
      if (to[0] === 7 && to[1] === 6) {
        // Move rook
        newBoard[7][5] = newBoard[7][7];
        newBoard[7][7] = null;
      }
      // Queenside
      if (to[0] === 7 && to[1] === 2) {
        newBoard[7][3] = newBoard[7][0];
        newBoard[7][0] = null;
      }
    }
    if (piece === 'k' && from[0] === 0 && from[1] === 4) {
      // Black king moved
      newCastlingRights.blackKing = false;
      newCastlingRights.blackKingside = false;
      newCastlingRights.blackQueenside = false;
      // Kingside
      if (to[0] === 0 && to[1] === 6) {
        newBoard[0][5] = newBoard[0][7];
        newBoard[0][7] = null;
      }
      // Queenside
      if (to[0] === 0 && to[1] === 2) {
        newBoard[0][3] = newBoard[0][0];
        newBoard[0][0] = null;
      }
    }
    // If rook moves, update castling rights
    if (piece === 'R' && from[0] === 7 && from[1] === 0) newCastlingRights.whiteQueenside = false;
    if (piece === 'R' && from[0] === 7 && from[1] === 7) newCastlingRights.whiteKingside = false;
    if (piece === 'r' && from[0] === 0 && from[1] === 0) newCastlingRights.blackQueenside = false;
    if (piece === 'r' && from[0] === 0 && from[1] === 7) newCastlingRights.blackKingside = false;
    // If rook is captured, update castling rights
    if (to[0] === 7 && to[1] === 0 && board[7][0] === 'R') newCastlingRights.whiteQueenside = false;
    if (to[0] === 7 && to[1] === 7 && board[7][7] === 'R') newCastlingRights.whiteKingside = false;
    if (to[0] === 0 && to[1] === 0 && board[0][0] === 'r') newCastlingRights.blackQueenside = false;
    if (to[0] === 0 && to[1] === 7 && board[0][7] === 'r') newCastlingRights.blackKingside = false;

    // Save new history (truncate if not at end)
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      board: newBoard.map(row => row.slice()),
      whiteTurn: !whiteTurn,
      castlingRights: { ...newCastlingRights }
    });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setBoard(newBoard);
    setSelected(null);
    setWhiteTurn(w => !w);
    setCastlingRights(newCastlingRights);
  }

  function handleCellClick(row, col) {
    if (status.startsWith('Checkmate') || status === 'Stalemate!') return;
    const piece = board[row][col];
    if (selected) {
      // Only allow legal moves
      const legalMoves = getLegalMoves(board, selected[0], selected[1], whiteTurn, castlingRights)
        .filter(([mr, mc]) => {
          // Simulate move
          const newBoard = makeMove(board, [selected[0], selected[1]], [mr, mc]);
          return !isKingInCheck(newBoard, whiteTurn);
        });
      const isLegal = legalMoves.some(([mr, mc]) => mr === row && mc === col);
      if (isLegal) {
        makeAndHandleMove([selected[0], selected[1]], [row, col]);
      } else if (
        piece &&
        ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))
      ) {
        setSelected([row, col]);
      } else {
        setSelected(null);
      }
    } else {
      if (
        piece &&
        ((whiteTurn && isWhite(piece)) || (!whiteTurn && isBlack(piece)))
      ) {
        setSelected([row, col]);
      }
    }
  }

  // Flip board rows and columns if flipped
  const displayBoard = flipped
    ? board.slice().reverse().map(row => row.slice().reverse())
    : board;

  // Notation arrays
  const files = flipped
    ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']
    : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = flipped
    ? [1, 2, 3, 4, 5, 6, 7, 8]
    : [8, 7, 6, 5, 4, 3, 2, 1];

  return (
    <div>
      <h2>Chess Game</h2>
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setHistoryIndex(i => Math.max(0, i - 1))}
          disabled={historyIndex === 0}
          style={{ marginRight: 8 }}
        >
          ⬅ Back
        </button>
        <button
          onClick={() => setHistoryIndex(i => Math.min(history.length - 1, i + 1))}
          disabled={historyIndex === history.length - 1}
          style={{ marginRight: 16 }}
        >
          Forward ➡
        </button>
        <button onClick={() => setFlipped(f => !f)} style={{ marginRight: '1rem' }}>
          Flip Board
        </button>
        <button onClick={() => {
          setBoard(initialBoard());
          setWhiteTurn(true);
          setSelected(null);
          setStatus('');
          setPremove(null);
          setCastlingRights(initialCastlingRights());
          setHistory([{ board: initialBoard(), whiteTurn: true, castlingRights: initialCastlingRights() }]);
          setHistoryIndex(0);
        }}>
          Reset Game
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Ranks (left side) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginRight: 8, // More space for clarity
          height: 512
        }}>
          {ranks.map((rank, i) => (
            <div
              key={rank}
              style={{
                height: 64,
                lineHeight: '64px',
                textAlign: 'right',
                fontWeight: 'bold',
                color: '#222', // Darker for better contrast
                fontSize: 22,  // Larger font
                background: '#f8f8f8', // Light background for visibility
                borderRadius: 6,
                marginBottom: i !== ranks.length - 1 ? 0 : 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 8
              }}
            >
              {rank}
            </div>
          ))}
        </div>
        {/* Board and files (bottom) */}
        <div>
          <div
            ref={boardRef}
            style={{
              display: 'grid',
              gridTemplateRows: 'repeat(8, 64px)',
              gridTemplateColumns: 'repeat(8, 64px)',
              border: '2px solid #333',
              width: '512px',
              background: '#333'
            }}
          >
            {displayBoard.map((rowArr, rowIdx) =>
              rowArr.map((cell, colIdx) => {
                const realRow = flipped ? 7 - rowIdx : rowIdx;
                const realCol = flipped ? 7 - colIdx : colIdx;
                const isSelected = selected && selected[0] === realRow && selected[1] === realCol;
                const isWhiteSquare = (realRow + realCol) % 2 === 1;
                const isWhitePiece = cell && cell === cell.toUpperCase();
                let highlight = false;
                if (selected && board[selected[0]][selected[1]]) {
                  const legalMoves = getLegalMoves(board, selected[0], selected[1], whiteTurn, castlingRights)
                    .filter(([mr, mc]) => {
                      const newBoard = makeMove(board, [selected[0], selected[1]], [mr, mc]);
                      return !isKingInCheck(newBoard, whiteTurn);
                    });
                  highlight = legalMoves.some(([mr, mc]) => mr === realRow && mc === realCol);
                }
                // Highlight premove destination
                const isPremoveDest =
                  premove &&
                  premove.to[0] === realRow &&
                  premove.to[1] === realCol;
                return (
                  <div
                    key={rowIdx + '-' + colIdx}
                    onClick={() => handleCellClick(realRow, realCol)}
                    draggable={
                      cell &&
                      ((whiteTurn && isWhitePiece) || (!whiteTurn && !isWhitePiece))
                    }
                    onDragStart={e => handleDragStart(realRow, realCol, e)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDropEvent(realRow, realCol, e)}
                    style={{
                      width: 64,
                      height: 64,
                      background: isPremoveDest
                        ? '#00bfff'
                        : isSelected
                        ? '#ff0'
                        : highlight
                        ? '#90ee90'
                        : isWhiteSquare
                        ? '#fff'
                        : '#228B22',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 44,
                      fontWeight: 'bold',
                      cursor:
                        status.startsWith('Checkmate') || status === 'Stalemate!'
                          ? 'not-allowed'
                          : cell
                          ? 'grab'
                          : 'pointer',
                      border: '1px solid #444',
                      color: cell
                        ? isWhitePiece
                          ? '#fff'
                          : '#111'
                        : undefined,
                      textShadow:
                        cell && isWhitePiece
                          ? '0 0 2px #000, 0 0 4px #000'
                          : undefined,
                      userSelect: 'none',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}
                  >
                    {cell ? pieceUnicode[cell] : ''}
                  </div>
                );
              })
            )}
          </div>
          {/* Files (bottom) */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: 512,
            marginTop: 2,
            background: '#f8f8f8', // Light background for visibility
            borderRadius: 6
          }}>
            {files.map(file => (
              <div
                key={file}
                style={{
                  width: 64,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#222', // Darker for better contrast
                  fontSize: 22,  // Larger font
                  height: 28,
                  lineHeight: '28px'
                }}
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p style={{ marginTop: '1rem' }}>
        Turn:{' '}
        {status.startsWith('Checkmate') || status === 'Stalemate!'
          ? ''
          : whiteTurn
          ? 'White'
          : 'Black'}
      </p>
      {status && (
        <p
          style={{
            fontWeight: 'bold',
            color: status.includes('Checkmate')
              ? 'red'
              : status === 'Check!'
              ? 'orange'
              : 'black'
          }}
        >
          {status}
        </p>
      )}
      {premove && (
        <p style={{ color: '#00bfff', fontWeight: 'bold' }}>
          Premove set: {String.fromCharCode(97 + premove.from[1])}
          {8 - premove.from[0]} → {String.fromCharCode(97 + premove.to[1])}
          {8 - premove.to[0]}
        </p>
      )}
    </div>
  );
}

export default ChessGame;