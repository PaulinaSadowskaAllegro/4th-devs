import { resolveModelForProvider } from "../../config.js";

const IMAGE_RECOGNITION_INSTRUCTIONS = `You are an autonomous text recognition agent. 
  Your task is to analyze images and transcribe any text you find in them. 
  You will be given images in base64 format along with their MIME type. 
  For each image, provide a transcription of the text it contains. 
  If an image does not contain any text, respond with "No text found". 
  Always provide your answer in JSON format`

export const api = {
   model: resolveModelForProvider("gpt-5.2"),
   visionModel: resolveModelForProvider("gpt-5.2"),
   maxOutputTokens: 16384,
   instructions: IMAGE_RECOGNITION_INSTRUCTIONS
};

export const imagesFolder = "images";

