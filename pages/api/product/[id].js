import { PrismaClient } from '@prisma/client';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

// Set up S3
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    try {
      // Fetch the product and its images
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Delete images from S3
      const deleteParams = product.images.map((imageUrl) => ({
        Key: imageUrl.split('.com/')[1], // Extract the file path from the full URL
        Bucket: process.env.S3_BUCKET_NAME,
      }));

      for (const param of deleteParams) {
        await s3.deleteObject(param).promise();
      }

      // Delete product from database
      await prisma.product.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
