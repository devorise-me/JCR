export async function signOut() {
  try {
    const response = await fetch("/api/auth/signout", {
      method: "POST",
    });

    if (response.ok) {
      localStorage.removeItem("authToken");
    } else {
      console.error("Failed to sign out");
    }
  } catch (error) {
    console.error("An error occurred while signing out:", error);
  }
}
