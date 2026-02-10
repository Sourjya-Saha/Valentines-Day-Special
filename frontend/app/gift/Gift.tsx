"use client";

import { useEffect, useRef, useState, FormEvent } from 'react';
import './gift.css';

export default function Gift() {
  const [messageStatus, setMessageStatus] = useState<{ text: string; type: 'success' | 'error' | '' }>({ 
    text: '', 
    type: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const heartsContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Floating hearts animation
  useEffect(() => {
    const createHeart = () => {
      if (!heartsContainerRef.current) return;
      
      const heart = document.createElement('div');
      heart.classList.add('heart');
      heart.innerHTML = '♥';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (Math.random() * 10 + 10) + 's';
      heart.style.animationDelay = Math.random() * 5 + 's';
      heartsContainerRef.current.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 20000);
    };

    // Create initial hearts
    for (let i = 0; i < 5; i++) {
      setTimeout(createHeart, i * 1000);
    }

    // Create hearts periodically
    const interval = setInterval(createHeart, 3000);

    return () => clearInterval(interval);
  }, []);

  // Video autoplay handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log('Autoplay prevented:', error);
      });
    }

    const handleEnded = () => {
      video.currentTime = 0;
      video.play();
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const message = messageInputRef.current?.value.trim();
    
    if (!message) {
      setMessageStatus({ text: 'Please write a message', type: 'error' });
      setTimeout(() => setMessageStatus({ text: '', type: '' }), 4000);
      return;
    }

    setIsSubmitting(true);

    try {
      // Using FormSubmit.co - a free form backend service
      const response = await fetch('https://formsubmit.co/ajax/sourjya1614@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          _subject: 'New Message from Memory Gallery 💝',
          _captcha: 'false'
        })
      });

      if (response.ok) {
        setMessageStatus({ text: 'Message sent successfully! ❤️', type: 'success' });
        if (messageInputRef.current) {
          messageInputRef.current.value = '';
        }
      } else {
        throw new Error('Failed to send');
      }
    } catch (error) {
      // Fallback: Open email client as backup
      const mailtoLink = `mailto:sourjya1614@gmail.com?subject=Message from Memory Gallery&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
      setMessageStatus({ text: 'Opening email client...', type: 'success' });
      if (messageInputRef.current) {
        messageInputRef.current.value = '';
      }
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessageStatus({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="gift-page">
      {/* Back Button */}
      <a href="/" className="back-link">← Go back</a>

      {/* Romantic night sky background */}
      <div className="night"></div>

      {/* Floating hearts decoration */}
      <div className="hearts-container" ref={heartsContainerRef}></div>

      {/* Main Content */}
      <div className="content-wrapper">
        
        {/* Video Section */}
        <section className="video-section">
          <h2 className="section-title">Best Moments</h2>
          
          <div className="video-frame">
            <div className="video-container">
              <video 
                ref={videoRef}
                autoPlay 
                loop 
                playsInline
               
              >
                <source src="/videos/vid2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="video-caption">
              Let&apos;s relive one of our best days...
            </div>
          </div>
        </section>

        {/* Message Section */}
        <section className="message-section">
          <h2 className="section-title">Secret Message</h2>
          
          <div className="message-form-wrapper">
            <form className="message-form" onSubmit={handleSubmit}>
              <textarea 
                ref={messageInputRef}
                className="message-input"
                placeholder="Write your secret message here..."
                required
              />
              
              <button type="submit" className="send-button" disabled={isSubmitting}>
                <span className="button-text" style={{ display: isSubmitting ? 'none' : 'inline' }}>
                  Send Message
                </span>
                <span className="button-loading" style={{ display: isSubmitting ? 'inline' : 'none' }}>
                  Sending...
                </span>
              </button>
              
              {messageStatus.text && (
                <div className={`message-status ${messageStatus.type}`}>
                  {messageStatus.text}
                </div>
              )}
            </form>
          </div>
        </section>

      </div>

      {/* FLOWER GARDEN BACKGROUND */}
      <div className="flowers">
        <div className="flower flower--1">
          <div className="flower__leafs flower__leafs--1">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
            <div className="flower__line__leaf flower__line__leaf--5"></div>
            <div className="flower__line__leaf flower__line__leaf--6"></div>
          </div>
        </div>
    
        <div className="flower flower--2">
          <div className="flower__leafs flower__leafs--2">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>
    
        <div className="flower flower--3">
          <div className="flower__leafs flower__leafs--3">
            <div className="flower__leaf flower__leaf--1"></div>
            <div className="flower__leaf flower__leaf--2"></div>
            <div className="flower__leaf flower__leaf--3"></div>
            <div className="flower__leaf flower__leaf--4"></div>
            <div className="flower__white-circle"></div>
    
            <div className="flower__light flower__light--1"></div>
            <div className="flower__light flower__light--2"></div>
            <div className="flower__light flower__light--3"></div>
            <div className="flower__light flower__light--4"></div>
            <div className="flower__light flower__light--5"></div>
            <div className="flower__light flower__light--6"></div>
            <div className="flower__light flower__light--7"></div>
            <div className="flower__light flower__light--8"></div>
          </div>
          <div className="flower__line">
            <div className="flower__line__leaf flower__line__leaf--1"></div>
            <div className="flower__line__leaf flower__line__leaf--2"></div>
            <div className="flower__line__leaf flower__line__leaf--3"></div>
            <div className="flower__line__leaf flower__line__leaf--4"></div>
          </div>
        </div>
      </div>
    </div>
  );
}