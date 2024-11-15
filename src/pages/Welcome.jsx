import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const Welcome = () => (
  <Box
    sx={{
      textAlign: "center",
      marginTop: "2rem",
      padding: "1rem",
    }}
  >
    <Typography variant="h4" gutterBottom>
      Welcome to Virtual Tutor
    </Typography>
    <Typography variant="body1" gutterBottom>
      Your personal learning assistant
    </Typography>
    <Button variant="contained" color="primary" component={Link} to="/chat">
      Start Chatting
    </Button>
  </Box>
);

export default Welcome;
