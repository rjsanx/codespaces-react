import './App.css';
import { useState } from 'react';
import ChessGame from './ChessGame';
function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <img src="Octocat.png" className="App-logo" alt="logo" />
        <p>
          GitHub Codespaces <span className="heart">♥️</span> React
        </p>
        <p className="small">
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </p>
        {/* Counter UI */}
        <div style={{ marginTop: '2rem' }}>
          <h2>Counter: {count}</h2>
          <button onClick={() => setCount(count - 1)}>-</button>
          <button onClick={() => setCount(count + 1)} style={{ marginLeft: '1rem' }}>+</button>
        </div>
            <ChessGame />
      </header>
    </div>
  );
}

export default App;