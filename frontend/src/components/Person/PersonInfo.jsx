import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './PersonInfo.css';
import { InputImg } from '../UI/Inputs/InputImg';

export default function PersonInfo({person, personInfoVisible, personInfoError, updatePersonInPeople}) {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const [savedPersonData, setSavedPersonData] = useState(person);
    const [currentPersonData, setCurrentPersonData] = useState(person);
    const [currentMode, setCurrentMode] = useState(person.id === "0" ? "edit" : "view");
    const navigate = useNavigate();

    useEffect(() => {
        console.log(personInfoVisible);
        console.log(personInfoError);
        console.log(currentPersonData);
    }, []);

    // Закрытие окна
    const handleClosePersonInfo = () => {
        navigate('/people_list');
    };

    // Закрытие по клику вне окна
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClosePersonInfo();
        }
    };

    // Изменение режима
    const changeMode = () => {
        if (currentMode === "edit") {
            handleSaveClick();
        }
        setCurrentMode(currentMode === "view" ? "edit" : "view");
    };

    // Функция для поиска различий между объектами
    const findDifferences = (old_obj, new_obj) => {
        const differences = {};
        Object.keys(old_obj).forEach((key) => {
        if (old_obj[key] !== new_obj[key]) {
            differences[key] = new_obj[key];
        }
        });
        return differences;
    };

    // Сохранение изменений
    const handleSaveClick = async () => {
        console.log("currentPersonData =", currentPersonData);
        const data = new FormData();
        data.append("api_key", person.api_key);
        const inputImg = document.getElementById("avatar");
        if (inputImg.files[0]) {
            data.append('avatar', inputImg.files[0]);
        }

        if (person.id === "0") {
            Object.entries(currentPersonData).forEach(([key, value]) => {
                if (key === "id" || key === "avatar" || key === "api_key") return;
                data.append(key, JSON.stringify(value));
            });
            const obj_form = Object.fromEntries(data);
            console.log("FormData =", obj_form);

            try {
                const response = await fetch(`${API_URL}/person`, {
                    method: 'POST',
                    body: data,
                });           
                if (response.ok) {
                    console.log("Новый person успешно добавлен");
                    const person_id = (await response.json()).id;
                    navigate(`/people_list/${person_id}`);
                } else {
                    throw new Error('Ошибка при добавлении нового person');
                }
            } catch (error) {
                console.error('Error:', error);
            }

        } else {
            Object.entries(findDifferences(savedPersonData.info, currentPersonData.info)).forEach(([key, value]) => {
                data.append(key, value);
            });
            const obj_form = Object.fromEntries(data);
            console.log("FormData =", obj_form);

            if (Object.keys(obj_form).length === 0) return;

            try {
                const response = await fetch(`${API_URL}/person/${person.id}`, {
                    method: 'PUT',
                    body: data,
                });            
                if (response.ok) {
                    setSavedPersonData(currentPersonData);
                    updatePersonInPeople(person.id);
                } else {
                    throw new Error('Ошибка обновления');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const getCharacteristicConfig = (characteristicName) => {
        const configMap = {
            nickname: {
                is_display: true,
                rus_name: "псевдоним",
                input_type: "text"
            },
            first_name: {
                is_display: true,
                rus_name: "имя",
                input_type: "text"
            },
            last_name: {
                is_display: true,
                rus_name: "фамилия",
                input_type: "text"
            },
            patronymic: {
                is_display: true,
                rus_name: "отчество",
                input_type: "text"
            },
            birthdate: {
                is_display: true,
                rus_name: "дата рождения",
                input_type: "date"
            },
            gender: {
                is_display: true,
                rus_name: "пол",
                input_type: "select"
            }
        };
    
        return configMap[characteristicName] || null;
    };
    
    const renderCharacteristic = (characteristic) => {
        const config = getCharacteristicConfig(characteristic);
        if (!config || !config.is_display) return null;
    
        return (
            <div className='characteristic' key={characteristic}>
                <div className='characteristic_name_and_delete'>
                    <p>{config.rus_name}</p>
                    {currentMode === "edit" && (
                        <img src='/assets/images/trash.svg' alt='delete_btn' className='delete_btn' />
                    )}
                </div>
                <div className={'characteristic_value ' + currentMode}>
                    {config.input_type === "select" ? (
                        <select
                            name={characteristic}
                            value={currentPersonData.info[characteristic]}
                            onChange={(e) => setCurrentPersonData(prev => ({
                                ...prev,
                                info: {
                                    ...prev.info,
                                    [e.target.name]: e.target.value
                                }
                            }))}
                        >
                            <option value={""}>-</option>
                            <option value={"мужской"}>мужской</option>
                            <option value={"женский"}>женский</option>
                        </select>
                    ) : (
                        <input
                            type={config.input_type}
                            name={characteristic}
                            value={currentPersonData.info[characteristic]}
                            onChange={(e) => setCurrentPersonData(prev => ({
                                ...prev,
                                info: {
                                    ...prev.info,
                                    [e.target.name]: e.target.value
                                }
                            }))}
                            readOnly={currentMode === "view"}
                        >
                        </input>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={personInfoVisible ? 'person_info visible' : 'person_info'} onClick={handleOverlayClick}>
            {currentPersonData ? (
                <div className='content'>
                    {currentMode === "edit" && (
                        <div className='save_edit_btn' onClick={changeMode}>
                            <img src='/assets/images/save.svg' alt="save_btn" onClick={handleClosePersonInfo} />
                            <p>Сохранить</p>
                        </div>
                    )}
                    {currentMode === "view" && (
                        <div className='save_edit_btn' onClick={changeMode}>
                            <img src='/assets/images/edit.svg' alt="edit_btn" onClick={handleClosePersonInfo} />
                            <p>Редактировать</p>
                        </div>
                    )}
                    <img src='/assets/images/close_btn.svg' alt="close_btn" className="close_btn" onClick={handleClosePersonInfo} />
                    <div className='blocks'>
                        <div className='left_block'>
                            <div className='avatar_and_social'>
                                <InputImg id="avatar" name="avatar" mode={currentMode} src={currentPersonData.avatar === "" && currentMode === "view" ? '/assets/images/user.svg' : currentPersonData.avatar} />
                                <div className='add_social_btn'>
                                    <img src='/assets/images/plus_light.svg' alt="plus" />
                                    <p>телефон, почта, аккаунт...</p>
                                </div>
                                <div className='social_items'>

                                </div>
                                <img src='/assets/images/invisible.svg' alt="visible_btn" className='visible_btn' />
                            </div>
                            <div className='btns'>
                                <div className='tabs_btns'>
                                    <img src='/assets/images/info_active.svg' alt='info_btn' className='info_btn' />
                                    <img src='/assets/images/media_inactive.svg' alt='media_btn' className='media_btn' />
                                    <img src='/assets/images/settings_inactive.svg' alt='settings_btn' className='settings_btn' />
                                </div>
                                <img src='/assets/images/triangle.svg' alt='full_social_btn' className='full_social_btn' />
                            </div>
                        </div>
                        <div className='right_block'>
                            <form className='characteristics'>
                                {Object.keys(currentPersonData.info).map(renderCharacteristic)}
                                <div className='add_characteristic'>
                                    <img src='/assets/images/plus_light.svg' alt="plus" />
                                    <p>Добавить новую характеристику</p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="error_message">
                    ⚠️ {personInfoError}
                    <button onClick={handleClosePersonInfo}>Close</button>
                </div>
            )}
        </div>
    );
}