import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Visibility, VisibilityOff, Delete, Add } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userApi } from "../api/apiClient";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [savedCards, setSavedCards] = useState([]);
  const [openAddCard, setOpenAddCard] = useState(false);
  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardNum, setNewCardNum] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCvv, setNewCardCvv] = useState("");
  const [addCardLoading, setAddCardLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const initialEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      const emailOrPhone = localStorage.getItem("userEmail") || userId;
      loadProfile(emailOrPhone);
      loadSavedCards();
    }
  }, [userId]);

  const loadProfile = (emailOrPhone) => {
    userApi
      .getByEmailOrPhone(emailOrPhone)
      .then((user) => {
        if (user) {
          setFirstName(user.firstName || "");
          setLastName(user.lastName || "");
          setEmail(user.email || "");
          setPhone(user.phoneNum || "");
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
      });
  };

  const handleUpdate = () => {
    if (!userId) return;

    setLoading(true);
    const emailChanged = email !== initialEmail;
    const updateData = {
      userId,
      firstName,
      lastName,
      email,
      phoneNum: phone,
    };
    userApi
      .update(userId, updateData)
      .then(() => {
        localStorage.setItem("userName", `${firstName} ${lastName}`);
        localStorage.setItem("userEmail", email);

        if (emailChanged) {
          // Email changed - token is invalid, need to re-login
          alert(
            "Email updated successfully! Please login again with your new email."
          );
          localStorage.removeItem("authToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("userEmail");
          localStorage.removeItem("userName");
          navigate("/login");
        } else {
          alert("Profile updated successfully!");
          // Trigger custom event to update other components
          window.dispatchEvent(new CustomEvent("userUpdate"));
        }
      })
      .catch((err) => {
        console.error("Failed to update profile:", err);
      })
      .finally(() => setLoading(false));
  };

  const handleChangePassword = () => {
    if (!userId || !oldPassword || !newPassword) return;

    setPasswordLoading(true);
    userApi
      .changePassword(userId, { oldPassword, newPassword })
      .then(() => {
        alert("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
      })
      .catch((err) => {
        console.error("Failed to change password:", err);
        alert(
          err.payload?.message ||
            "Failed to change password. Please check your old password."
        );
      })
      .finally(() => setPasswordLoading(false));
  };

  const loadSavedCards = () => {
    if (!userId) return;
    userApi
      .getCreditCards(userId)
      .then((cards) => {
        setSavedCards(cards || []);
      })
      .catch((err) => {
        console.error("Failed to load saved cards:", err);
      });
  };

  const handleCardNumChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 16) {
      setNewCardNum(value);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 3) {
      setNewCardCvv(value);
    }
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      if (value.length >= 2) {
        setNewCardExpiry(value.slice(0, 2) + "/" + value.slice(2));
      } else {
        setNewCardExpiry(value);
      }
    }
  };

  const handleAddCard = () => {
    if (
      !userId ||
      !newCardNum ||
      !newCardHolder ||
      !newCardExpiry ||
      !newCardCvv
    )
      return;

    setAddCardLoading(true);
    userApi
      .addCreditCard(userId, {
        cardNum: newCardNum,
        holderName: newCardHolder,
        expiryTime: newCardExpiry,
        cvv: newCardCvv,
      })
      .then(() => {
        alert("Card added successfully!");
        setOpenAddCard(false);
        setNewCardHolder("");
        setNewCardNum("");
        setNewCardExpiry("");
        setNewCardCvv("");
        loadSavedCards();
      })
      .catch((err) => {
        console.error("Failed to add card:", err);
        alert(err.payload?.message || "Failed to add card.");
      })
      .finally(() => setAddCardLoading(false));
  };

  const handleDeleteCard = (cardId) => {
    if (
      !userId ||
      !window.confirm("Are you sure you want to delete this card?")
    )
      return;

    userApi
      .deleteCreditCard(userId, cardId)
      .then(() => {
        alert("Card deleted successfully!");
        loadSavedCards();
      })
      .catch((err) => {
        console.error("Failed to delete card:", err);
        alert(err.payload?.message || "Failed to delete card.");
      });
  };

  return (
    <Box className="page-root" style={{ maxWidth: 640 }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      <Paper elevation={0} className="card">
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Personal information
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="First name"
            size="small"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            label="Last name"
            size="small"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            label="Email"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Phone"
            size="small"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button variant="contained" onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} className="card" sx={{ mt: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="subtitle1">Saved Cards</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => setOpenAddCard(true)}
          >
            Add Card
          </Button>
        </Box>
        {savedCards.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No saved cards yet.
          </Typography>
        ) : (
          <List>
            {savedCards.map((card) => (
              <ListItem
                key={card.cardId}
                divider
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteCard(card.cardId)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`**** **** **** ${card.cardNumLast4digit}`}
                  secondary={`${card.holderName}${
                    card.expiryTime ? ` • Exp: ${card.expiryTime}` : ""
                  }`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Paper elevation={0} className="card" sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Old Password"
            type={showOldPassword ? "text" : "password"}
            size="small"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            slotProps={{
              htmlInput: { maxLength: 8 },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            slotProps={{
              htmlInput: { maxLength: 8 },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !oldPassword ||
              !newPassword ||
              oldPassword.length !== 8 ||
              newPassword.length !== 8 ||
              passwordLoading
            }
          >
            {passwordLoading ? "Changing..." : "Change Password"}
          </Button>
        </Stack>
      </Paper>

      <Dialog
        open={openAddCard}
        onClose={() => setOpenAddCard(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Credit Card</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Card holder"
              fullWidth
              value={newCardHolder}
              onChange={(e) => setNewCardHolder(e.target.value)}
              required
            />
            <TextField
              label="Card number"
              fullWidth
              value={newCardNum}
              onChange={handleCardNumChange}
              slotProps={{ htmlInput: { maxLength: 16, inputMode: "numeric" } }}
              helperText="16 digits"
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Expiry (MM/YY)"
                fullWidth
                value={newCardExpiry}
                onChange={handleExpiryChange}
                placeholder="12/25"
                slotProps={{
                  htmlInput: { maxLength: 5, inputMode: "numeric" },
                }}
                required
              />
              <TextField
                label="CVV"
                fullWidth
                value={newCardCvv}
                onChange={handleCvvChange}
                slotProps={{
                  htmlInput: { maxLength: 3, inputMode: "numeric" },
                }}
                helperText="3 digits"
                required
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddCard(false)}>Cancel</Button>
          <Button
            onClick={handleAddCard}
            variant="contained"
            disabled={
              addCardLoading ||
              !newCardNum ||
              !newCardHolder ||
              !newCardExpiry ||
              !newCardCvv
            }
          >
            {addCardLoading ? "Adding..." : "Add Card"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
