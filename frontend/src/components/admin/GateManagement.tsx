'use client';

import { useState } from 'react';
import { useAdminGates, useCreateGate, useUpdateGate, useDeleteGate } from '@/hooks/useApi';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Settings,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface Gate {
  id: string;
  name: string;
  location: string;
  zoneIds: string[];
}

interface GateFormData {
  name: string;
  location: string;
  zoneIds: string[];
}

export default function GateManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);
  const [formData, setFormData] = useState<GateFormData>({
    name: '',
    location: '',
    zoneIds: []
  });
  const [formError, setFormError] = useState('');

  // API hooks
  const { data: gates, isLoading, refetch } = useAdminGates();
  const { mutate: createGate, isPending: isCreating } = useCreateGate();
  const { mutate: updateGate, isPending: isUpdating } = useUpdateGate();
  const { mutate: deleteGate, isPending: isDeleting } = useDeleteGate();

  const handleCreateGate = () => {
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Gate name is required');
      return;
    }

    if (!formData.location.trim()) {
      setFormError('Location is required');
      return;
    }

    createGate(
      {
        name: formData.name.trim(),
        location: formData.location.trim(),
        zoneIds: formData.zoneIds
      },
      {
        onSuccess: () => {
          setShowCreateModal(false);
          resetForm();
          refetch();
        },
        onError: (error: any) => {
          setFormError(error.response?.data?.message || 'Failed to create gate');
        }
      }
    );
  };

  const handleUpdateGate = () => {
    if (!editingGate) return;

    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Gate name is required');
      return;
    }

    if (!formData.location.trim()) {
      setFormError('Location is required');
      return;
    }

    updateGate(
      {
        id: editingGate.id,
        data: {
          name: formData.name.trim(),
          location: formData.location.trim(),
          zoneIds: formData.zoneIds
        }
      },
      {
        onSuccess: () => {
          setEditingGate(null);
          resetForm();
          refetch();
        },
        onError: (error: any) => {
          setFormError(error.response?.data?.message || 'Failed to update gate');
        }
      }
    );
  };

  const handleDeleteGate = (gateId: string) => {
    if (window.confirm('Are you sure you want to delete this gate?')) {
      deleteGate(gateId, {
        onSuccess: () => {
          refetch();
        },
        onError: (error: any) => {
          alert(error.response?.data?.message || 'Failed to delete gate');
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      zoneIds: []
    });
    setFormError('');
  };

  const openEditModal = (gate: Gate) => {
    setEditingGate(gate);
    setFormData({
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zoneIds || []
    });
    setFormError('');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingGate(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gate Management</h2>
          <p className="text-gray-600 mt-1">
            Manage parking gates and their zone assignments
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Gate
        </Button>
      </div>

      {/* Gates Grid */}
      {gates && gates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gates.map((gate) => (
            <div key={gate.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{gate.name}</h3>
                    <p className="text-sm text-gray-500">ID: {gate.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(gate)}
                    className="text-blue-600 hover:text-blue-900"
                    disabled={isUpdating}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGate(gate.id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{gate.location}</span>
              </div>

              {/* Zone Information */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Connected Zones:</span>
                  <span className="font-medium text-gray-900">
                    {gate.zoneIds ? gate.zoneIds.length : 0}
                  </span>
                </div>
                
                {gate.zoneIds && gate.zoneIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {gate.zoneIds.slice(0, 3).map((zoneId) => (
                      <span
                        key={zoneId}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {zoneId}
                      </span>
                    ))}
                    {gate.zoneIds.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{gate.zoneIds.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Car className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No gates found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new parking gate.
          </p>
        </div>
      )}

      {/* Create/Edit Gate Modal */}
      <Modal
        isOpen={showCreateModal || !!editingGate}
        onClose={closeModal}
        title={editingGate ? 'Edit Gate' : 'Create New Gate'}
      >
        <div className="space-y-4">
          <Input
            label="Gate Name"
            placeholder="Enter gate name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={isCreating || isUpdating}
            required
          />

          <Input
            label="Location"
            placeholder="Enter gate location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            disabled={isCreating || isUpdating}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zone IDs (comma-separated)
            </label>
            <Input
              placeholder="zone_a, zone_b, zone_c"
              value={formData.zoneIds.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                zoneIds: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
              }))}
              disabled={isCreating || isUpdating}
              helperText="Enter zone IDs separated by commas"
            />
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-600">{formError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={closeModal}
              disabled={isCreating || isUpdating}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={editingGate ? handleUpdateGate : handleCreateGate}
              disabled={isCreating || isUpdating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {(isCreating || isUpdating) ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {editingGate ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                editingGate ? 'Update Gate' : 'Create Gate'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
