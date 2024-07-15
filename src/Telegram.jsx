import React, { useState, useRef, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  IconButton,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Paper,
  Grid,
  Divider,
  Stack,
  Badge,
  TextField,
  InputAdornment,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PersonIcon from "@mui/icons-material/Person";
import ChatIcon from "@mui/icons-material/Chat";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import Sidebar from "./components/Sidebar.jsx";
import useChatData from "./hooks/useChatData.js";
import useUserMessages from "./hooks/useUserMessages.js";
import { format, isSameDay, parseISO } from "date-fns";

const getAvatarGradient = (name) => {
  const gradients = [
    "linear-gradient(45deg, #FF6B6B, #4ECDC4)",
    "linear-gradient(45deg, #556270, #FF6B6B)",
    "linear-gradient(45deg, #5691c8, #457fca)",
    "linear-gradient(45deg, #904e95, #e96443)",
    "linear-gradient(45deg, #2c3e50, #4ca1af)",
    "linear-gradient(45deg, #00c6ff, #0072ff)",
    "linear-gradient(45deg, #f857a6, #ff5858)",
    "linear-gradient(45deg, #4b6cb7, #182848)",
    "linear-gradient(45deg, #fc00ff, #00dbde)",
    "linear-gradient(45deg, #11998e, #38ef7d)",
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

function TelegramClone() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [stickyDate, setStickyDate] = useState("");
  const [message, setMessage] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { chats, loading: chatsLoading, error: chatsError } = useChatData();
  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
  } = useUserMessages(selectedChat?.id);
  const messageListRef = useRef(null);
  const dateRefs = useRef({});

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    if (!messageListRef.current) return;

    const scrollPosition = messageListRef.current.scrollTop;
    let currentStickyDate = "";

    Object.entries(dateRefs.current).forEach(([date, ref]) => {
      if (ref && ref.offsetTop <= scrollPosition) {
        currentStickyDate = date;
      }
    });

    setStickyDate(currentStickyDate);
  };

  useEffect(() => {
    const messageList = messageListRef.current;
    if (messageList) {
      messageList.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (messageList) {
        messageList.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSendMessage = () => {
    // Implement send message logic here
    console.log("Sending message:", message);
    setMessage("");
  };

  const renderChatList = () => {
    if (chatsLoading) return <CircularProgress />;
    if (chatsError) return <Typography color="error">{chatsError}</Typography>;

    return (
      <List sx={{ width: "100%", bgcolor: "background.paper" }}>
        {chats.map((chat, index) => (
          <React.Fragment key={chat.id}>
            <ListItem
              alignItems="flex-start"
              button
              onClick={() => {
                setSelectedChat(chat);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={chat.unread_count || 0}
                  color="primary"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <Avatar
                    sx={{
                      background: getAvatarGradient(
                        chat.creator?.name || "Unknown"
                      ),
                      color: "common.white",
                    }}
                  >
                    {chat.creator?.name?.charAt(0).toUpperCase() || "?"}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={chat.creator?.name || "Unknown User"}
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: "inline" }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {chat.unread_count > 0
                        ? chat.last_message || "No messages yet"
                        : "Tap to view"}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < chats.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderMessageWindow = () => {
    if (!selectedChat)
      return <Typography>Select a chat to view messages</Typography>;
    if (messagesLoading) return <CircularProgress />;
    if (messagesError)
      return <Typography color="error">{messagesError}</Typography>;

    let currentDate = null;

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <AppBar position="static">
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setSelectedChat(null)}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Avatar
              sx={{
                mr: 2,
                background: getAvatarGradient(
                  selectedChat.creator?.name || "Unknown"
                ),
                color: "common.white",
              }}
            >
              {selectedChat.creator?.name?.charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Typography variant="h6">
              {selectedChat.creator?.name || "Unknown User"}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box
          ref={messageListRef}
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            p: 2,
            position: "relative",
          }}
        >
          {stickyDate && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 5,
                textAlign: "center",
                py: 1,
              }}
            >
              {stickyDate}
            </Typography>
          )}
          {messages.map((message, index) => {
            const messageDate = parseISO(message.created_at);
            const formattedDate = format(messageDate, "MMMM d, yyyy");
            const showDateDivider =
              !currentDate || !isSameDay(currentDate, messageDate);
            if (showDateDivider) {
              currentDate = messageDate;
            }
            return (
              <React.Fragment key={message.id}>
                {showDateDivider && (
                  <Typography
                    ref={(el) => (dateRefs.current[formattedDate] = el)}
                    variant="body2"
                    color="textSecondary"
                    sx={{ textAlign: "center", my: 2 }}
                  >
                    {formattedDate}
                  </Typography>
                )}
                <Stack
                  direction="row"
                  justifyContent={
                    message.sender_id === 1 ? "flex-start" : "flex-end"
                  }
                  sx={{ mb: 2 }}
                >
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      maxWidth: "70%",
                      backgroundColor:
                        message.sender_id === 1
                          ? "primary.light"
                          : "secondary.light",
                      borderRadius: "20px",
                      borderTopLeftRadius: message.sender_id === 1 ? 0 : "20px",
                      borderTopRightRadius:
                        message.sender_id === 1 ? "20px" : 0,
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mb: 1 }}
                    >
                      {message.sender_id === 1
                        ? selectedChat.creator?.name
                        : "You"}
                    </Typography>
                    <Typography variant="body1">{message.message}</Typography>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 1, display: "block", textAlign: "right" }}
                    >
                      {format(messageDate, "HH:mm")}
                    </Typography>
                  </Paper>
                </Stack>
              </React.Fragment>
            );
          })}
        </Box>
        <Box sx={{ p: 2, backgroundColor: "background.paper" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSendMessage} edge="end">
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Telegram
          </Typography>
        </Toolbar>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ bgcolor: "background.paper" }}
        >
          <Tab
            label={isMobile ? "" : "All"}
            icon={<ChatIcon />}
            iconPosition="start"
          />
          <Tab
            label={isMobile ? "" : "Regulars"}
            icon={<GroupIcon />}
            iconPosition="start"
          />
          <Tab
            label={isMobile ? "" : "Unread"}
            icon={<ChatIcon />}
            iconPosition="start"
          />
          <Tab
            label={isMobile ? "" : "Personal"}
            icon={<PersonIcon />}
            iconPosition="start"
          />
        </Tabs>
      </AppBar>

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${240}px)` },
          mt: { xs: "104px", sm: "112px" },
        }}
      >
        <Grid container sx={{ height: "calc(100vh - 120px)" }}>
          <Grid
            item
            xs={12}
            sx={{
              display: selectedChat ? "none" : "block",
              height: "100%",
              overflowY: "auto",
            }}
          >
            {renderChatList()}
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              display: selectedChat ? "block" : "none",
              height: "100%",
            }}
          >
            {renderMessageWindow()}
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default TelegramClone;
