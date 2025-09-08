'use client';

import { useState } from 'react';
import { useAdminCategories, useUpdateCategory } from '@/hooks/useApi';
import { useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/uiSlice';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Edit, Save, X, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';

export default function CategoryManagement() {
  const dispatch = useDispatch();
  const { data: categories, isLoading } = useAdminCategories();
  const updateCategoryMutation = useUpdateCategory();
  
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    rateNormal: 0,
    rateSpecial: 0,
  });

  const handleEditClick = (category: any) => {
    setEditingCategory(category.id);
    setEditForm({
      name: category.name,
      description: category.description,
      rateNormal: category.rateNormal,
      rateSpecial: category.rateSpecial,
    });
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditForm({
      name: '',
      description: '',
      rateNormal: 0,
      rateSpecial: 0,
    });
  };

  const handleEditSave = async () => {
    if (!editingCategory) return;

    try {
      await updateCategoryMutation.mutateAsync({
        id: editingCategory,
        data: editForm,
      });
      
      dispatch(addNotification({
        type: 'success',
        message: 'Category updated successfully',
      }));
      
      handleEditCancel();
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        message: error?.response?.data?.message || 'Failed to update category',
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name.includes('rate') ? parseFloat(value) || 0 : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Category Management</h2>
        <p className="text-sm text-gray-600">
          Manage parking categories and their rates. Changes affect all zones using these categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow p-6">
            {editingCategory === category.id ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <Input
                    label="Category Name"
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
                
                <div>
                  <Input
                    label="Description"
                    name="description"
                    value={editForm.description}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Normal Rate"
                    name="rateNormal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.rateNormal}
                    onChange={handleInputChange}
                    fullWidth
                  />
                  <Input
                    label="Special Rate"
                    name="rateSpecial"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.rateSpecial}
                    onChange={handleInputChange}
                    fullWidth
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleEditSave}
                    loading={updateCategoryMutation.isPending}
                    size="sm"
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleEditCancel}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <Button
                    onClick={() => handleEditClick(category)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                {/* Rate Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Normal Rate</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(category.rateNormal)}/hr
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">Special Rate</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(category.rateSpecial)}/hr
                    </span>
                  </div>
                </div>

                {/* Rate Difference */}
                {category.rateSpecial !== category.rateNormal && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                    <strong>Rate Difference:</strong> {formatCurrency(category.rateSpecial - category.rateNormal)}/hr
                    ({Math.round(((category.rateSpecial - category.rateNormal) / category.rateNormal) * 100)}% increase)
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {categories?.length === 0 && (
        <div className="text-center py-8">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
          <p className="mt-1 text-sm text-gray-500">
            There are no categories configured in the system.
          </p>
        </div>
      )}
    </div>
  );
}
