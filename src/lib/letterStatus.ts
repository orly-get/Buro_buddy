/**
 * Derives a letter's completion status from its tasks.
 *
 * A letter is 'completed' when there is nothing left to do — either it has no
 * tasks at all, or every task has been checked off. Otherwise it is 'pending'
 * ("needs handling").
 */
export function deriveCompletionStatus(
  tasks: { is_completed: boolean }[]
): 'completed' | 'pending' {
  return tasks.length === 0 || tasks.every((t) => t.is_completed)
    ? 'completed'
    : 'pending';
}
