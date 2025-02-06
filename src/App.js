import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'react-bootstrap';
import Dashboard from './Dashboard';
import RecentLinks from './RecentLinks';

const App = () => {
  const [url, setUrl] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [shortUrlInput, setShortUrlInput] = useState(''); // State mới để lưu URL ngắn tùy chỉnh
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) {
      setError('URL is required!');
      return;
    }

    try {
      const response = await fetch('https://flask-backend-fkcj.onrender.com/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.short_url) {
        setShortenedUrl(data.short_url);
        setShowModal(true);
        setShortUrlInput(data.short_url.split('/')[1]);  // Lấy phần cuối của URL làm short URL mặc định
        setError('');
      }
    } catch (error) {
      setError('Error occurred while shortening the URL');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
  
    if (!shortUrlInput || !url) {
      setError('Short URL and new URL are required!');
      return;
    }
  
    try {
      const response = await fetch(`https://flask-backend-fkcj.onrender.com/update/${shortenedUrl.split('/')[1]}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,  // Gửi URL gốc mới
          new_short_url: shortUrlInput, // Gửi short URL mới
        }),
      });
  
      const data = await response.json();
  
      if (data.message) {
        setShortenedUrl(`/${shortUrlInput}`);
        setError('');
      } else {
        setError('Error occurred while updating the Short URL');
      }
    } catch (error) {
      setError('Error occurred while updating the Short URL');
    }
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://flask-backend-fkcj.onrender.com${shortenedUrl}`);
   
  };

  return (
    <div className="container mt-5">
      <Dashboard/>
      <div className="row justify-content-start">
        <div className="col-md-6">
          <div className="card shadow-lg p-4 rounded">
            <h2 className="text-center mb-4 text-primary"></h2>

            {/* Form Input URL */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="url" className="form-label">Enter URL</label>
                <input
                  type="text"
                  id="url"
                  className="form-control"
                  placeholder="Enter your URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                {error && <div className="text-danger mt-2">{error}</div>}
              </div>

              <button type="submit" className="btn btn-primary w-100">Rút gọn link</button>
            </form>

            {/* Modal for Showing and Editing Shortened URL */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Shortened URL</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Link rút ngọn :</p>
                <div className="d-flex align-items-center">
                  <a 
                    href={`${shortenedUrl}`} 
                    className="text-decoration-none text-primary" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{flex: 1}}
                  >
                    {`${shortenedUrl}`}
                  </a>
                  <button 
                    className="btn btn-outline-secondary ml-2" 
                    onClick={copyToClipboard}
                  >
                    Copy
                  </button>
                </div>
                <hr />
                <h5>Chỉnh sửa tên link rút ngọn:</h5>
                <input
                  type="text"
                  className="form-control"
                  value={shortUrlInput}
                  onChange={(e) => setShortUrlInput(e.target.value)} // Cập nhật khi người dùng chỉnh sửa
                />
              </Modal.Body>
              <Modal.Footer>
              <button 
  type="button" 
  className="btn btn-secondary" 
  onClick={() => {
    setShowModal(false);  // Close the modal
    window.location.reload();  // Reload the page
  }}
>
  Đóng
</button>

                <button type="button" className="btn btn-warning" onClick={handleUpdateSubmit}>Cập nhập</button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
      <RecentLinks/>
    </div>
  );
};

export default App;
