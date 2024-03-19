import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [data,setData] = useState(null)
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      return alert('Please select an image file');
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:3001/upload', formData);
      setData(response.data)
      console.log(response.data); // You can access the returned data here
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Image Upload</h2>
      <form onSubmit={handleFormSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      {
        data &&
        <>
          <span>Image</span>
          <img src={data.url}/>
          <hr/>
          <span>Image thumbnail</span>
          <img src={data.thumbnail_url}/>
          <hr/>
          <span>Image preview</span>
          <img src={data.preview_url}/>
          <hr/>
        </>
      }
    </div>
  );
}

export default App
