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
      // Check if there are any products under this category
      const products = await prisma.product.findMany({
        where: { categoryId: parseInt(id) },
      });

      if (products.length > 0) {
        // Delete images from S3 associated with these products
        for (const product of products) {
          const deleteParams = product.images.map((imageUrl) => ({
            Key: imageUrl.split('.com/')[1], // Extract the file path from the full URL
            Bucket: process.env.S3_BUCKET_NAME,
          }));

          for (const param of deleteParams) {
            await s3.deleteObject(param).promise();
          }
        }

        // Delete the products under this category
        await prisma.product.deleteMany({
          where: { categoryId: parseInt(id) },
        });
      }

      // Delete category from database
      await prisma.category.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Category and associated products deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
