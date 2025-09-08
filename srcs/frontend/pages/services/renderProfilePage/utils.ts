// renderProfilePage/utils.ts
import { state } from './state.js';

function setHTML(el: HTMLElement, html: string) { el.innerHTML = html; }

function showNotification(message: string, color: string) {
	const el = document.getElementById('notification');
	if (!el) return;
	el.textContent = message;
	(el as HTMLElement).style.backgroundColor = color;
	(el as HTMLElement).style.display = 'block';
	setTimeout(() => ((el as HTMLElement).style.display = 'none'), 3000);
}

function showInlineMessage(id: string, message: string, color: string) {
	const el = document.getElementById(id) as HTMLElement | null;
	if (!el) return;
	el.textContent = message;
	el.style.color = color;
	setTimeout(() => { el.textContent = ''; }, 3000);
}

export { setHTML, showNotification, showInlineMessage };
