import { loginUser, logoutUser, checkSession } from './js/auth.js';
import { ModalManager } from "./js/modal.js";
import { initMap } from './js/map.js';

const loginContainer = document.getElementById('login-modal');
const mapContainer = document.getElementById('map-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const statusText = document.getElementById('login-status');

loginBtn.addEventListener('click', async () => {
        ModalManager.toggle('login-modal')
});

logoutBtn.addEventListener('click', async () => {
    await logoutUser();
    loginContainer.classList.remove('hidden');
    mapContainer.classList.add('hidden');
});

window.addEventListener('DOMContentLoaded', async () => {
    await loginUser()
    const user = await checkSession();
    if (user) {
        ModalManager.toggle('login-modal')
        ModalManager.toggle('map-container')
        initMap();
    }
});
