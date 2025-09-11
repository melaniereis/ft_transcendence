import { translations } from './language/translations.js';

const lang = (['en', 'es', 'pt'].includes(localStorage.getItem('preferredLanguage') || '')
	? localStorage.getItem('preferredLanguage')
	: 'en') as keyof typeof translations;
const t = translations[lang];

export function renderSettingsPage(container: HTMLElement) {
    container.innerHTML = `
       <div class="settings-container min-h-screen flex flex-col px-6">
            <!-- Top title, closer to top but with margin -->
            <div class="pt-16 pb-4 flex justify-center">
                <h2 class="text-3xl font-bold text-black">${t.playerSettings}</h2>
            </div>

            <!-- Main content shifted a bit higher -->
            <div class="flex-grow flex flex-col items-center justify-start pt-10">
                <h3 class="text-xl font-semibold text-black mb-2">${t.deleteUser}</h3>

                <button id="delete-user" class="delete-btn bg-red-200 hover:bg-red-300 text-red-800 font-semibold py-2 px-4 rounded transition duration-200">
                ${t.deleteUserBtn}
                </button>

                <div id="confirmation" class="mt-4 hidden flex-col items-center">
                <p class="text-sm text-black mb-2">${t.confirmDeleteUser}</p>
                <button id="confirm-delete" class="bg-red-300 hover:bg-red-400 text-white font-semibold py-2 px-4 rounded transition duration-200">
                    ${t.confirmDeleteBtn}
                </button>
                </div>

                <div id="result" class="result mt-6 text-sm text-black text-center"></div>
            </div>
        </div>`
        
    const result = document.getElementById('result') as HTMLDivElement;
    const deleteBtn = document.getElementById('delete-user') as HTMLButtonElement;
    const confirmationBox = document.getElementById('confirmation') as HTMLDivElement;
    const confirmDeleteBtn = document.getElementById('confirm-delete') as HTMLButtonElement;

    deleteBtn.addEventListener('click', () => {
        confirmationBox.classList.remove('hidden');
    });

    confirmDeleteBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            result.innerText = t.notLoggedIn;
            return;
        }

        try {
            const response = await fetch('/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error(t.failedToFetchUser);

            const user = await response.json();
            if (!user || !user.id) {
                result.innerText = t.userNotFound;
                return;
            }

            const deleteResponse = await fetch(`/users/${user.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!deleteResponse.ok) throw new Error(t.failedToDeleteUser);

            result.innerText = `🗑️ ${t.userDeleted} "${user.username}"`;
            localStorage.removeItem('authToken');
            container.innerHTML = `<p>${t.loggedOutMessage}</p>`;
        } catch (err) {
            result.innerText = `${(err as Error).message}`;
        }
    });
}
