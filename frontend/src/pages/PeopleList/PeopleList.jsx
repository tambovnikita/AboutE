import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import './PeopleList.css';
import InputSimple from '../../components/UI/Inputs/InputSimple';
import PersonCard from '../../components/Person/PersonCard';
import PersonInfo from '../../components/Person/PersonInfo';


export default function PeopleList() {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const { user } = useAuth();
    const { personId } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [personInfoVisible, setPersonInfoVisible] = useState(false);
    const [personInfoError, setPersonInfoError] = useState(null);
    const [refreshCardKey, setRefreshCardKey] = useState(0);

    // Эффект для получения people из БД
    useEffect(() => {
        const fetchPeople = async () => {
            try {
                const response = await fetch(`${API_URL}/people/${user.api_key}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setPeople(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchPeople();
        } else {
            navigate("/login");
        }
    }, []);

    // Фильтрация по параметрам person
    const filteredPeople = people.filter(person =>
        person.info.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.info.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.info.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        person.info.patronymic.toLowerCase().includes(searchQuery.toLowerCase())
    );

    var selectedPerson = people.find(p => p.id === personId);
    if (personId === "0") {
        selectedPerson = {
            id: "0",
            api_key: user.api_key,
            avatar: "",
            info: {
                nickname: "",
                first_name: "",
                last_name: "",
                patronymic: "",
                birthdate: "",
                gender: "",
            },
            tags: [],
            characteristics: ["nickname", "last_name", "first_name", "patronymic", "birthdate", "gender"],
            settings: {
                enableBirthdayReminder: true
            }
        }
    }

    // Эффект для добавления person из БД, если его нет в people
    useEffect(() => {
        const fetchPerson = async () => {
            if (personId) {
                try {
                    const response = await fetch(`${API_URL}/person/${personId}`);
                    if (!response.ok) {
                        if (response.status === 404) {
                            setPersonInfoError('Person not found');
                        } else {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                    }
                    const data = await response.json();
                    setPeople(prev => {
                        const exists = prev.some(p => p.id === data.id);
                        return exists ? prev : [...prev, data];
                    });
                    setPersonInfoVisible(true);
                } catch (err) {
                    setPersonInfoError(err.message);
                    setPersonInfoVisible(false);
                }
            }
        };
    
        // Проверяем сначала в локальных данных
        const localPerson = people.find(p => p.id === personId);
        if (!localPerson && personId !== "0") {
            fetchPerson();
        }
    }, [personId]);

    // Эффект для обработки открытия/закрытия PersonInfo
    useEffect(() => {
        if (personId) {
            const person = people.find(p => p.id === personId);
            if (person || personId === "0") {
                setPersonInfoVisible(true);
                setPersonInfoError(null);
            } else {
                setPersonInfoError('Person not found');
                setPersonInfoVisible(false);
            }
        } else {
            setPersonInfoVisible(false);
            setPersonInfoError(null);
        }
    }, [personId]);

    // Обновление person в people
    const updatePersonInPeople = async (person_id) => {
        try {
            const response = await fetch(`${API_URL}/person/${person_id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setPersonInfoError('Person not found');
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }
            const data = await response.json();
            setPeople(prev => {
                const index = prev.findIndex(p => p.id === data.id);
                const updated = [...prev];
                updated[index] = data;
                return updated;
            });
            setRefreshCardKey(prev => prev + 1);
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading people...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p>⚠️ Error loading data: {error}</p>
                <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
        );
    }

    return (
        <section className="people_list">
            <div className='search_block'>
                <p>Фильтрация по</p>
                <InputSimple 
                    id="search_query" 
                    name="search_query" 
                    value={searchQuery} 
                    placeholder="введите псевдоним, имя, фамилию..." 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                <button type="button" onClick={() => setSearchQuery('')}>Очистить</button>
            </div>
            
            <div className='cards'>
                <div className='add_person_btn' onClick={() => navigate(`/people_list/0`)}>
                    <div className='add_person_title'>
                        <img src='/assets/images/plus_dark.svg' alt="plus" />
                        <p>Добавить</p>
                    </div>
                    <p className='add_person_subtitle'>нажмите, чтобы добавить информацию о новом человеке</p>
                </div>
                {filteredPeople.map(person => (
                    <PersonCard person={person} onClick={() => navigate(`/people_list/${person.id}`)} refreshCardKey={refreshCardKey} />
                ))}
            </div>
            
            {(personId && !selectedPerson) && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading person details...</p>
                </div>
            )}
            {selectedPerson && (
                <PersonInfo person={selectedPerson} personInfoVisible={personInfoVisible} personInfoError={personInfoError} updatePersonInPeople={updatePersonInPeople} />
            )}
        </section>
    );
}