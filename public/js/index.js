import '@babel/polyfill';
import { displayMap } from "./mapbox";
import { login, logout } from "./login.js";
import { updateData } from "./updateSettings";

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logOutBtn = document.querySelector('.nav__el--logout');

if (mapBox){
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        login(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
}

if (userDataForm) {
    userDataForm.addEventListener('submit', async e => {
       e.preventDefault();

        const saveBtn = document.querySelector('.btn--save--data');
        saveBtn.textContent = 'Updating...';
        saveBtn.disabled = true;

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        await updateData({ name, email});

        saveBtn.textContent = 'Save settings';
        saveBtn.disabled = false
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();

        const saveBtn = document.querySelector('.btn--save--password');
        saveBtn.textContent = 'Updating...';
        saveBtn.disabled = true;

        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateData({ passwordCurrent, password, passwordConfirm }, true);

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

        saveBtn.textContent = 'Save password';
        saveBtn.disabled = false;
    });
}