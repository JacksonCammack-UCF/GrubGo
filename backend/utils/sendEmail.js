import dotenv from "dotenv";
import Mailjet from "node-mailjet";

dotenv.config(); 

const { MJ_APIKEY_PRIVATE, MJ_APIKEY_PUBLIC, MJ_SENDER_EMAIL } = process.env;

if (!MJ_APIKEY_PUBLIC || !MJ_APIKEY_PRIVATE || !MJ_SENDER_EMAIL) {
  throw new Error("Mailjet API keys or sender email are not set in environment variables.");
}

const mailjet = Mailjet.apiConnect(MJ_APIKEY_PUBLIC, MJ_APIKEY_PRIVATE);

export const sendEmail = async ({ to, subject, html }) => {
  if (!to || typeof to !== "string" || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(to)){
      throw new Error("Invalid email address");
  }
  try {
    const response = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: MJ_SENDER_EMAIL,
              Name: "GrubGo",
            },
            To: [{ Email: to }],
            Subject: subject,
            HTMLPart: html,
          },
        ],
      });

    return response;
  } catch (error) {
    console.error("Mailjet error:", error);
    throw new Error("Error sending email: " + error.message);
  }
};
