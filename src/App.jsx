import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Chat from "./pages/Chat/Chat";
import { AppBar, Toolbar, Typography } from "@mui/material";

const App = () => (
  <div>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div">
          Virtual Tutor
        </Typography>
      </Toolbar>
    </AppBar>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  </div>
);

export default App;
