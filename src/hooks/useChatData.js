// useChatData.js
import { useState, useEffect } from "react";
import axios from "axios";

const useChatData = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(
          "https://devapi.beyondchats.com/api/get_all_chats?page=1"
        );
        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data.data)
        ) {
          setChats(response.data.data.data);
        } else {
          setError("Failed to fetch chats or invalid data format");
        }
      } catch (err) {
        setError("An error occurred while fetching chats");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return { chats, loading, error };
};

export default useChatData;
