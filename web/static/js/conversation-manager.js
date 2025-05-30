/**
 * Conversation Manager for English Learning Voice Assistant
 * Handles conversation history and message display
 */

class ConversationManager {
    constructor(app) {
        this.app = app;
        this.messages = [];
    }
    
    addMessage(type, text, translation = null) {
        const message = {
            id: Date.now(),
            type: type, // 'user' or 'ai'
            text: text,
            translation: translation,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.displayMessage(message);
        
        // Auto scroll to latest message
        this.scrollToBottom();
    }
    
    displayMessage(message) {
        const historyContent = document.getElementById('history-content');
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.dataset.messageId = message.id;
        
        const header = document.createElement('div');
        header.className = 'message-header';
        header.innerHTML = `
            <span class="message-type">${message.type === 'user' ? 'You' : 'AI'}</span>
            <span class="message-time">${this.formatTime(message.timestamp)}</span>
        `;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = message.text;
        
        messageElement.appendChild(header);
        messageElement.appendChild(content);
        
        // Add translation if available
        if (message.translation) {
            const translationElement = document.createElement('div');
            translationElement.className = 'message-translation';
            translationElement.textContent = message.translation;
            messageElement.appendChild(translationElement);
        }
        
        historyContent.appendChild(messageElement);
    }
    
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    clearHistory() {
        this.messages = [];
        const historyContent = document.getElementById('history-content');
        historyContent.innerHTML = '';
        
        // Add a system message
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
            <div class="empty-state-icon">💬</div>
            <div class="empty-state-text">会話履歴がクリアされました</div>
        `;
        historyContent.appendChild(emptyMessage);
        
        // Remove empty state after 2 seconds
        setTimeout(() => {
            if (historyContent.contains(emptyMessage)) {
                historyContent.removeChild(emptyMessage);
            }
        }, 2000);
    }
    
    scrollToBottom() {
        const historyContent = document.getElementById('history-content');
        historyContent.scrollTop = historyContent.scrollHeight;
    }
    
    updateMessageTranslation(messageId, translation) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            message.translation = translation;
            
            // Update UI
            const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageElement) {
                let translationElement = messageElement.querySelector('.message-translation');
                if (!translationElement) {
                    translationElement = document.createElement('div');
                    translationElement.className = 'message-translation';
                    messageElement.appendChild(translationElement);
                }
                translationElement.textContent = translation;
            }
        }
    }
    
    // Phase 1 test method - will be used properly in Phase 2
    addTestMessages() {
        this.addMessage('user', 'Hello, I would like to make a reservation.', 'こんにちは、予約をしたいのですが。');
        this.addMessage('ai', 'Good evening! I\'d be happy to help you with a reservation. For how many people?', 'こんばんは！予約のお手伝いをさせていただきます。何名様ですか？');
        this.addMessage('user', 'For two people, please.', '2名でお願いします。');
        this.addMessage('ai', 'Certainly, for two people. What date and time would you prefer?', 'かしこまりました、2名様ですね。ご希望の日時はいつですか？');
    }
}