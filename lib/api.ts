export async function fetchCamels(userId: string) {
  const res = await fetch(`/api/camels/${userId}`);
  if (!res.ok) {
    throw new Error("Failed to fetch camels");
  }
  return res.json();
}

export async function fetchLoops(eventId: string) {
  const res = await fetch(`/api/events/${eventId}/getLoops`);
  if (!res.ok) {
    throw new Error("Failed to fetch loops");
  }
  return res.json();
}
