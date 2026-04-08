import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ACCOUNT_ID) console.warn("R2_ACCOUNT_ID is missing");
if (!process.env.R2_ACCESS_KEY_ID) console.warn("R2_ACCESS_KEY_ID is missing");
if (!process.env.R2_SECRET_ACCESS_KEY) console.warn("R2_SECRET_ACCESS_KEY is missing");

export const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : "https://localhost",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "dummy",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "dummy",
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || "crm";
export const PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
