import {ModalManager} from "./modal.js";

const backend = 'http://127.0.0.1:5000'
export async function loginUser() {
    const loginForm = document.getElementById('login-form');
    // Call this once on page load
    // checkLoginStatus();

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        const res = await fetch(`${backend}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({username, password})
        });

        if (res.ok) {
            console.log(`${username} Logged in`)
            ModalManager.toggle('login-modal')
            updateAuthUI(true)
        }
    })
}

export async function logoutUser() {
    await fetch(`${backend}/auth/logout`, { method: 'POST' });
}

export async function checkSession() {
    const res = await fetch(`${backend}/auth/session`,{
        method: 'GET',
        credentials: 'include'
    });
    // return res.ok ? await res.json() : null;
    if (res.ok){
        console.log('Check Session called: Logged in.')
        document.dispatchEvent(new CustomEvent('user-logged-in'));
    }
    else {
        console.log('Not logged in')
    }
}

function updateAuthUI(isLoggedIn) {
    console.log("UPDATE AUTH")
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');

    if (isLoggedIn) {

        loginBtn.classList.add('hidden');
        profileBtn.classList.remove('hidden');
        // setupUploadForm()
    } else {
        loginBtn.classList.remove('hidden');
        profileBtn.classList.add('hidden');
    }
}