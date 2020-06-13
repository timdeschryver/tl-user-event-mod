import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('click should await and function should be made async', () => {
  render(
    <div>
      <label htmlFor="checkbox">Check</label>
      <input id="checkbox" type="checkbox" />
    </div>
  );

  userEvent.click(screen.getByText('Check'));
  expect(screen.getByLabelText('Check')).toHaveAttribute('checked', true);
});

test('click should await', async () => {
  render(
    <div>
      <label htmlFor="checkbox">Check</label>
      <input id="checkbox" type="checkbox" />
    </div>
  );

  userEvent.click(screen.getByText('Check'));
  expect(screen.getByLabelText('Check')).toHaveAttribute('checked', true);
});
