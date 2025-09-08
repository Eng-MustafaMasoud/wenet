'use client';

import { Zone } from '@/types/api';
import { formatCurrency, getCurrentRate, isSpecialRateActive } from '@/utils/helpers';
import { classNames } from '@/utils/helpers';
import { Clock, Users, Car, Lock, Unlock } from 'lucide-react';

interface ZoneCardProps {
  zone: Zone;
  isSelected: boolean;
  onSelect: (zone: Zone) => void;
  disabled?: boolean;
  checkinType: 'visitor' | 'subscriber';
}

export default function ZoneCard({ 
  zone, 
  isSelected, 
  onSelect, 
  disabled = false,
  checkinType 
}: ZoneCardProps) {
  const isSpecialRate = isSpecialRateActive(zone);
  const currentRate = getCurrentRate(zone);
  const isAvailable = checkinType === 'visitor' 
    ? zone.availableForVisitors > 0 && zone.open
    : zone.availableForSubscribers > 0 && zone.open;

  const handleClick = () => {
    if (!disabled && isAvailable) {
      onSelect(zone);
    }
  };

  return (
    <div
      className={classNames(
        'border rounded-lg p-4 cursor-pointer transition-all duration-200',
        isSelected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300',
        disabled || !isAvailable
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:shadow-md',
        !zone.open && 'border-red-200 bg-red-50'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{zone.name}</h3>
          <p className="text-sm text-gray-600">Category: {zone.categoryId}</p>
        </div>
        
        <div className="flex items-center space-x-1">
          {zone.open ? (
            <Unlock className="w-4 h-4 text-green-600" />
          ) : (
            <Lock className="w-4 h-4 text-red-600" />
          )}
          <span className={classNames(
            'text-xs font-medium',
            zone.open ? 'text-green-600' : 'text-red-600'
          )}>
            {zone.open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Availability Stats */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">{zone.occupied}</div>
            <div className="text-xs text-gray-500">Occupied</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Car className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium text-gray-900">{zone.free}</div>
            <div className="text-xs text-gray-500">Free</div>
          </div>
        </div>
      </div>

      {/* Availability for current type */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Available for {checkinType === 'visitor' ? 'Visitors' : 'Subscribers'}:
          </span>
          <span className={classNames(
            'text-sm font-semibold',
            checkinType === 'visitor' 
              ? (zone.availableForVisitors > 0 ? 'text-green-600' : 'text-red-600')
              : (zone.availableForSubscribers > 0 ? 'text-green-600' : 'text-red-600')
          )}>
            {checkinType === 'visitor' ? zone.availableForVisitors : zone.availableForSubscribers}
          </span>
        </div>
        
        {zone.reserved > 0 && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Reserved:</span>
            <span className="text-xs text-orange-600">{zone.reserved}</span>
          </div>
        )}
      </div>

      {/* Rate Information */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Rate:</span>
          </div>
          <div className="text-right">
            <div className={classNames(
              'text-lg font-bold',
              isSpecialRate ? 'text-red-600' : 'text-gray-900'
            )}>
              {formatCurrency(currentRate)}/hr
            </div>
            {isSpecialRate && (
              <div className="text-xs text-red-600 font-medium">Special Rate</div>
            )}
            {!isSpecialRate && zone.rateSpecial !== zone.rateNormal && (
              <div className="text-xs text-gray-500">
                Normal: {formatCurrency(zone.rateNormal)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {!zone.open && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
          Zone is currently closed
        </div>
      )}
      
      {zone.open && checkinType === 'visitor' && zone.availableForVisitors <= 0 && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-700">
          No spaces available for visitors
        </div>
      )}
      
      {zone.open && checkinType === 'subscriber' && zone.availableForSubscribers <= 0 && (
        <div className="mt-3 p-2 bg-yellow-100 border border-yellow-200 rounded text-sm text-yellow-700">
          No spaces available for subscribers
        </div>
      )}
    </div>
  );
}
