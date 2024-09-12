'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: string;
  categoryName: string;
  images: string[];
}

interface Product {
  id: string;
  productName: string;
  categoryId: string;
  price: number;
  images: string[];
  description: string;
  manufacturingDate: string;
  expiryDate: string;
  listingDate: string;
  seller: string;
  stock: number;
  percentageOfDiscountOffered: number;
}

const AdminDashboard = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category/fetch');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error fetching categories.');
      }
    };

    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/product/fetch');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Error fetching products.');
      }
    };

    fetchCategories();
    fetchProducts();
  }, []);

  const handleDeleteCategory = async (id: string) => {
    try {
      await axios.delete(`/api/category/${id}`);
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Error deleting category.');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`/api/product/${id}`);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('Error deleting product.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Categories</h2>
        <div className="bg-white p-4 rounded shadow-md">
          <table className="min-w-full bg-white table-auto">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Images</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="py-2 px-4 border-b">{category.id}</td>
                  <td className="py-2 px-4 border-b">{category.categoryName}</td>
                  <td className="py-2 px-4 border-b">
                    {category.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={category.categoryName}
                        className="w-12 h-12 object-cover inline-block mr-2"
                      />
                    ))}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">Products</h2>
        <div className="bg-white p-4 rounded shadow-md">
          <table className="min-w-full bg-white table-auto">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Category ID</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Images</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border-b">{product.id}</td>
                  <td className="py-2 px-4 border-b">{product.productName}</td>
                  <td className="py-2 px-4 border-b">{product.categoryId}</td>
                  <td className="py-2 px-4 border-b">{product.price}</td>
                  <td className="py-2 px-4 border-b">
                    {product.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={product.productName}
                        className="w-12 h-12 object-cover inline-block mr-2"
                      />
                    ))}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
