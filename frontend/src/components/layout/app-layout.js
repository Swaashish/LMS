import { useState, useEffect, forwardRef } from "react"
import { useNavigate } from "react-router-dom"
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Slide,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material"
import { Route, Routes, Navigate, Link } from "react-router-dom"
import AdbIcon from "@mui/icons-material/Adb"

import { useUser } from "../../context/user-context"
import { BooksList } from "../books-list/books-list"
import { LoginDialog } from "../login/login-dialog"
import { BookForm } from "../book-form/book-form"
import { Book } from "../book/book"
import { WithLoginProtector } from "../access-control/login-protector"
import { WithAdminProtector } from "../access-control/admin-protector"

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />
})

export const AppLayout = () => {
    const navigate = useNavigate()

    const { user, loginUser, logoutUser, isAdmin } = useUser()

    const [openLoginDialog, setOpenLoginDialog] = useState(false)
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false)
    const [anchorElUser, setAnchorElUser] = useState(null)

    const [regUsername, setRegUsername] = useState("")
    const [regPassword, setRegPassword] = useState("")
    const [regRole, setRegRole] = useState("user")

    /* ===========================
       USER MENU HANDLERS
    ============================ */

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget)
    }

    const handleCloseUserMenu = () => {
        setAnchorElUser(null)
    }

    const handleLogout = () => {
        logoutUser()
        handleCloseUserMenu()
    }

    /* ===========================
       LOGIN
    ============================ */

    const handleLoginSubmit = (username, password) => {
        loginUser(username, password)
        setOpenLoginDialog(false)
    }

    /* ===========================
       REGISTER
    ============================ */

    const handleRegisterSubmit = async () => {
        try {
            const response = await fetch("http://localhost:8080/v1/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: regUsername,
                    password: regPassword,
                    role: regRole,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                alert(data.message)
                return
            }

            alert("Account created successfully!")
            setOpenRegisterDialog(false)

            // optional: auto login after register
            loginUser(regUsername, regPassword)

        } catch (error) {
            console.error(error)
        }
    }

    /* ===========================
       NAVIGATION LOGIC
    ============================ */

    useEffect(() => {
        if (!user) {
            navigate("/")
        } else if (isAdmin) {
            navigate("/admin/books/add")
        }
    }, [user, isAdmin])

    /* ===========================
       RENDER
    ============================ */

    return (
        <>
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    backgroundColor: "#000",
                    borderBottom: "1px solid #222",
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ minHeight: 70 }}>
                        <AdbIcon sx={{ color: "#fff", mr: 1 }} />

                        <Link to="/" style={{ textDecoration: "none", flexGrow: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    letterSpacing: "0.15em",
                                    color: "#fff",
                                    textTransform: "uppercase",
                                }}
                            >
                                BOOKS MANAGEMENT SYSTEM
                            </Typography>
                        </Link>

                        {/* RIGHT SIDE */}
                        <Box>
                            {user ? (
                                <>
                                    <Tooltip title={user.username || "Account"}>
                                        <IconButton onClick={handleOpenUserMenu}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: "#fff",
                                                    color: "#000",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {user?.username?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>

                                    <Menu
                                        anchorEl={anchorElUser}
                                        open={Boolean(anchorElUser)}
                                        onClose={handleCloseUserMenu}
                                        PaperProps={{
                                            sx: {
                                                bgcolor: "#111",
                                                color: "#fff",
                                                border: "1px solid #222",
                                            },
                                        }}
                                    >
                                        <MenuItem onClick={handleCloseUserMenu}>
                                            {user.username}
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            ) : (
                                <Box sx={{ display: "flex", gap: 2 }}>
                                    <Button
                                        onClick={() => setOpenLoginDialog(true)}
                                        sx={{
                                            color: "#fff",
                                            border: "1px solid #fff",
                                            px: 3,
                                            "&:hover": {
                                                backgroundColor: "#fff",
                                                color: "#000",
                                            },
                                        }}
                                    >
                                        Login
                                    </Button>

                                    <Button
                                        onClick={() => setOpenRegisterDialog(true)}
                                        sx={{
                                            backgroundColor: "#fff",
                                            color: "#000",
                                            px: 3,
                                            "&:hover": {
                                                backgroundColor: "#ddd",
                                            },
                                        }}
                                    >
                                        Register
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* ROUTES */}
            <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh", pt: 4 }}>
                <Routes>
                    <Route path="/books" element={<BooksList />} />
                    <Route
                        path="/books/:bookIsbn"
                        element={
                            <WithLoginProtector>
                                <Book />
                            </WithLoginProtector>
                        }
                    />
                    <Route
                        path="/admin/books/add"
                        element={
                            <WithLoginProtector>
                                <WithAdminProtector>
                                    <BookForm />
                                </WithAdminProtector>
                            </WithLoginProtector>
                        }
                    />
                    <Route
                        path="/admin/books/:bookIsbn/edit"
                        element={
                            <WithLoginProtector>
                                <WithAdminProtector>
                                    <BookForm />
                                </WithAdminProtector>
                            </WithLoginProtector>
                        }
                    />
                    <Route path="*" element={<Navigate to="/books" replace />} />
                </Routes>
            </Box>

            {/* LOGIN DIALOG */}
            <LoginDialog
                open={openLoginDialog}
                handleSubmit={handleLoginSubmit}
                handleClose={() => setOpenLoginDialog(false)}
            />

            {/* REGISTER DIALOG */}
            <Dialog
                open={openRegisterDialog}
                TransitionComponent={Transition}
                onClose={() => setOpenRegisterDialog(false)}
                PaperProps={{
                    sx: {
                        bgcolor: "#f8f3f3",
                        color: "#131212",
                        borderRadius: 2,
                        px: 4,
                    },
                }}
            >
                <DialogTitle>Register</DialogTitle>

                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    <FormControl fullWidth>
                        <InputLabel sx={{ color: "#080808" }}>Role</InputLabel>
                        <Select
                            native
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                            sx={{ color: "#0e0d0d" }}
                        >
                            <option value="guest">guest</option>
                            <option value="admin">Admin</option>
                        </Select>
                    </FormControl>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpenRegisterDialog(false)}
                        sx={{ color: "#0a0a0a" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRegisterSubmit}
                        sx={{
                            backgroundColor: "#fff",
                            color: "#080808",
                            "&:hover": { backgroundColor: "#ddd" },
                        }}
                    >
                        Create Account
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}
