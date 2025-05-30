/**
 * Main Application for English Learning Voice Assistant
 * Phase 1: Basic foundation with WebSocket communication
 */

class VoiceAssistantApp {
    constructor() {
        this.socket = null;
        this.audioManager = null;
        this.sceneManager = null;
        this.conversationManager = null;
        
        this.currentScene = null;
        this.currentUserRole = null;
        this.currentAIRole = null;
        this.sessionActive = false;
        
        this.initializeApp();
    }
    
    async initializeApp() {
        console.log('Initializing Voice Assistant App...');
        
        // Initialize Socket.IO connection
        this.initializeSocket();
        
        // Initialize managers
        this.sceneManager = new SceneManager(this);
        this.conversationManager = new ConversationManager(this);
        this.audioManager = new AudioManager(this);
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadInitialData();
    }
    
    initializeSocket() {
        // Connect to WebSocket with the specified path
        this.socket = io({
            path: '/ws/socket.io',
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });
        
        // Connection events
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });
        
        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.showToast('接続エラーが発生しました', 'error');
        });
        
        // Application events
        this.socket.on('connection_established', (data) => {
            console.log('Connection established:', data);
        });
        
        this.socket.on('scene_role_confirmed', (data) => {
            console.log('Scene and role confirmed:', data);
            this.handleSceneRoleConfirmed(data);
        });
        
        this.socket.on('session_status', (data) => {
            console.log('Session status:', data);
            this.handleSessionStatus(data);
        });
        
        this.socket.on('audio_received', (data) => {
            console.log('Audio acknowledged:', data);
        });
        
        // Phase 2 events (placeholders for now)
        this.socket.on('ai_audio_response', (data) => {
            console.log('AI audio response received (Phase 2):', data);
            // Will be implemented in Phase 2
        });
        
        this.socket.on('transcription_update', (data) => {
            console.log('Transcription update (Phase 2):', data);
            // Will be implemented in Phase 2
        });
    }
    
    setupEventListeners() {
        // Start conversation button
        const startButton = document.getElementById('start-conversation');
        if (startButton) {
            startButton.addEventListener('click', () => this.startConversation());
        }
        
        // Toggle session button
        const toggleButton = document.getElementById('toggle-session');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleSession());
        }
        
        // Back to selection button
        const backButton = document.getElementById('back-to-selection');
        if (backButton) {
            backButton.addEventListener('click', () => this.backToSceneSelection());
        }
        
        // Clear history button
        const clearButton = document.getElementById('clear-history');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.conversationManager.clearHistory());
        }
    }
    
    async loadInitialData() {
        try {
            // Load scenes
            const response = await fetch('/api/scenes');
            const data = await response.json();
            this.sceneManager.loadScenes(data.scenes);
            
            // Load config
            const configResponse = await fetch('/api/config');
            const config = await configResponse.json();
            console.log('App config loaded:', config);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showToast('初期データの読み込みに失敗しました', 'error');
        }
    }
    
    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connection-status');
        const statusIcon = statusElement.querySelector('.status-icon');
        const statusText = statusElement.querySelector('.status-text');
        
        if (connected) {
            statusElement.classList.add('connected');
            statusElement.classList.remove('disconnected');
            statusIcon.textContent = '🟢';
            statusText.textContent = 'Connected';
        } else {
            statusElement.classList.remove('connected');
            statusElement.classList.add('disconnected');
            statusIcon.textContent = '🔴';
            statusText.textContent = 'Disconnected';
        }
    }
    
    startConversation() {
        const scene = this.sceneManager.selectedScene;
        const userRole = document.getElementById('user-role-select').value;
        const aiRole = document.getElementById('ai-role-select').value;
        
        if (!scene || !userRole || !aiRole) {
            this.showToast('シーンとロールを選択してください', 'error');
            return;
        }
        
        // Send scene and role selection to server
        this.socket.emit('select_scene_role', {
            scene: scene.id,
            user_role: userRole,
            ai_role: aiRole
        });
    }
    
    handleSceneRoleConfirmed(data) {
        this.currentScene = data.scene;
        this.currentUserRole = data.user_role;
        this.currentAIRole = data.ai_role;
        
        // Update UI
        this.showConversationArea();
        this.updateStatusDisplay();
    }
    
    showConversationArea() {
        // Hide scene selection
        document.getElementById('scene-selection').style.display = 'none';
        
        // Show conversation area
        document.getElementById('conversation-area').style.display = 'block';
        document.getElementById('learning-support').style.display = 'block';
    }
    
    updateStatusDisplay() {
        // Update current scene display
        const selectedScene = this.sceneManager.scenes.find(s => s.id === this.currentScene);
        if (selectedScene) {
            document.getElementById('current-scene-icon').textContent = selectedScene.icon;
            document.getElementById('current-scene-name').textContent = selectedScene.name;
        }
        
        // Update roles
        document.getElementById('current-user-role').textContent = this.currentUserRole;
        document.getElementById('current-ai-role').textContent = this.currentAIRole;
    }
    
    toggleSession() {
        if (this.sessionActive) {
            this.socket.emit('stop_session');
        } else {
            this.socket.emit('start_session');
        }
    }
    
    handleSessionStatus(data) {
        this.sessionActive = data.status === 'active';
        
        const toggleButton = document.getElementById('toggle-session');
        const buttonText = toggleButton.querySelector('.btn-text');
        
        if (this.sessionActive) {
            toggleButton.classList.add('btn-danger');
            toggleButton.classList.remove('btn-primary');
            buttonText.textContent = 'セッション停止';
            this.showToast('セッションを開始しました', 'success');
        } else {
            toggleButton.classList.remove('btn-danger');
            toggleButton.classList.add('btn-primary');
            buttonText.textContent = 'セッション開始';
            this.showToast('セッションを停止しました', 'info');
        }
    }
    
    backToSceneSelection() {
        // Stop session if active
        if (this.sessionActive) {
            this.socket.emit('stop_session');
        }
        
        // Reset state
        this.currentScene = null;
        this.currentUserRole = null;
        this.currentAIRole = null;
        this.sessionActive = false;
        
        // Update UI
        document.getElementById('conversation-area').style.display = 'none';
        document.getElementById('learning-support').style.display = 'none';
        document.getElementById('scene-selection').style.display = 'block';
        
        // Reset scene selection
        this.sceneManager.resetSelection();
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VoiceAssistantApp();
});