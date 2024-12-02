import { Box, Typography, Container, FormControl, Divider } from "@mui/material";
import { useState } from "react";
import ModuleSelecter from "./ModuleSelector";

const Home = () => {
  const [module, setModule] = useState('');
  return (
    <Container
      id="container"
      maxWidth="sm"
    >
      <Box
        sx={{
          textAlign: "center",
          marginTop: "10rem",
          padding: "1rem",
        }}
      >
        <FormControl sx={{ gap: 1 }}>
          <Typography variant="h4" gutterBottom>
            Welcome
          </Typography>
          <Divider />
          <Typography variant="body1" gutterBottom>
            Please select the course you require help for:
          </Typography>
        </FormControl>
        <ModuleSelecter module={module} setModule={setModule} />
      </Box>
    </Container>
  );
}
export default Home;
