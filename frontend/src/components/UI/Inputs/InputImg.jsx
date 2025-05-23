import { useState, useEffect, useRef } from 'react';

export const InputImg = ({id, name, mode, src = '', form_id = ''}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hasImage, setHasImage] = useState(src !== '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setHasImage(src !== '');
  }, [src]);

  const imgAndLabelStyles = {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "min-content",
    alignItems: "center",
    cursor: "pointer",
  };

  const clickOnImg = () => {
    if (mode === "edit") {
        fileInputRef.current.click();
    }
  };

  const inputChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Допустимые форматы: JPG, PNG\nМаксимальный размер: 10 Мб');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setHasImage(true);

        if (form_id) {
          const form = document.getElementById(form_id);
          if (form) {
            form.submit();
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="input_img" style={{ display: 'flex', height: 'min-content', marginBottom: hasImage && mode === "edit" ? '20px' : '0', borderRadius: '10px', marginTop: '-50px', border: '8px solid rgb(233, 233, 233)', backgroundColor: 'rgb(233, 233, 233)' }}>
      <div className="img_and_label" onClick={clickOnImg} style={imgAndLabelStyles}>
        <input
          id={id}
          name={name}
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept="image/png, image/jpeg"
          onChange={inputChange}
        />
        <div className="img_container" style={{ width: '170px' }}>
          {!hasImage ? (
            <svg style={{ width: '170px', height: '170px', borderRadius: '8px' }} viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
              <rect width="96" height="96" fill="rgb(243, 244, 246)" />
              <rect x="12" y="12" width="72" height="72" rx="36" fill="rgb(209, 213, 219)" />
            </svg>
          ) : (
            <img src={selectedImage || src} style={{ width: '170px', height: '170px', borderRadius: '8px' }} alt="img" />
          )}
        </div>
        {mode === "edit" && (
            <p className="input_img_label" style={{
                top: hasImage ? '100%' : '38%',
                font: '14px Inter',
                color: 'rgb(54, 58, 66)',
                marginTop: '10px',
                position: 'absolute',
                userSelect: 'none'
            }}>
                {hasImage ? 'ЗАМЕНИТЬ' : 'ЗАГРУЗИТЬ'}
            </p>
        )}
      </div>
    </div>
  );
}