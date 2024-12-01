import { Typography, Button, FormControl, Select, MenuItem } from "@mui/material";
import { Link, createSearchParams } from "react-router-dom";

const ModuleSelecter = ({
    module,
    setModule
}) => {
    return (
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
    )
}
export default ModuleSelecter;
