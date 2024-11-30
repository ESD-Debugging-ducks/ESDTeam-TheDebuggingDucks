import { Box, Typography, Container, Button, FormControl, Select, MenuItem, Divider } from "@mui/material";
import { useState } from "react";
import { Link, createSearchParams } from "react-router-dom";

const Welcome = () => {
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
        <FormControl sx={{ textAlign: "left", display: "flex", flexFlow: "row-wrap", gap: 2 }}>
          <Typography>Module</Typography>
          <Select
            value={module}
            onChange={(e) => setModule(e.target.value)}
          >
            <MenuItem value={"CO650WBL-Advanced-Programming"}>Advanced-Programming</MenuItem>
          </Select>
          {module !== '' && (
            <div style={{ alignSelf: "center" }}>
              <Button variant="contained" color="secondary" component={Link} to={{
                pathname: "/chat",
                search: `?${createSearchParams({
                  module: module
                })}`
              }}>
                Continue
              </Button>
            </div>
          )}
        </FormControl>

      </Box>
    </Container>
  );
}
export default Welcome;
