import * as yup from 'yup';

// Auth validation
export const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

// Category validation
export const categorySchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  description: yup.string().required('Description is required'),
  rateNormal: yup.number().required('Normal rate is required').min(0, 'Rate must be positive'),
  rateSpecial: yup.number().required('Special rate is required').min(0, 'Rate must be positive'),
});

// Zone validation
export const zoneSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  categoryId: yup.string().required('Category is required'),
  gateIds: yup.array().of(yup.string()).min(1, 'At least one gate must be selected'),
  totalSlots: yup.number().required('Total slots is required').min(1, 'Must have at least 1 slot'),
});

// Gate validation
export const gateSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  zoneIds: yup.array().of(yup.string()).min(1, 'At least one zone must be selected'),
  location: yup.string().required('Location is required'),
});

// Rush hour validation
export const rushHourSchema = yup.object({
  weekDay: yup.number().required('Week day is required').min(0).max(6),
  from: yup.string().required('From time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  to: yup.string().required('To time is required').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
});

// Vacation validation
export const vacationSchema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  from: yup.string().required('From date is required'),
  to: yup.string().required('To date is required'),
});

// User validation
export const userSchema = yup.object({
  username: yup.string().required('Username is required').min(3, 'Username must be at least 3 characters'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  role: yup.string().oneOf(['admin', 'employee'], 'Invalid role').required('Role is required'),
  name: yup.string().optional(),
  email: yup.string().email('Invalid email format').optional(),
});

// Car validation
export const carSchema = yup.object({
  plate: yup.string().required('Plate number is required').matches(/^[A-Z0-9-]+$/, 'Invalid plate format'),
  brand: yup.string().required('Brand is required'),
  model: yup.string().required('Model is required'),
  color: yup.string().required('Color is required'),
});

// Subscription validation
export const subscriptionSchema = yup.object({
  userName: yup.string().required('User name is required').min(2, 'Name must be at least 2 characters'),
  active: yup.boolean().required('Active status is required'),
  category: yup.string().required('Category is required'),
  cars: yup.array().of(carSchema).min(1, 'At least one car is required'),
  startsAt: yup.string().required('Start date is required'),
  expiresAt: yup.string().required('Expiry date is required'),
});

// Checkin validation
export const checkinSchema = yup.object({
  gateId: yup.string().required('Gate is required'),
  zoneId: yup.string().required('Zone is required'),
  type: yup.string().oneOf(['visitor', 'subscriber'], 'Invalid type').required('Type is required'),
  subscriptionId: yup.string().when('type', {
    is: 'subscriber',
    then: (schema) => schema.required('Subscription ID is required for subscribers'),
    otherwise: (schema) => schema.optional(),
  }),
});

// Checkout validation
export const checkoutSchema = yup.object({
  ticketId: yup.string().required('Ticket ID is required'),
  forceConvertToVisitor: yup.boolean().optional(),
});

// Week day options
export const weekDayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Time options (15-minute intervals)
export const timeOptions = Array.from({ length: 96 }, (_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return { value: timeString, label: timeString };
});
