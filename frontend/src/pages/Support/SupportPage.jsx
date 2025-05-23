import './SupportPage.css';

export default function SupportPage() {
    return (
      <article className="support_page">
        <p className="title">Служба поддержки</p>
        <div className="info">
          <p>По всем вопросам пишите:</p>
          <div className="contacts">
            <p>Telegram - <a href='https://t.me/tambov_nikita' target="_blank"><b>https://t.me/tambov_nikita</b></a></p>
            <p>Email - <b>tambovnikita@yandex.ru</b></p>
          </div>
        </div>
      </article>
    );
  }