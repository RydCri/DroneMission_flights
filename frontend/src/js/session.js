export async function checkSession() {
    const res = await fetch('http://127.0.0.1:5000/auth/session', {
        credentials: 'include'
    });
    if (res.ok) {
        return await res.json();
    }
    return null;
}

export async function logoutUser() {
    await fetch('http://127.0.0.1:5000/auth/logout', {
        credentials: 'include'
    });
}
