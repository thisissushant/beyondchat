// useUserMessages.js
import { useState, useEffect } from "react";
import axios from "axios";

const useUserMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://devapi.beyondchats.com/api/get_chat_messages?chat_id=${chatId}`
        );
        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          setMessages(response.data.data);
        } else {
          setError("Failed to fetch messages or invalid data format");
        }
      } catch (err) {
        setError("An error occurred while fetching messages");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  return { messages, loading, error };
};

export default useUserMessages;
