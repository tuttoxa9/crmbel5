import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "crm/"; // Ensure base folder is crm/

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/", // This makes it return folders in CommonPrefixes
    });

    const response = await s3Client.send(command);

    const folders = (response.CommonPrefixes || []).map((p) => p.Prefix).filter(Boolean);
    const files = (response.Contents || []).filter(f => f.Key !== prefix); // Exclude the folder itself

    return NextResponse.json({ folders, files });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 });
  }
}
