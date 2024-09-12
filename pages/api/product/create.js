import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Set up S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for multipart form-data
  },
};

const uploadToS3 = async (file) => {
  const fileContent = fs.readFileSync(file.filepath);
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `products/${Date.now()}_${path.basename(file.originalFilename)}`,
    Body: fileContent,
    ContentType: file.mimetype,
  };

  const uploadResult = await s3.upload(params).promise();
  return uploadResult.Location;
};

export default async function handler(req = NextApiRequest, res = NextApiResponse) {
  if (req.method === 'POST') {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the form' });
      }

      try {
        // Destructure and ensure fields like productName, brand, and seller are treated as strings
        let {
          productName,
          price,
          categoryId,
          brand,
          seller,
          manufacturingDate,
          expiryDate,
          listingDate,
          discountedPrice,
          percentageOfDiscountOffered,
          quantity,
        } = fields;

        // In case fields are arrays (due to form parsing), convert them to strings
        productName = Array.isArray(productName) ? productName[0] : productName;
        brand = Array.isArray(brand) ? brand[0] : brand;
        seller = Array.isArray(seller) ? seller[0] : seller;

        // Handle images
        const imageFiles = Array.isArray(files.images) ? files.images : [files.images];
        const imageUrls = await Promise.all(imageFiles.map(uploadToS3));

        // Create the product in the database
        const product = await prisma.product.create({
          data: {
            productName,
            price: parseFloat(price),
            categoryId: parseInt(categoryId),
            brand,
            seller,
            manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            listingDate: listingDate ? new Date(listingDate) : null,
            discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
            percentageOfDiscountOffered: percentageOfDiscountOffered ? parseFloat(percentageOfDiscountOffered) : null,
            quantity: parseInt(quantity),
            images: imageUrls, // Array of image URLs from S3
          },
        });

        return res.status(201).json(product);
      } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
