import axios from "axios";

export const sendSMS = async ({ to, message }) => {
  try {
    const response = await axios.get(
      process.env.ARKESEL_BASE_URL,
      {
        params: {
          action: "send-sms",
          api_key: process.env.ARKESEL_API_KEY,
          to, // must be international format
          from: process.env.ARKESEL_SENDER_ID, // your approved sender ID
          sms: message,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("[SMS ERROR]", error.response?.data || error.message);
    return null; // DO NOT crash order flow
  }
};
