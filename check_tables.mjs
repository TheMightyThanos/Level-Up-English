
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: scores, error: e1 } = await supabase.from('exam_scores').select('*').limit(1);
  console.log('exam_scores error:', e1, 'data:', scores);

  const { data: results, error: e2 } = await supabase.from('exam_results').select('*').limit(1);
  console.log('exam_results error:', e2, 'data:', results);
}
check();
