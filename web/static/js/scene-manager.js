/**
 * Scene Manager for English Learning Voice Assistant
 * Handles scene and role selection UI
 */

class SceneManager {
    constructor(app) {
        this.app = app;
        this.scenes = [];
        this.selectedScene = null;
    }
    
    loadScenes(scenes) {
        this.scenes = scenes;
        this.renderScenes();
    }
    
    renderScenes() {
        const scenesGrid = document.getElementById('scenes-grid');
        scenesGrid.innerHTML = '';
        
        this.scenes.forEach(scene => {
            const sceneCard = this.createSceneCard(scene);
            scenesGrid.appendChild(sceneCard);
        });
    }
    
    createSceneCard(scene) {
        const card = document.createElement('div');
        card.className = 'scene-card';
        card.dataset.sceneId = scene.id;
        
        card.innerHTML = `
            <span class="scene-icon">${scene.icon}</span>
            <span class="scene-name">${scene.name}</span>
        `;
        
        card.addEventListener('click', () => this.selectScene(scene));
        
        return card;
    }
    
    selectScene(scene) {
        // Update selected state
        this.selectedScene = scene;
        
        // Update UI
        document.querySelectorAll('.scene-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-scene-id="${scene.id}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show role selection
        this.showRoleSelection(scene);
    }
    
    showRoleSelection(scene) {
        const roleSelection = document.getElementById('role-selection');
        const userRoleSelect = document.getElementById('user-role-select');
        const aiRoleSelect = document.getElementById('ai-role-select');
        
        // Clear previous options
        userRoleSelect.innerHTML = '';
        aiRoleSelect.innerHTML = '';
        
        // Add user role options
        scene.roles.user.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = this.translateRole(role);
            userRoleSelect.appendChild(option);
        });
        
        // Add AI role options
        scene.roles.ai.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = this.translateRole(role);
            aiRoleSelect.appendChild(option);
        });
        
        // Show role selection area
        roleSelection.style.display = 'block';
        
        // Smooth scroll to role selection
        roleSelection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    translateRole(role) {
        const translations = {
            'customer': 'お客様',
            'waiter': 'ウェイター',
            'guest': 'ゲスト',
            'receptionist': '受付係',
            'passenger': '乗客',
            'staff': 'スタッフ',
            'clerk': '店員'
        };
        
        return translations[role] || role;
    }
    
    resetSelection() {
        this.selectedScene = null;
        
        // Clear selected state from all cards
        document.querySelectorAll('.scene-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Hide role selection
        document.getElementById('role-selection').style.display = 'none';
    }
    
    getSelectedRoles() {
        return {
            userRole: document.getElementById('user-role-select').value,
            aiRole: document.getElementById('ai-role-select').value
        };
    }
}