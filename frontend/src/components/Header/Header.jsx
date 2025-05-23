import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export const Header = () => {
  const { user, logout } = useAuth();
  const [isShowHeaderMenu, setIsShowHeaderMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header>
      <img
        className="logo"
        src="/assets/images/logo.svg"
        alt="logo"
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      />
      {user && (
        <div className='nav_btns'>
          <Link to="/people_list" className={`people_list_btn ${location.pathname === '/people_list' ? 'current_btn' : ''}`}>Список</Link>
          <Link to="/people_map" className={`people_map_btn ${location.pathname === '/people_map' ? 'current_btn' : ''}`}>Карта</Link>
        </div>
      )}
      <div class="right_block">
        {!user && <Link to="/login" className="login_btn">Войти</Link>}
        {user && (
          <div style={{display: 'flex', flexDirection: 'column', gridGap: '15px'}}>
            <div className="user_and_arrow" onClick={() => setIsShowHeaderMenu(!isShowHeaderMenu)}>
                <p class="user_name">{ user.first_name } { user.last_name } (@{ user.username })</p>
                <img
                  className={`arrow_down ${isShowHeaderMenu ? 'rotated' : ''}`}
                  src="/assets/images/arrow_down.svg"
                  alt="arrow_down"
                />
            </div>
            {isShowHeaderMenu && (
              <div className="header_menu">
                <a className="profile_btn" onClick={() => user && navigate('/profile')}>Профиль</a>
                <a className="support_btn" onClick={() => navigate('/support')}>Служба поддержки</a>
                <a className="github_btn" href='https://github.com/' target='_blank'>GitHub</a>
                <a className="exit_btn" onClick={() => {logout(); navigate('/login')}}>Выход</a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}