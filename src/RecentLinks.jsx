import React, { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Modal, Button, InputGroup, FormControl } from 'react-bootstrap';

const RecentLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLink, setEditLink] = useState('');
  const [newOriginalUrl, setNewOriginalUrl] = useState(''); // Used for the new original URL
  const [selectedLinkIndex, setSelectedLinkIndex] = useState(null);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch('https://flask-backend-5-28db.onrender.com/all');
        const data = await response.json();
        setLinks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching links:', error);
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleEditClick = (link, index) => {
    setEditLink(link.short_url);  // Store the current short URL for editing
    setNewOriginalUrl(link.original_url); // Set the initial original URL to the editable field
    setSelectedLinkIndex(index);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const updatedLink = {
      new_original_url: newOriginalUrl, // Send the new original URL only
    };
  
    try {
      // Extract the short URL from the editLink
      const parts = editLink.split('/');
      const shortUrl = editLink; // Ensure this is the correct part of the URL
      
      // Check if shortUrl is valid before proceeding
      if (!shortUrl) {
        console.error('Short URL not found.');
        return;
      }
  
      // Encode the short URL for the API request
      const encodedLink = encodeURIComponent(shortUrl);
      
  
      // Make the API request to update the URL
      const response = await fetch(`https://flask-backend-5-28db.onrender.com/update1${shortUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLink), // Only send the new original URL
      });
  
      // Check if the response is successful
      const data = await response.json();
  
      if (response.ok && data.message === 'Original URL updated successfully') {
        // Update the displayed list of links with the new original URL
        const updatedLinks = [...links];
        updatedLinks[selectedLinkIndex] = {
          ...updatedLinks[selectedLinkIndex],
          original_url: newOriginalUrl, // Update the original URL
        };
        setLinks(updatedLinks); // Update state with the new links
        setShowEditModal(false); // Close the edit modal
      } else {
        console.error('Failed to update the link:', data.error || data.message);
      }
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };
  
 
  
  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="border rounded p-2 mb-2 mt-2">
      <h4 className="mb-3 fw-bold">Liên kết gần đây</h4>

      <div className="links">
        {links.length > 0 ? (
          links.map((link, index) => (
            <div key={index} className="card shadow-sm p-3 mb-2">
              <div className="d-flex align-items-start">
                <div className="flex-grow-1">
                  <div className="mb-2 d-block">
                  <a
  href={`https://flask-backend-5-28db.onrender.com${link.short_url}`}
  target="_blank"
  rel="nofollow"
  className="align-middle"
>
  <strong className="text-break">{`https://flask-backend-5-28db.onrender.com${link.short_url}`}</strong>
</a>

                  </div>
                  {/* Button to Copy URL */}
                  <CopyToClipboard text={`https://flask-backend-5-28db.onrender.com${link.short_url}`}>
                    <button className="btn btn-primary">
                      <small>Sao chép</small>
                    </button>
                  </CopyToClipboard>

                  {/* Button for Facebook Debug */}
                  <a
                    href={`https://developers.facebook.com/tools/debug/?q=${`https://flask-backend-b9oe.onrender.com${link.short_url}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-danger ms-2"
                  >
                    <small>Facebook Debug</small>
                  </a>

                  {/* Ellipsis button to edit the link */}
                  <Button
                    variant="outline-secondary"
                    className="ms-2"
                    onClick={() => handleEditClick(link, index)}
                  >
                    ...
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No links found</p>
        )}
      </div>

      {/* Edit Link Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa liên kết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display Short URL */}
          <InputGroup className="mb-3">
            <InputGroup.Text>Link rút gọn</InputGroup.Text>
            <FormControl
              value={`https://flask-backend-5-28db.onrender.com${editLink}`}
              readOnly
            />
          </InputGroup>

          {/* Display Original URL (Editable) */}
          <InputGroup className="mb-3">
            <InputGroup.Text>URL gốc mới</InputGroup.Text>
            <FormControl
              value={newOriginalUrl} // This is the new original URL input
              onChange={(e) => setNewOriginalUrl(e.target.value)} // Set the state for new original URL
              placeholder="Nhập URL gốc mới"
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecentLinks;
