import { render } from '@testing-library/react';
import App from './App';

test('renders application without crashing', () => {
  const { container } = render(<App />);
  expect(container).toBeDefined();
});
