const BASE_URL = "https://story-api.dicoding.dev/v1";

export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Pendaftaran gagal");
    }

    return result;
  } catch (error) {
    console.error("Error saat registrasi:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Login gagal");
    }
    
    return result.loginResult.token;
  } catch (error) {
    console.error("Error saat login:", error);
    throw error;
  }
};

import { getAllStories as getAllStoriesIDB, saveStory as saveStoryIDB } from '../utils/idb';

export const getAllStories = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Terjadi kesalahan saat mengambil data: ${response.status}`);
    }

    const result = await response.json();
    // Simpan ke IndexedDB untuk offline
    if (Array.isArray(result.listStory)) {
      for (const story of result.listStory) {
        await saveStoryIDB(story);
      }
    }
    return result.listStory;
  } catch (error) {
    // Jika offline, ambil dari IndexedDB
    console.warn("Gagal fetch API, ambil dari IndexedDB:", error);
    return await getAllStoriesIDB();
  }
};

export const postStoryWithLocation = async (formData) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Gagal mengirim cerita");
    }

    return result;
  } catch (error) {
    console.error("Error saat mengirim cerita:", error);
    throw error;
  }
};

export const getStoryById = async (id) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");
  }

  try {
    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    if (!response.ok) {
      console.error("Kesalahan API:", result.message);
      return null;
    }

    return result.story
      ? {
          ...result.story,
          lat: result.story.lat ?? result.story.latitude ?? null,
          lon: result.story.lon ?? result.story.longitude ?? null,
        }
      : null;
  } catch (error) {
    console.error("Error saat mengambil cerita:", error);
    return null;
  }
};