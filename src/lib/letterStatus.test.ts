import { describe, it, expect } from 'vitest';
import { deriveCompletionStatus } from './letterStatus';

describe('deriveCompletionStatus', () => {
  it('returns completed when there are no tasks', () => {
    expect(deriveCompletionStatus([])).toBe('completed');
  });

  it('returns completed when every task is done', () => {
    expect(
      deriveCompletionStatus([{ is_completed: true }, { is_completed: true }])
    ).toBe('completed');
  });

  it('returns pending when at least one task is not done', () => {
    expect(
      deriveCompletionStatus([{ is_completed: true }, { is_completed: false }])
    ).toBe('pending');
  });

  it('returns pending when a single task is not done', () => {
    expect(deriveCompletionStatus([{ is_completed: false }])).toBe('pending');
  });
});
