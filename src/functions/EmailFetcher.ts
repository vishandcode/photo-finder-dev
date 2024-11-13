import Imap from "imap";
import { simpleParser } from "mailparser";

const imapConfig = {
  user: process.env.SMTP_EMAIL,
  password: process.env.SMTP_PASSWORD,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false, // Accept self-signed certificates
  },
};

export const fetchLatestEmail = () => {
  return new Promise((resolve, reject) => {
    const imap = new Imap(imapConfig);

    imap.once("ready", () => {
      imap.openBox("INBOX", false, (err, box) => {
        if (err) {
          console.error("Error opening inbox:", err);
          return reject(err);
        }

        imap.search(["UNSEEN"], (err, results) => {
          if (err) {
            console.error("Error searching emails:", err);
            return reject(err);
          }
            
          if (results.length > 0) {
            const latestEmailId = results[results.length - 1]; // Get the latest email ID

            imap.fetch(latestEmailId, { bodies: "" }).on("message", (msg) => {
              msg.on("body", (stream) => {
                simpleParser(stream, (err, email) => {
                  if (err) {
                    console.error("Error parsing email:", err);
                    return reject(err);
                  }
                  resolve({
                    subject: email.subject,
                    from: email.from.text,
                    date: email.date,
                    text: email.text,
                  });
                });
              });
            });
          } else {
            console.log("No new emails found.");
            resolve(null); // No new emails found
          }
        });
      });
    });

    imap.once("error", (err) => {
      console.error("IMAP error:", err);
      reject(err);
    });
    imap.once("end", () => console.log("Connection ended"));
    imap.connect();
  });
};
