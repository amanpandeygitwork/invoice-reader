const fs = require("fs");

const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const { getImageURL } = require("./mediaUtils.js");

require("dotenv").config();

async function processInvoice(mediaId) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt =
    "This is image of an invoice. Return a JSON with 'receiptDate' field for invoice date, 'receiptID' for invoice number, 'vendorName' for dealer name from invoice, 'to' for the name of the person invoice is generated for. Only include the JSON and no other text in the response";

  const imageUrl = await getImageURL(mediaId);
  const responseURL = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    },
  });
  const image = {
    inlineData: {
      data: Buffer.from(responseURL.data).toString("base64"),
      mimeType: "image/jpg",
    },
  };
  const result = await model.generateContent([prompt, image]);
  let jsonText = result.response.text();

  jsonText = jsonText.replace("```json", "").replace("```", "");
  let obj = JSON.parse(jsonText);
  return obj;
}
