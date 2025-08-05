import { config } from 'dotenv';
config({ path: '.env' });

import '@/ai/flows/analyze-anomaly.ts';
import '@/ai/flows/user-management.ts';
