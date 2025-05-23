import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';

export default function Layout() {
  return (
    <div className="app">
      <Header />    
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}