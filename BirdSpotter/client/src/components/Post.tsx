import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';


interface FormData {
  title: string;
  desc: string;
  image: File | null;
  coordinates: [number, number] | null;
}

const LeafletMap: React.FC<{ onCoordinatesChange: (coordinates: [number, number]) => void }> = ({
  onCoordinatesChange,
}) => {
  const [position, setPosition] = useState<[number, number]>([0, 0]);

  const handleMarkerDragEnd = (event: L.LeafletEvent) => {
    const marker = event.target.getLatLng();
    setPosition([marker.lat, marker.lng]);
    onCoordinatesChange([marker.lat, marker.lng]);
  };

  return (
    <>
      <Marker position={position} draggable={true} eventHandlers={{ dragend: handleMarkerDragEnd }}>
        <Popup>Drag me to select location</Popup>
      </Marker>
    </>
  );
};

const MyForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    desc: '',
    image: null,
    coordinates: null,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleCoordinatesChange = (coordinates: [number, number]) => {
    setFormData({ ...formData, coordinates });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('desc', formData.desc);
      if (formData.image) {
        form.append('image', formData.image);
      }

      if (formData.coordinates) {
        form.append('latitude', formData.coordinates[0].toString());
        form.append('longitude', formData.coordinates[1].toString());
      }

      const response = await axios.post<{ data: any }>('http://localhost:3000/posts/newpost', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Backend response:', response.data);
    } catch (error) {
      console.error('Error sending data to backend:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Title:
        <input type="text" name="title" value={formData.title} onChange={handleInputChange} />
      </label>
      <br />
      <br />
      <label>
        Description:
        <input type="text" name="desc" value={formData.desc} onChange={handleInputChange} />
      </label>
      <br />
      <br />
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '300px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LeafletMap onCoordinatesChange={handleCoordinatesChange} />
      </MapContainer>
      {formData.coordinates && (
        <p>
          Selected Coordinates: {formData.coordinates[0]}, {formData.coordinates[1]}
        </p>
      )}

      <br />
      <br />
      <label>
        Image:
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
      </label>
      <br />
      <br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
