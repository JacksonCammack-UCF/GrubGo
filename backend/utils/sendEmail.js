import dotenv from "dotenv";
dotenv.config(); 

import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: process.env.MJ_SENDER_EMAIL,
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
    console.error(error);
    throw new Error("Error sending email: " + error.message);
  }
};
