import { useState, forwardRef } from "react"
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Box,
    Typography,
    InputAdornment,
} from "@mui/material"
import PersonIcon from "@mui/icons-material/Person"
import LockIcon from "@mui/icons-material/Lock"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const LoginDialog = ({ open, handleClose, handleSubmit }) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const onSubmit = (event) => {
        event.preventDefault()
        handleSubmit(username, password)
    }

    const handleEnterKeyDown = (event) => {
        if (event.key === "Enter") {
            onSubmit(event)
        }
    }

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            onKeyDown={handleEnterKeyDown}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    px: 2,
                    py: 1,
                    background: "linear-gradient(145deg, #f5f7fa, #ffffff)",
                },
            }}
        >
            <DialogTitle>
                <Typography variant="h5" fontWeight="bold" textAlign="center">
                    Welcome Back 👋
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                >
                    Please login to continue
                </Typography>
            </DialogTitle>

            <DialogContent>
                <Box mt={1}>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="username"
                        label="Username"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="dense"
                        id="password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    variant="text"
                    onClick={handleClose}
                    sx={{
                        textTransform: "none",
                        fontWeight: 500,
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    type="submit"
                    onClick={onSubmit}
                    sx={{
                        textTransform: "none",
                        fontWeight: "bold",
                        borderRadius: 3,
                        px: 3,
                        background:
                            "linear-gradient(90deg, #667eea, #764ba2)",
                        boxShadow: "0 4px 12px rgba(102,126,234,0.4)",
                        "&:hover": {
                            background:
                                "linear-gradient(90deg, #5a67d8, #6b46c1)",
                        },
                    }}
                >
                    Login
                </Button>
            </DialogActions>
        </Dialog>
    )
}
