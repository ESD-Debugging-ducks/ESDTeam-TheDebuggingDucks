import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import {
  converseWithChat,
  listChatAssistants,
  createSessionWithChat,
  createChatAssistant,
  listDatasets,
} from "../api/ragflowApi";

const Chat = () => {
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
  const [datasetId, setDatasetId] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isSessionInitializing, setIsSessionInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function fetchDataset() {
      try {
        console.log("Fetching datasets...");
        const response = await listDatasets({ page: 1, page_size: 1 });
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
  }, []);

  useEffect(() => {
    async function fetchOrCreateChatId() {
      if (!datasetId) {
        return;
      }
      try {
        const savedChatId = localStorage.getItem("chatId");
        if (savedChatId) {
          setChatId(savedChatId);
          console.log("Loaded chatId from localStorage:", savedChatId);
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
            localStorage.setItem("chatId", existingChat.id);
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
              localStorage.setItem("chatId", newChatResponse.data.id);
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
            localStorage.setItem("chatId", newChatResponse.data.id);
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
        const savedSessionId = localStorage.getItem("sessionId");
        if (savedSessionId) {
          setSessionId(savedSessionId);
          console.log("Loaded sessionId from localStorage:", savedSessionId);
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
            localStorage.setItem("sessionId", newSessionId);
            console.log(
              "Created new sessionId and stored in localStorage:",
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
        setIsSessionInitializing(false);
      }
    }

    initializeSession();
  }, [chatId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isSessionInitializing) {
      alert("Chat session is still initializing. Please wait a moment.");
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
      } else {
        const errorMessage = {
          id: messages.length + 1,
          sender: "assistant",
          text: `Error: ${
            response.message || "Something went wrong. Please try again."
          }`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error conversing with chat assistant:", error);
      const errorMessage = {
        id: messages.length + 1,
        sender: "assistant",
        text: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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
      <Paper
        elevation={3}
        sx={{ p: 2, height: "80vh", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            mb: 2,
            p: 1,
            backgroundColor: "#f5f5f5",
            borderRadius: 1,
          }}
        >
          <List>
            {messages.map((msg) => (
              <ListItem key={msg.id} alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {msg.sender === "user" ? <PersonIcon /> : <ChatIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={msg.sender === "user" ? "You" : "Tutor"}
                  secondary={
                    <>
                      <Typography
                        sx={{ display: "inline" }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {msg.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        {msg.timestamp}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
            {loading && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <ChatIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Tutor"
                  secondary={<CircularProgress size={20} />}
                />
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>
        </Box>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading || isSessionInitializing}
            slotProps={{
              input: {
                endAdornment: (
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={loading || !input.trim() || isSessionInitializing}
                  >
                    <SendIcon />
                  </IconButton>
                ),
              },
            }}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
