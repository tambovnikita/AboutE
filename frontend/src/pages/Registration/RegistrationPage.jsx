import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import InputSimple from '../../components/UI/Inputs/InputSimple';
import './RegistrationPage.css';

export default function RegistrationPage() {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');
    const [isVisibleTelegramConnect, setIsVisibleTelegramConnect] = useState(false);
    const [isVisibleDoneBtn, setIsVisibleDoneBtn] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const result = await register({ username, email, first_name, last_name, password });
            if (result.success) {
                setApiKey(result.data.api_key);
                setIsVisibleTelegramConnect(true);
            } else {
                console.error(result.errors);
            }
        } catch (err) {
            setError(err.message || 'Ошибка регистрации');
        }
    };

    return (
        <section className='registration_page'>
            <form className="form_registration" onSubmit={handleSubmit}>
                <div class="rows">
                    <div className="inputs">
                        <div className="input_block">
                            <p>Имя</p>
                            <InputSimple
                                id="first_name"
                                name="first_name"
                                value={first_name}
                                placeholder="Введите имя"
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input_block">
                            <p>Фамилия</p>
                            <InputSimple
                                id="last_name"
                                name="last_name"
                                value={last_name}
                                placeholder="Введите фамилию"
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="inputs">
                        <div className="input_block">
                            <p>Username</p>
                            <InputSimple
                                id="username"
                                name="username"
                                value={username}
                                placeholder="Введите username"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input_block">
                            <p>Email</p>
                            <InputSimple
                                id="email"
                                name="email"
                                value={email}
                                type="email"
                                placeholder="Введите email"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="inputs">
                        <div className="input_block">
                            <p>Пароль</p>
                            <InputSimple
                                id="password"
                                name="password"
                                value={password}
                                type="password"
                                placeholder="Введите пароль"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input_block">
                            <p>Подтвердите пароль</p>
                            <InputSimple
                                id="confirm_password"
                                name="confirm_password"
                                value={confirmPassword}
                                type="password"
                                placeholder="Повторите пароль"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    {error && <div className="error_message">{error}</div>}
                </div>
                <div className="btns">
                    <button className="registration_btn" type="submit">ЗАРЕГИСТРИРОВАТЬСЯ</button>
                    <button className="login_btn" onClick={() => navigate('/login')}>ВОЙТИ</button>
                </div>
            </form>
            { isVisibleTelegramConnect && (
                <div className='telegram_modal'>
                    <div className='content'>
                        <div className='modal_title'>
                            <p>Активация Telegram-помощника</p>
                        </div>
                        <div className='info'>
                            <div className='description'>
                                <p className='main'>Одной из ключевых особенностью <b>AboutE</b> является наличие бесплатного <b>Telegram-помощника</b>.</p>
                                <p>Рекомендуем заранее выбрать в Telegram тот аккаунт, который будет привязан к AboutE.</p>
                                <p className='main'>Чтобы активировать бота необходимо <b>нажать на кнопку "Активировать"</b>. Сразу после нажатия откроется Telegram-бот и отправит сообщение "/start". Если всё сделано правильно, то бот об этом сообщит.</p>
                            </div>
                            <div className='btns'>
                                <button onClick={() => {window.open(`https://t.me/aboute_help_bot?start=${apiKey}`, "_blank"); setIsVisibleDoneBtn(true);}}>Активировать</button>
                                {isVisibleDoneBtn && (
                                    <button onClick={() => navigate("/")}>Готово</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}