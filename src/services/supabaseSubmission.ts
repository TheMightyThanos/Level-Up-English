/**
 * supabaseSubmission.ts
 * ---------------------
 * Submits exam results to the `exam_results` table in Supabase,
 * replacing the old Google Apps Script webhook.
 *
 * Table columns:
 *   full_name       TEXT
 *   email           TEXT (was nim)
 *   listening_score NUMERIC
 *   structure_score NUMERIC
 *   reading_score   NUMERIC
 *   total_score     NUMERIC
 */

import { supabase } from '@/lib/supabase';
import type { TestResults, UserData } from '@/types/toefl';

export interface SubmissionResult {
  success: boolean;
  error?: string;
}

/**
 * Insert the student's exam results into the Supabase `exam_results` table.
 *
 * Field mapping:
 *   full_name       ← userData.name
 *   email           ← userData.email
 *   listening_score ← results.section1.scaled
 *   structure_score ← results.section2.scaled
 *   reading_score   ← results.section3.scaled
 *   total_score     ← sum of scaled scores
 */
export async function submitResultsToSupabase(
  userData: UserData,
  results: TestResults,
): Promise<SubmissionResult> {
  if (!supabase) {
    console.error('[Supabase] Client is not initialised — check env variables.');
    return { success: false, error: 'Supabase client not initialised' };
  }

  const row = {
    full_name: userData.name,
    email: userData.email,
    listening_score: results.section1.scaled,
    structure_score: results.section2.scaled,
    reading_score: results.section3.scaled,
    total_score:
      results.section1.scaled +
      results.section2.scaled +
      results.section3.scaled,
  };

  console.log('[Supabase] Inserting exam result:', row);

  const { error } = await supabase.from('exam_results').insert([row]);

  if (error) {
    console.error('[Supabase] Insert failed:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
