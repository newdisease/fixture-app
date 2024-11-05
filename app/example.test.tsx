// This is just an example test to show that the testing environment is working.
// TODO: Remove this file after adding some real tests.
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { describe, it, expect } from 'vitest'

interface CounterProps {
  initialCount: number
}

export function Counter({ initialCount }: CounterProps) {
  const [count, setCount] = React.useState(initialCount)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}

describe('Counter component', () => {
  it('renders initial count and increments when button is clicked', () => {
    render(<Counter initialCount={0} />)

    expect(screen.getByText('Count: 0')).toBeInTheDocument()

    const incrementButton = screen.getByRole('button', { name: 'Increment' })
    fireEvent.click(incrementButton)

    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
