import { useState, useEffect, useRef } from "react";
import { Container } from "@mui/material";
import {
  converseWithChat,
  listChatAssistants,
  createSessionWithChat,
  createChatAssistant,
  listDatasets,
  getLastMessage,
} from "../../api/ragflowApi";
import { useSearchParams } from 'react-router-dom'
import ChatWindow from "./ChatWindow";

const Chat = () => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleName = searchParams.get('module');

  const [messages, setMessages] = useState([
    {
      id: 0,
      sender: "assistant",
      text: "Hi! I am your virtual tutor. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [spinnerError, setSpinnerError] = useState(false);
  const [datasetId, setDatasetId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionInitialising, setIsSessionInitialising] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchDataset() {
      try {
        console.log("Fetching datasets...");
        const response = await listDatasets({ name: moduleName, page_size: 1 });
        if (response.code === 0 && response.data.length > 0) {
          const firstDataset = response.data[0];
          setDatasetId(firstDataset.id);
          console.log("Using datasetId:", firstDataset.id);
          console.log("Dataset details:", firstDataset);
        } else {
          console.warn("No datasets found. Please create a dataset first.");
        }
      } catch (error) {
        console.error("Error fetching datasets:", error);
      }
    }

    fetchDataset();
  }, [moduleName]);

  useEffect(() => {
    async function fetchOrCreateChatId() {
      if (!datasetId) {
        return;
      }
      try {
        const savedChatId = sessionStorage.getItem("chatId");
        if (savedChatId) {
          setChatId(savedChatId);
          console.log("Loaded chatId from sessionStorage:", savedChatId);
          return;
        }

        console.log("Fetching chat assistants...");
        const response = await listChatAssistants({ name: "Virtual Tutor" });
        if (response.code === 0 && response.data.length > 0) {
          const existingChat = response.data.find(
            (chat) => chat.name === "Virtual Tutor"
          );
          if (existingChat) {
            setChatId(existingChat.id);
            sessionStorage.setItem("chatId", existingChat.id);
            console.log("Using existing chatId:", existingChat.id);
          } else {
            console.warn(
              "No matching chat assistant found. Creating a new one."
            );
            const newChatResponse = await createChatAssistant({
              name: "Virtual Tutor",
              description: "Your personal learning assistant.",
              dataset_ids: [datasetId],
            });
            if (newChatResponse.code === 0 && newChatResponse.data) {
              setChatId(newChatResponse.data.id);
              sessionStorage.setItem("chatId", newChatResponse.data.id);
              console.log("Created new chatId:", newChatResponse.data.id);
            } else {
              console.error(
                "Failed to create a new chat assistant:",
                newChatResponse.message
              );
            }
          }
        } else {
          console.warn("No chat assistants found. Creating a new one.");
          const newChatResponse = await createChatAssistant({
            name: "Virtual Tutor",
            description: "Your personal learning assistant.",
            dataset_ids: [datasetId],
          });
          if (newChatResponse.code === 0 && newChatResponse.data) {
            setChatId(newChatResponse.data.id);
            sessionStorage.setItem("chatId", newChatResponse.data.id);
            console.log("Created new chatId:", newChatResponse.data.id);
          } else {
            console.error(
              "Failed to create a new chat assistant:",
              newChatResponse.message
            );
          }
        }
      } catch (error) {
        console.error("Error fetching or creating chat assistants:", error);
      }
    }

    fetchOrCreateChatId();
  }, [datasetId]);

  useEffect(() => {
    async function initializeSession() {
      if (!chatId) {
        return;
      }
      try {
        const savedSessionId = sessionStorage.getItem("sessionId");
        if (savedSessionId) {
          setSessionId(savedSessionId);
          console.log("Loaded sessionId from sessionStorage:", savedSessionId);
        } else {
          console.log("Creating a new session...");
          const sessionData = { name: "User Session" };
          const sessionResponse = await createSessionWithChat(
            chatId,
            sessionData
          );

          if (sessionResponse.code === 0 && sessionResponse.data) {
            const newSessionId = sessionResponse.data.id;
            setSessionId(newSessionId);
            sessionStorage.setItem("sessionId", newSessionId);
            console.log(
              "Created new sessionId and stored in sessionStorage:",
              newSessionId
            );
          } else {
            console.error(
              "Failed to create a new session:",
              sessionResponse.message
            );
          }
        }
      } catch (error) {
        console.error("Error during session initialisation:", error);
      } finally {
        setIsSessionInitialising(false);
      }
    }

    initializeSession();
  }, [chatId, sessionId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isSessionInitialising) {
      alert("Chat session is still initialising. Please wait a moment.");
      return;
    }

    if (!chatId) {
      alert("Chat assistant not initialized yet. Please try again shortly.");
      return;
    }

    const userMessage = {
      id: messages.length,
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setSpinnerError(false);

    try {
      const conversationData = {
        question: input.trim(),
        stream: false,
        session_id: sessionId,
      };

      console.log("Sending conversationData:", conversationData);

      const response = await converseWithChat(chatId, conversationData);

      console.log("API Response:", response);

      if (response.code === 0 && response.data) {
        const botMessage = {
          id: messages.length + 1,
          sender: "assistant",
          text: response.data.answer,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else if (response.code === 401) {
        await initialiseNewSession();
        handleSend();
      } else if (response.code === 405) {
        setSpinnerError(true);
      } else {
        try {
          const lastMessage = await getLastMessage(chatId, sessionId);
          if (lastMessage) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                sender: lastMessage.role === "assistant" ? "assistant" : "user",
                text: lastMessage.content,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
          }
        } catch (error) {
          console.error(
            "Error fetching the last message after failure:",
            error
          );
        }
      }
    } catch (error) {
      console.error("Error conversing with chat assistant:", error);
      try {
        const lastMessage = await getLastMessage(chatId, sessionId);
        if (lastMessage) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 1,
              sender: lastMessage.role === "assistant" ? "assistant" : "user",
              text: lastMessage.content,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching the last message after failure:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const initialiseNewSession = async () => {
    try {
      const sessionData = { name: "User Session" };
      const sessionResponse = await createSessionWithChat(chatId, sessionData);

      if (sessionResponse.code === 0 && sessionResponse.data) {
        const newSessionId = sessionResponse.data.id;
        setSessionId(newSessionId);
        sessionStorage.setItem("sessionId", newSessionId);
        console.log(
          "Created new sessionId and stored in sessionStorage:",
          newSessionId
        );

        const lastMessage = await getLastMessage(chatId, newSessionId);
        if (lastMessage) {
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length,
              sender: lastMessage.role === "assistant" ? "assistant" : "user",
              text: lastMessage.content,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
        }
      } else {
        console.error(
          "Failed to create a new session:",
          sessionResponse.message
        );
        alert("Failed to create a new session. Please try again later.");
      }
    } catch (error) {
      console.error("Error during session initialisation:", error);
      alert("An error occurred while initialising a new session.");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ChatWindow
        messages={messages}
        messagesEndRef={messagesEndRef}
        loading={loading}
        isSessionInitialising={isSessionInitialising}
        spinnerError={spinnerError}
        input={input}
        setInput={setInput}
        handleKeyPress={handleKeyPress}
        handleSend={handleSend}
      />
    </Container>
  );
};

export default Chat;
