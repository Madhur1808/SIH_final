const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");
const nodeMailer = require("nodemailer");
const MailComposer = require("mailcomposer").MailComposer;

const app = express();

app.use(express.urlencoded());

app.use(bodyParser.text());
app.set("view engine", "ejs");

app.use(cors());

app.post("/sendEmail", (req, res, next) => {
  const s = JSON.parse(req.body).sender;
  const r = JSON.parse(req.body).receiver;
  const content = JSON.parse(req.body).dataa;

  const transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: s,
      pass: "qzgwpasgmffvhigg",
    },
  });

  const mailOptions = {
    from: s,
    to: r,
    subject: "Your inv!",
    html: content,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
      res.status(404).send("NOT");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("OK");
    }
  });
});

let BODY = "DEFAULT BODY";
let fileName = "DEFAULT";

app.post("/save", (req, res, next) => {
  BODY = JSON.parse(req.body).data;
  fileName = JSON.parse(req.body).fileName;
  res.send(BODY);
});

app.get("/api/verify/redirect", (req, res, next) => {
  const access_token = req.query;
  const code_value = access_token.code;
  const tokenEndpoint = "https://api.dropboxapi.com/oauth2/token";
  const authorizationCode = code_value; // Replace with your actual authorization code
  const redirectUri = "http://localhost:4000/api/verify/redirect"; // Replace with your actual redirect URI
  const clientId = "m4of4ek7lvyylpo"; // Replace with your Dropbox app's client ID
  const clientSecret = "jx48vq6or2uzg9e"; // Replace with your Dropbox app's client secret

  const data = new URLSearchParams();
  data.append("code", authorizationCode);
  data.append("grant_type", "authorization_code");
  data.append("redirect_uri", redirectUri);
  data.append("client_id", clientId);
  data.append("client_secret", clientSecret);

  axios
    .post(tokenEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((response) => {
      console.log("Access Token:", response.data.access_token);
      const accessTokenValue = response.data.access_token;

      const filePath = "./Files/file.txt";

      // Write the data to the file
      fs.writeFile(filePath, accessTokenValue, (err) => {
        if (err) {
          console.error("Error writing to the file:", err);
        } else {
          console.log("Data has been written to the file:", filePath);
        }
      });

      const uploadUrl = "https://content.dropboxapi.com/2/files/upload";
      const accessToken = accessTokenValue; // Replace with your actual Dropbox access token

      const remotePath = `/folder/${fileName}.html`; // Replace with the desired remote path

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          autorename: false,
          mode: "add",
          mute: false,
          path: remotePath,
          strict_conflict: false,
        }),
        "Content-Type": "application/octet-stream",
      };

      axios
        .post(uploadUrl, BODY, { headers })
        .then((response) => {
          console.log("Upload Response:", response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  console.log(code_value);
  res.render("home");
});

app.post("/listfile", (req, res) => {
  const filePath = "./Files/file.txt";
  const requestData = {
    include_deleted: false,
    include_has_explicit_shared_members: false,
    include_media_info: false,

    path: "/folder",
  };

  fs.readFile(filePath, "utf8", (err, dataset) => {
    if (err) {
      console.error("Error reading the file:", err);
    } else {
      console.log("File contents:", dataset);
      accessToken = dataset;
      console.log("this is token genenenene", accessToken);

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };
      axios
        .post("https://api.dropboxapi.com/2/files/list_folder", requestData, {
          headers,
        })
        .then((response) => {
          console.log(response.data);
          return res.status(201).json(response.data);
        })
        .catch((error) => {
          console.error("this is error", error);
        });
    }
  });
});

app.listen(4000, () => {
  console.log("server started");
});
