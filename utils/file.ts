"use server"

import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://f5a2aee7664d9a450c48e8c6218f15a9.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY ?? "",
    },
});

export const uploadFileToR2 = async (
    file: File,
) => {
    const productFile = await file.arrayBuffer();
    const productFileBuffer = Buffer.from(productFile);

    console.log("Uploading file to R2...", file.type);
    console.log(file, "just file")
    const key = `${uuidv4()}-${file.name}`;

    const params = {
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: key,
        Body: productFileBuffer,
        ContentType: file.type,
        ACL: "public-read" as const,
    };
    try {
        const response = await s3Client.send(new PutObjectCommand(params));
        console.log("File uploaded successfully:", response);
        const url = `https://pub-c09dd5628d6f44dfb783aa3657780ed1.r2.dev/${key}`;
        return url
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};