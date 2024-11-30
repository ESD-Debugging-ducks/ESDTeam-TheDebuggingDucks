const BASE_URL = import.meta.env.VITE_RAGFLOW_BASE_URL;
const API_KEY = import.meta.env.VITE_RAGFLOW_API_KEY;

async function apiRequest(
  endpoint,
  method = "GET",
  body = null,
  isMultipart = false,
  onMessage = null
) {
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
  };

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = isMultipart ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        errorData = await response.json();
      } else {
        errorData = { message: await response.text() };
      }
      throw new Error(errorData.message || "API Error");
    }

    if (onMessage && body && body.stream === true) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        const dataParts = chunk.split("\n").filter(Boolean);
        for (const part of dataParts) {
          const trimmedPart = part.replace(/^data:/, "").trim();
          if (trimmedPart === "") continue;
          const parsedData = JSON.parse(trimmedPart);
          onMessage(parsedData);
        }
      }
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.blob();
      }
    }
  } catch (error) {
    console.error(`Error in API request to ${endpoint}:`, error);
    throw error;
  }
}

// Chat Assistants
export async function createChatAssistant(data) {
  return await apiRequest("/chats", "POST", data);
}

export async function listChatAssistants(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(`/chats?${query}`, "GET");
}

export async function deleteChatAssistants(ids = []) {
  return await apiRequest("/chats", "DELETE", { ids });
}

// Session Management
export async function createSessionWithChat(chatId, data) {
  return await apiRequest(`/chats/${chatId}/sessions`, "POST", data);
}

export async function listSessions(chatId, params = {}) {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(`/chats/${chatId}/sessions?${query}`, "GET");
}

export async function deleteSessions(chatId, ids = []) {
  return await apiRequest(`/chats/${chatId}/sessions`, "DELETE", {
    ids,
  });
}

// Chat
export async function converseWithChat(chatId, data, onMessage = null) {
  return await apiRequest(
    `/chats/${chatId}/completions`,
    "POST",
    data,
    false,
    onMessage
  );
}

export async function retrieveChunks(data) {
  return await apiRequest("/retrieval", "POST", data);
}

export async function listDatasets(params = {}) {
  const query = new URLSearchParams(params).toString();
  return await apiRequest(`/datasets?${query}`, "GET");
}

// Gets the last message in the session
export async function getLastMessage(chatId, sessionId) {
  try {
    const response = await listSessions(chatId, { id: sessionId });

    if (response.code !== 0) {
      throw new Error(
        response.message || "Failed to retrieve session details."
      );
    }

    const sessions = response.data;

    if (!sessions || sessions.length === 0) {
      console.warn("Session not found.");
      return null;
    }

    const session = sessions[0];

    if (!session.messages || session.messages.length === 0) {
      console.warn("No messages found in the session.");
      return null;
    }

    return session.messages[session.messages.length - 1];
  } catch (error) {
    console.error("Error fetching the last message:", error);
    throw error;
  }
}
