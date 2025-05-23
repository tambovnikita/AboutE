import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import './PeopleMap.css';


// Создаём кастомную иконку
const blackIcon = new L.DivIcon({
  className: 'custom-icon',
  html: '<img src="/assets/images/user.svg" style="background-color: white; width: 40px; height: 40px; border-radius: 50%; padding: 5px; border: 3px solid black;"></div>',
  iconSize: [40, 40],
});

export default function PeopleMap() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const position1 = [55.794269, 37.800344];
  const position2 = [55.957958, 38.047587];
  const position3 = [53.196892, 45.024317];
  const position4 = [52.724710, 41.438637];
  const position5 = [55.701861, 37.580688];
  const position6 = [55.807357, 37.499979];
  const position7 = [55.105357, 36.598245];
  const position8 = [54.736816, 37.266996];
  const position9 = [59.949907, 30.242287];
  const position10 = [55.717903, 37.807782];

  useEffect(() => {
      if (!user) {
          navigate("/login");
      }
  }, []);

  return (
    <section className="people_map">
        <p className='info'>Данный раздел имеет незаконченный статус</p>
        <div style={{ height: '100vh', width: '100%', zIndex: 0 }}>
          <MapContainer center={position1} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position1} icon={blackIcon}><Popup>Person 1</Popup></Marker>
            <Marker position={position2} icon={blackIcon}><Popup>Person 2</Popup></Marker>
            <Marker position={position3} icon={blackIcon}><Popup>Person 3</Popup></Marker>
            <Marker position={position4} icon={blackIcon}><Popup>Person 4</Popup></Marker>
            <Marker position={position5} icon={blackIcon}><Popup>Person 5</Popup></Marker>
            <Marker position={position6} icon={blackIcon}><Popup>Person 6</Popup></Marker>
            <Marker position={position7} icon={blackIcon}><Popup>Person 7</Popup></Marker>
            <Marker position={position8} icon={blackIcon}><Popup>Person 8</Popup></Marker>
            <Marker position={position9} icon={blackIcon}><Popup>Person 9</Popup></Marker>
            <Marker position={position10} icon={blackIcon}><Popup>Person 10</Popup></Marker>
          </MapContainer>
        </div>
    </section>
  );
}