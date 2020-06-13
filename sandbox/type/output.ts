import React from 'react';
import { render, screen, userEvent } from '@testing-library/react';


test('normal type should stay as is', async () => {
  render(<textarea />);

  await userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!');
  expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
});

test('normal type with prop should stay as is', async () => {
  render(<textarea />);

  await userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!', {
    delay: 100,
  });
  expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
});

test('allAtOnce true, type should rename to paste', async () => {
  render(<textarea />);

  await userEvent.paste(screen.getByRole('textbox'), 'Hello,{enter}World!');
  expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
});

test('allAtOnce false, prop should be removed', async () => {
  render(<textarea />);

  await userEvent.type(screen.getByRole('textbox'), 'Hello,{enter}World!');
  expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
});

test('type with multiple props', async () => {
  render(<textarea />);

  await userEvent.paste(screen.getByRole('textbox'), 'Hello,{enter}World!', {
    delay: 100
  });
  expect(screen.getByRole('textbox')).toHaveValue('Hello,\nWorld!');
});
