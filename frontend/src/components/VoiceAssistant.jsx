import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoiceAssistant.css';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check login status
  useEffect(() => {
    const checkAuthStatus = () => {
      const hasToken = 
        localStorage.getItem("userToken") || 
        localStorage.getItem("driverToken") || 
        localStorage.getItem("adminToken");
      setIsLoggedIn(!!hasToken);
    };

    checkAuthStatus(); // initial check

    window.addEventListener('storage', checkAuthStatus);
    window.addEventListener('authStateChanged', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStateChanged', checkAuthStatus);
    };
  }, []);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize the voice here if needed
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase();
      console.log("Voice recognized: ", transcript);

      // --- NAVIGATION COMMANDS ---
      if (transcript.includes('ambulance') || (transcript.includes('book') && !transcript.includes('booking'))) {
        speak("Opening Book Ambulance");
        navigate('/book-ambulance'); 
        setIsListening(false);
      } else if (transcript.includes('sos') || transcript.includes('emergency')) {
        speak("Activating SOS Protocol");
        navigate('/sos'); 
        setIsListening(false);
      } else if (transcript.includes('home')) {
        speak("Going to Home page");
        navigate('/');
        setIsListening(false);
      } else if (transcript.includes('dashboard')) {
        speak("Opening Dashboard");
        if (localStorage.getItem("adminToken")) navigate('/admin-dashboard');
        else if (localStorage.getItem("driverToken")) navigate('/driver-dashboard');
        else navigate('/dashboard');
        setIsListening(false);
      } else if (transcript.includes('profile')) {
        speak("Opening your profile");
        navigate('/profile');
        setIsListening(false);
      } else if (transcript.includes('booking')) {
        speak("Opening your bookings");
        if (localStorage.getItem("adminToken")) navigate('/admin-bookings');
        else navigate('/my-bookings');
        setIsListening(false);
      } else if (transcript.includes('medicine') || transcript.includes('pharmacy')) {
        speak("Opening Medicine Store");
        navigate('/medicine');
        setIsListening(false);
      } else if (transcript.includes('report')) {
        speak("Opening Medical Reports");
        navigate('/reports');
        setIsListening(false);
      } else if (transcript.includes('track')) {
        speak("Opening Live Tracking");
        navigate('/tracking');
        setIsListening(false);
      } else {
        console.log("No matching command found for:", transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    if (isListening) {
      // Small timeout to prevent repeated start errors immediately after render
      setTimeout(() => {
        try {
          speak("I am listening. What do you need?");
          recognition.start();
        } catch (e) {
          console.error("Error starting recognition:", e);
        }
      }, 300);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    };
  }, [isListening, navigate]);

  // Hide the component if the user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="voice-assistant-container">
      <button 
        onClick={() => setIsListening(!isListening)}
        className={`voice-btn ${isListening ? 'listening-active' : ''}`}
        title="Tap to speak"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-mic">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
          <line x1="8" y1="22" x2="16" y2="22"></line>
        </svg>
      </button>
    </div>
  );
};

export default VoiceAssistant;
