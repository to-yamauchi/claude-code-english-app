/**
 * Audio Manager for English Learning Voice Assistant
 * Phase 1: Basic audio setup and volume meter
 * Phase 2 will add: WebRTC, AudioWorkletNode, and actual audio processing
 */

class AudioManager {
    constructor(app) {
        this.app = app;
        this.audioContext = null;
        this.mediaStream = null;
        this.isRecording = false;
        this.volumeUpdateInterval = null;
        
        // Audio configuration
        this.audioConfig = {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true
        };
    }
    
    async initialize() {
        try {
            // Phase 1: Basic initialization
            console.log('Initializing audio manager...');
            
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.audioConfig.sampleRate
            });
            
            // Request microphone permission
            await this.requestMicrophonePermission();
            
            console.log('Audio manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize audio manager:', error);
            this.app.showToast('音声機能の初期化に失敗しました', 'error');
        }
    }
    
    async requestMicrophonePermission() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: this.audioConfig
            });
            
            // Phase 1: Just show that we have permission
            this.app.showToast('マイクのアクセスが許可されました', 'success');
            
            // Start volume monitoring
            this.startVolumeMonitoring();
        } catch (error) {
            console.error('Microphone permission denied:', error);
            this.app.showToast('マイクへのアクセスが拒否されました', 'error');
            throw error;
        }
    }
    
    startVolumeMonitoring() {
        if (!this.mediaStream || !this.audioContext) return;
        
        // Create analyser node for volume detection
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        source.connect(analyser);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Update volume meter
        this.volumeUpdateInterval = setInterval(() => {
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const volumePercentage = Math.min(100, (average / 255) * 100 * 2); // Scale up for visibility
            
            this.updateVolumeMeter(volumePercentage);
        }, 100);
    }
    
    updateVolumeMeter(percentage) {
        const volumeBar = document.getElementById('volume-bar');
        if (volumeBar) {
            volumeBar.style.width = `${percentage}%`;
            
            // Change color based on volume level
            if (percentage > 80) {
                volumeBar.style.backgroundColor = 'var(--danger-color)';
            } else if (percentage > 50) {
                volumeBar.style.backgroundColor = 'var(--warning-color)';
            } else {
                volumeBar.style.backgroundColor = 'var(--secondary-color)';
            }
        }
    }
    
    startRecording() {
        if (!this.mediaStream) {
            this.app.showToast('マイクが初期化されていません', 'error');
            return;
        }
        
        this.isRecording = true;
        console.log('Recording started (Phase 1 - no actual recording yet)');
        
        // Phase 1: Just simulate recording
        this.app.showToast('録音を開始しました (Phase 1)', 'info');
        
        // In Phase 2, this will:
        // - Create AudioWorkletNode
        // - Process audio chunks
        // - Send to server via WebSocket
    }
    
    stopRecording() {
        this.isRecording = false;
        console.log('Recording stopped');
        this.app.showToast('録音を停止しました', 'info');
    }
    
    playAudioResponse(audioData) {
        // Phase 2: Will implement actual audio playback
        console.log('Audio playback requested (Phase 2 feature)');
    }
    
    cleanup() {
        // Stop volume monitoring
        if (this.volumeUpdateInterval) {
            clearInterval(this.volumeUpdateInterval);
            this.volumeUpdateInterval = null;
        }
        
        // Stop media stream
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
    
    // Test method for Phase 1
    async testAudioSetup() {
        await this.initialize();
        
        // Simulate volume changes
        let testVolume = 0;
        let direction = 1;
        
        const testInterval = setInterval(() => {
            testVolume += direction * 5;
            if (testVolume >= 100 || testVolume <= 0) {
                direction *= -1;
            }
            this.updateVolumeMeter(testVolume);
        }, 100);
        
        // Stop test after 5 seconds
        setTimeout(() => {
            clearInterval(testInterval);
            this.updateVolumeMeter(0);
        }, 5000);
    }
}