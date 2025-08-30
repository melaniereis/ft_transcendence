// collapsibles.ts
// Delegação de eventos para expand/collapse robusto
export function setupCollapsibleDelegation(container: HTMLElement) {
	container.addEventListener('click', function (e) {
		const toggle = (e.target as HTMLElement).closest('.collapsible-toggle');
		if (!toggle) return;
		e.preventDefault();
		const targetId = toggle.getAttribute('data-target');
		const content = document.getElementById(targetId!);
		const arrow = toggle.querySelector('.toggle-arrow');
		if (content) {
			const isOpen = content.style.display === 'block';
			// Hide all other sections if not friends
			if (targetId !== 'friends-content') {
				document.querySelectorAll('.collapsible-content').forEach(function (c) {
					if ((c as HTMLElement).id !== targetId) {
						(c as HTMLElement).style.display = 'none';
						const t = document.querySelector('.collapsible-toggle[data-target="' + (c as HTMLElement).id + '"] .toggle-arrow');
						if (t) t.textContent = '▶';
					}
				});
			}
			(content as HTMLElement).style.display = isOpen ? 'none' : 'block';
			if (arrow) arrow.textContent = isOpen ? '▶' : '▼';
		}
	});

	// Teclado: Enter ou Espaço
	container.addEventListener('keydown', function (e) {
		const target = e.target as HTMLElement;
		if (!target.classList.contains('collapsible-toggle')) return;
		if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
			e.preventDefault();
			target.click();
		}
	});

	// Estado inicial: só profile aberto
	document.querySelectorAll('.collapsible-content').forEach(function (c) {
		if ((c as HTMLElement).id === 'profile-content') {
			(c as HTMLElement).style.display = 'block';
			const t = document.querySelector('.collapsible-toggle[data-target="' + (c as HTMLElement).id + '"] .toggle-arrow');
			if (t) t.textContent = '▼';
		} else {
			(c as HTMLElement).style.display = 'none';
			const t = document.querySelector('.collapsible-toggle[data-target="' + (c as HTMLElement).id + '"] .toggle-arrow');
			if (t) t.textContent = '▶';
		}
	});
}
