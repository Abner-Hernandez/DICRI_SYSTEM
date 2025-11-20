import { render, screen } from '@testing-library/react';
import Login from '../componentes/login';

test('renders learn react link', () => {
  render(<Login />);
  //const linkElement = screen.getByText(/learn react/i);
  //expect(linkElement).toBeInTheDocument();
});
