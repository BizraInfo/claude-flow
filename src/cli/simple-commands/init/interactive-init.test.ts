import { jest, describe, it, expect } from '@jest/globals';
import inquirer from 'inquirer';
import { runInteractiveInit } from './interactive-init.js';

// Mock the inquirer module
jest.mock('inquirer');

describe('runInteractiveInit', () => {
  it('should return correct options when user confirms', async () => {
    // Configure the mock to return specific answers
    inquirer.prompt.mockResolvedValue({
      projectName: 'test-project',
      useCase: 'hive-mind',
      neuralEnhanced: false,
      projectType: 'Web Application (React + Node.js)',
      proceed: true
    });

    const options = await runInteractiveInit();

    // Verify the options object is what we expect
    expect(options).toEqual({
      force: true,
      sparc: true,
      projectName: 'test-project',
      neural: false,
      template: 'Web Application (React + Node.js)',
      hiveMind: true,
      interactive: true
    });
  });

  it('should return null when user cancels', async () => {
    // Configure the mock for the final confirmation prompt
    inquirer.prompt.mockResolvedValueOnce({ // First set of questions
      projectName: 'test-project',
      useCase: 'swarm',
      neuralEnhanced: true,
      projectType: 'General Purpose (Flexible setup)',
    }).mockResolvedValueOnce({ // Final confirmation
      proceed: false
    });

    const options = await runInteractiveInit();

    // Verify that cancellation returns null
    expect(options).toBeNull();
  });

  it('should handle default values correctly', async () => {
    // Mock answers that are the same as the defaults
    inquirer.prompt.mockResolvedValue({
      projectName: 'my-claude-flow-project',
      useCase: 'swarm',
      neuralEnhanced: true,
      projectType: 'General Purpose (Flexible setup)',
      proceed: true
    });

    const options = await runInteractiveInit();

    expect(options).toEqual({
      force: true,
      sparc: true,
      projectName: 'my-claude-flow-project',
      neural: true,
      template: 'General Purpose (Flexible setup)',
      hiveMind: false,
      interactive: true
    });
  });
});
