import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import './LoginPage.css';
import InputSimple from '../../components/UI/Inputs/InputSimple';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password });
      if (result.success) {
        navigate('/');
      } else {
        console.error(result.errors);
        setError(result.errors);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form className="form_login" onSubmit={handleSubmit}>
      <div className="inputs">
        <div className="input_block">
            <p>Email</p>
            <InputSimple id="email" name="email" value={email} type="email" placeholder="Введите email" onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div class="input_block">
            <p>Пароль</p>
            <InputSimple id="password" name="password" value={password} type="password" placeholder="Введите пароль" onChange={(e) => setPassword(e.target.value)} required />
        </div>
      </div>
      {error && <div className="error_message">{error}</div>}
      <div className="btns">
        <button className="login_btn" type="submit">ВОЙТИ</button>
        <button className="registration_btn" onClick={() => navigate('/registration')}>ЗАРЕГИСТРИРОВАТЬСЯ</button>
      </div>
    </form>
  );
}