import './PersonCard.css';

export default function PersonCard({person, onClick, refreshCardKey}) {

    return (
        <div className='person_card' key={person.id} onClick={onClick}>
            <img
                src={person.avatar === "" ? '/assets/images/user.svg' : `${person.avatar}?v=${refreshCardKey}`}
                alt="avatar"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/images/user.svg';
                }}
            />
            <div className='card_info'>
                <p className='card_title'>{person.info.nickname}</p>
                <p className='card_subtitle'>{person.info.last_name} {person.info.first_name} {person.info.patronymic}</p>
                <div className='tags'>
                    {person.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="tag"
                            style={{ backgroundColor: tag.color }}
                        >
                            {tag.text}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}