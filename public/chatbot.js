document.addEventListener('DOMContentLoaded', function() {
  // Create the chatbot HTML structure
  const chatbotHTML = `
    <div class="chatbot-container" id="chatbot">
      <div class="chat-box">
        <div class="chat-header">
          <div class="chat-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            Extension Assistant
          </div>
          <div class="chat-controls">
            <button class="chat-control chat-minimize" aria-label="Minimize chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="chat-control chat-close" aria-label="Close chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="message bot-message">
            Hi there! How can I help you today?
          </div>
          <div class="typing-indicator" id="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
        <div class="chat-input-container">
          <form class="chat-form" id="chat-form">
            <input 
              type="text" 
              class="chat-input" 
              id="chat-input" 
              placeholder="Type your message..." 
              aria-label="Type your message"
              autocomplete="off"
            >
            <button type="submit" class="chat-submit" aria-label="Send message">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
      <button class="chat-toggle" id="chat-toggle" aria-label="Chat with us">
        <svg class="chat-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="chat-toggle-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
  
  // Inject the chatbot HTML into the body
  document.body.insertAdjacentHTML('beforeend', chatbotHTML);
  
  // DOM Elements
  const chatbot = document.getElementById('chatbot');
  const chatToggle = document.getElementById('chat-toggle');
  const chatClose = document.querySelector('.chat-close');
  const chatMinimize = document.querySelector('.chat-minimize');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const typingIndicator = document.getElementById('typing-indicator');
  
  // Backend API URL
  const BACKEND_ENDPOINT = 'https://extensionhub.onrender.com/chat';
  
  // Store conversation ID
  let conversationId = "default";
  
  // Check if backend is available on load
  checkBackendAvailability();
  
  // Toggle chat visibility
  chatToggle.addEventListener('click', function() {
    chatbot.classList.toggle('chatbot-active');
    if (chatbot.classList.contains('chatbot-active')) {
      chatInput.focus();
    }
  });
  
  // Close chat
  chatClose.addEventListener('click', function() {
    chatbot.classList.remove('chatbot-active');
  });
  
  // Minimize chat (just close it for now)
  chatMinimize.addEventListener('click', function() {
    chatbot.classList.remove('chatbot-active');
  });
  
  // Add a message to the chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    
    // Insert before typing indicator
    chatMessages.insertBefore(messageDiv, typingIndicator);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    typingIndicator.style.display = 'flex';
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  // Hide typing indicator
  function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
  }
  
  // Check if backend is available
  async function checkBackendAvailability() {
    try {
      // First try the health endpoint
      try {
        const healthResponse = await fetch('https://extensionhub.onrender.com/health', {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Accept': 'application/json'
          }
        });
          
        if (healthResponse.ok) {
          console.log('Backend health check successful');
          return true;
        }
      } catch (healthError) {
        console.log('Health endpoint not available, trying main endpoint');
      }
        
      // If health endpoint failed, try a simple OPTIONS request to the main endpoint
      const response = await fetch('https://extensionhub.onrender.com/chat', {
        method: 'OPTIONS',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
        
      // If we got any response, consider the backend available
      console.log('Backend chat endpoint responded');
      return true;
    } catch (error) {
      console.warn('Backend not available:', error);
      return false;
    }
  }
  
  // Process message locally (fallback for when backend is not available)
  function processMessageLocally(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! How can I assist you with our Chrome extensions today?";
    } else if (lowerMessage.includes('features') || lowerMessage.includes('functionality')) {
      return "Our Chrome extensions offer features like grammar checking, email summarization, and Google Docs assistance.";
    } else if (lowerMessage.includes('installation') || lowerMessage.includes('setup')) {
      return "To install our Chrome extensions, visit the Chrome Web Store and follow the installation instructions.";
    } else if (lowerMessage.includes('support') || lowerMessage.includes('help')) {
      return "For support, please visit our help center or contact us through our website.";
    } else if (lowerMessage.includes('compatibility') || lowerMessage.includes('browser support')) {
      return "Our extensions are compatible with the latest versions of Google Chrome. Support for other browsers is coming soon!";
    } else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
      return "You're welcome! Let me know if you have any other questions.";
    } else {
      return "Thank you for your question about our Chrome extensions. Could you please be more specific, or visit our support page for detailed information?";
    }
  }
  
  // Send message to backend
  async function sendToBackend(userMessage) {
    try {
      // Create the request body - ensure conversation_id is included
      const requestBody = {
        message: userMessage
      };
      
      // Only add conversation_id if it's not the default value
      if (conversationId && conversationId !== "default") {
        requestBody.conversation_id = conversationId;
      }
      
      console.log('Sending to backend:', requestBody);
      
      const response = await fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server error: ${response.status}`, errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update conversation ID if provided
      if (data.conversation_id) {
        conversationId = data.conversation_id;
      }
      
      return data.response || "Sorry, I didn't get a proper response from the server.";
    } catch (error) {
      console.error('Error connecting to backend:', error);
      // Fall back to local processing if backend is unavailable
      return processMessageLocally(userMessage);
    }
  }
  // Handle form submission
  chatForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userMessage = chatInput.value.trim();
    
    if (userMessage === '') return;
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Show typing indicator
    showTypingIndicator();
    
    // Send to backend and get response
    try {
      const botResponse = await sendToBackend(userMessage);
      
      // Small delay to make the typing feel more natural
      setTimeout(() => {
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add bot response to chat
        addMessage(botResponse, 'bot');
      }, 800);
    } catch (error) {
      console.error('Error processing message:', error);
      
      setTimeout(() => {
        hideTypingIndicator();
        addMessage("Sorry, I'm having trouble connecting to my knowledge base. Let me try to help with what I know.", 'bot');
        
        // Try local processing as fallback
        const localResponse = processMessageLocally(userMessage);
        if (localResponse) {
          setTimeout(() => {
            addMessage(localResponse, 'bot');
          }, 800);
        }
      }, 800);
    }
  });
});