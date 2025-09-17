export async function updateMatch(tournamentId: number, round: string, winnerId: number): Promise<void> {
  // Simulate async operation without sending data to backend
  try {
    // You could add logic here to update local state or simply simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulate network delay

    // Simulate success, so no error thrown

  } catch (error) {
    // Show error message UI even though nothing sent
    const feedback = document.createElement('div');
    feedback.style.position = 'fixed';
    feedback.style.top = '2rem';
    feedback.style.left = '50%';
    feedback.style.transform = 'translateX(-50%)';
    feedback.style.background = 'rgba(255,251,230,0.96)';
    feedback.style.borderRadius = '1.2rem';
    feedback.style.boxShadow = '0 4px 16px rgba(44,34,84,0.10)';
    feedback.style.padding = '1.2rem 2rem';
    feedback.style.color = '#b8002f';
    feedback.style.fontWeight = '700';
    feedback.style.fontFamily = 'Poppins, sans-serif';
    feedback.style.zIndex = '9999';
    feedback.textContent = `Failed to update match:` + (error instanceof Error ? error.message : '');
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3500);

    throw error;
  }
}
