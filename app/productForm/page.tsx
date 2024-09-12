'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
interface Category {
  id: string;
  categoryName: string;
}

const ProductForm = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productData, setProductData] = useState({
    productName: '',
    categoryId: '',
    price: '',
    brand: '',
    seller: '',
    manufacturingDate: '',
    expiryDate: '',
    listingDate: '',
    discountedPrice: '',
    percentageOfDiscountOffered: '',
    quantity: '',
    images: [] as File[],
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/category/fetch');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Error fetching categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setProductData((prevData) => ({
        ...prevData,
        images: Array.from(files),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Data validation and formatting
    const validatedData = {
      ...productData,
      price: productData.price ? parseFloat(productData.price) : null,
      discountedPrice: productData.discountedPrice ? parseFloat(productData.discountedPrice) : null,
      percentageOfDiscountOffered: productData.percentageOfDiscountOffered
        ? parseFloat(productData.percentageOfDiscountOffered)
        : null,
      quantity: productData.quantity ? parseInt(productData.quantity) : null,
      manufacturingDate: productData.manufacturingDate ? new Date(productData.manufacturingDate) : null,
      expiryDate: productData.expiryDate ? new Date(productData.expiryDate) : null,
      listingDate: productData.listingDate ? new Date(productData.listingDate) : null,
    };

    const formData = new FormData();
    Object.keys(validatedData).forEach((key) => {
      if (key === 'images') {
        validatedData.images.forEach((image: File) => formData.append('images', image));
      } else {
        formData.append(key, (validatedData as any)[key]?.toString() || '');
      }
    });

    try {
      const response = await axios.post('/api/product/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Product created successfully!');
      setError(null);  // Clear error
      router.push('/');
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Error creating product.');
      setMessage(null);  // Clear message
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-500 mb-4">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Product Name</label>
          <input
            type="text"
            name="productName"
            value={productData.productName}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Category</label>
          <select
            name="categoryId"
            value={productData.categoryId}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Brand</label>
          <input
            type="text"
            name="brand"
            value={productData.brand}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Seller</label>
          <input
            type="text"
            name="seller"
            value={productData.seller}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Manufacturing Date</label>
          <input
            type="date"
            name="manufacturingDate"
            value={productData.manufacturingDate}
            onChange={handleInputChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Expiry Date</label>
          <input
            type="date"
            name="expiryDate"
            value={productData.expiryDate}
            onChange={handleInputChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Listing Date</label>
          <input
            type="date"
            name="listingDate"
            value={productData.listingDate}
            onChange={handleInputChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Discounted Price</label>
          <input
            type="number"
            name="discountedPrice"
            value={productData.discountedPrice}
            onChange={handleInputChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Percentage of Discount Offered</label>
          <input
            type="number"
            name="percentageOfDiscountOffered"
            value={productData.percentageOfDiscountOffered}
            onChange={handleInputChange}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={productData.quantity}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Images</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleFileChange}
            className="border p-2 w-full"
            required
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
