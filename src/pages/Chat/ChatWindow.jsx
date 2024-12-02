import {
    Box,
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
const ChatWindow = ({
    messages,
    messagesEndRef,
    loading,
    isSessionInitialising,
    spinnerError,
    input,
    setInput,
    handleKeyPress,
    handleSend
}) => {
    return (
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
                                secondary={
                                    <CircularProgress
                                        size={20}
                                        color={spinnerError ? "error" : "primary"}
                                    />
                                }
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
                    disabled={loading || isSessionInitialising}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <IconButton
                                    color="primary"
                                    onClick={handleSend}
                                    disabled={loading || !input.trim() || isSessionInitialising}
                                >
                                    <SendIcon />
                                </IconButton>
                            ),
                        },
                    }}
                />
            </Box>
        </Paper>
    )
}
export default ChatWindow;
