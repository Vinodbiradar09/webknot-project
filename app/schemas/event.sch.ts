import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .trim(),
  
  type: z
    .enum(['hackathon', 'fest', 'talk']),
  
  startDate: z
    .string()
    .or(z.date())
    .refine((date) => {
      const startDate = new Date(date);
      const now = new Date();
      return startDate > now;
    }, {
      message: 'Start date must be in the future'
    })
    .transform((date) => new Date(date)),
  
  endDate: z
    .string()
    .or(z.date())
    .transform((date) => new Date(date)),
  
  venue: z
    .string()
    .min(3, 'Venue must be at least 3 characters')
    .max(100, 'Venue cannot exceed 100 characters')
    .trim(),
  
  maxParticipants: z
    .number()
    .min(1, 'Maximum participants must be at least 1')
    .max(1000, 'Maximum participants cannot exceed 1000')
    .optional(),
  status : z.enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
}).refine((data) => {
  return data.endDate > data.startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});
