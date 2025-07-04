import React from 'react';
import Sidebar from './Sidebar';

const HomePage: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ padding: 20, flexGrow: 1 }}>
        <h1>Добро пожаловать!</h1>
        <p>Текст приветствия будет здесь.</p>
      </main>
    </div>
  );
};

export default HomePage;