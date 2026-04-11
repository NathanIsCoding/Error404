import React, { useState } from 'react';
import './CreateTicket.css';

const CreateTicket = ({ onClose, initialTitle = '', initialDescription = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setResponseMessage('Title is required.');
      return;
    }

    setLoading(true);
    setResponseMessage('');

    try {
      const response = await fetch('/api/createTicket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();
      if (response.ok) {
        setResponseMessage('Ticket submitted successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setResponseMessage(`Error: ${data.error || 'Failed to submit'}`);
      }
    } catch (error) {
      console.error(error);
      setResponseMessage('Error: Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-ticket-modal z-[100] fixed inset-0 bg-black/50 flex align-center justify-center">
      <div className="create-ticket bg-[#1e1e1e] p-8 rounded-lg shadow-xl w-[90%] max-w-lg m-auto relative">
        <button className='close-button absolute top-4 right-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] flex justify-center items-center rounded-full p-1' onClick={onClose}>
          <span className="material-symbols-outlined text-white">close</span>
        </button>
        <h1 className="text-2xl font-bold mb-4 text-white">Create Support Ticket</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Issue Title<span className="text-red-500">*</span></label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 rounded bg-[#2f2f2f] text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Briefly summarize the issue"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              className="w-full p-2 rounded bg-[#2f2f2f] text-white border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Provide details about your problem..."
            ></textarea>
          </div>
          
          <button type="submit" disabled={loading} className={`mt-2 py-2 px-4 rounded font-bold text-white transition-colors duration-200 ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
        {responseMessage && <p className={`mt-4 text-center font-medium ${responseMessage.includes('Success') || responseMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>{responseMessage}</p>}
      </div>
    </div>
  );
};

export default CreateTicket;