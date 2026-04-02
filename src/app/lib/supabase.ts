import { createClient } from '@supabase/supabase-js';

// هنا نقوم بجلب المفاتيح من الخزنة السرية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// هنا ننشئ قناة الاتصال الرسمية
export const supabase = createClient(supabaseUrl, supabaseKey);
