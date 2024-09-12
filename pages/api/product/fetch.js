import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        include: {
          Category: true, // Assuming there's a relation to categories
        },
      });
      return res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
