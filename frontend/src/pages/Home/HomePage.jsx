import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <section className="home">
      <div className="blocks">
        <div className="left_block">
          <img
            className="logo"
            src="/assets/images/logo.svg"
            alt="logo"
          />
          <p>AboutE</p>
        </div>
        <div className="right_block">
          <div>
            <p className='eng'>A multifunctional service focused on working with information <b>about everyone</b></p>
            <p className='rus'>Многофункциональный сервис, ориентированный на работу с информацией обо всех</p>
          </div>
          {!user && <Link to="/login">Войти</Link>}
          {user && <Link to="/people_list">Открыть список</Link>}
        </div>
      </div>
    </section>
  );
}