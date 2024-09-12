import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import formidable from 'formidable';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables

const prisma = new PrismaClient();

// Explicitly configure the AWS SDK with credentials and region
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.S3_ACCESS_KEY_ID,  // Load from environment
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,  // Load from environment
  region: process.env.S3_REGION,  // Load from environment
});

// Disable body parsing to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req = NextApiRequest, res = NextApiResponse) => {
  if (req.method === 'POST') {
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      console.error("S3_BUCKET_NAME environment variable is not defined");
      return res.status(500).json({ message: "Internal server error: S3 bucket is not configured." });
    }

    const form = formidable({
      multiples: true,  // Allow multiple file uploads
      keepExtensions: true,  // Keep file extensions
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: 'Error parsing form' });
      }

      let { categoryName } = fields;
      const images = files.images;

      // Ensure categoryName is a string, not an array
      if (Array.isArray(categoryName)) {
        categoryName = categoryName[0];
      }

      try {
        if (!images || images.length === 0) {
          return res.status(400).json({ message: 'At least one image is required.' });
        }

        const imageUrls = [];
        const imageArray = Array.isArray(images) ? images : [images];  // Ensure images are treated as an array
        for (const image of imageArray) {
          const fileContent = fs.readFileSync(image.filepath);

          const s3Params = {
            Bucket: bucketName,  // Use bucket name from environment
            Key: `categories/${Date.now()}-${image.originalFilename}`,  // Unique key for each image
            Body: fileContent,
            ContentType: image.mimetype,
          };

          console.log("Uploading with S3 Params:", s3Params);

          const uploadedImage = await s3.upload(s3Params).promise();
          imageUrls.push(uploadedImage.Location);
        }

        const category = await prisma.category.create({
          data: {
            categoryName,  // Now passing the categoryName as a string
            images: imageUrls,
          },
        });

        res.status(201).json(category);
      } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
