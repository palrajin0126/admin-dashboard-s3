"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryForm() {
  const [formData, setFormData] = useState({
    categoryName: '',
    images: [] as File[],
  });
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData({ ...formData, images: Array.from(files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const formDataObj = new FormData();
    formDataObj.append('categoryName', formData.categoryName);
    formData.images.forEach((image) => formDataObj.append('images', image));

    try {
      const response = await fetch('/api/category/create', {
        method: 'POST',
        body: formDataObj,
      });

      if (response.ok) {
        alert('Category created successfully');
        router.push('/');
      } else {
        alert('Error creating category');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Create Category</h1>
        <div className="mb-4">
          <label className="block text-gray-700">Category Name</label>
          <input
            type="text"
            name="categoryName"
            placeholder="Enter category name"
            value={formData.categoryName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Images</label>
          <input
            type="file"
            name="images"
            multiple
            onChange={handleImageChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white w-full p-2 rounded"
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Create Category'}
        </button>
      </form>
    </main>
  );
}
