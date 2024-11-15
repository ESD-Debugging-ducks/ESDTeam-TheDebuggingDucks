import { Box, Typography, TextField, Button } from "@mui/material";

const Chat = () => (
  <Box
    sx={{
      maxWidth: "600px",
      margin: "2rem auto",
      textAlign: "center",
      padding: "1rem",
    }}
  >
    <Typography variant="h4" gutterBottom>
      Chat
    </Typography>
    <Typography variant="body1" gutterBottom>
      Type your questions below to get started!
    </Typography>
    <TextField
      fullWidth
      variant="outlined"
      label="Type your message"
      sx={{ marginBottom: "1rem" }}
    />
    <Button variant="contained" color="primary">
      Send Message
    </Button>
  </Box>
);

export default Chat;
