import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterBuilder } from '../CharacterBuilder';
import { solrynSystem } from '../../../systems/solryn';

describe('CharacterBuilder (integration smoke)', () => {
  it('starts on the roll step with Next gated, and enables it after all stats are rolled', () => {
    render(
      <CharacterBuilder
        system={solrynSystem}
        gameId="g"
        ownerUserId="u"
        onFinish={async () => {}}
      />,
    );

    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Next: Choose race/ }),
    ).toBeDisabled();

    // The per-stat "Roll NdM" button advances one stat at a time (sequential, anti-fishing).
    for (let i = 0; i < solrynSystem.coreStats.length; i++) {
      fireEvent.click(screen.getByRole('button', { name: /^Roll \d/ }));
    }

    expect(
      screen.getByRole('button', { name: /Next: Choose race/ }),
    ).toBeEnabled();
    // No reroll: once all are rolled, no Roll buttons remain.
    expect(screen.queryByRole('button', { name: /^Roll/ })).toBeNull();
  });

  it('"Roll all stats" rolls every stat at once and enables Next', () => {
    render(
      <CharacterBuilder
        system={solrynSystem}
        gameId="g"
        ownerUserId="u"
        onFinish={async () => {}}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Roll all stats/ }));

    expect(
      screen.getByRole('button', { name: /Next: Choose race/ }),
    ).toBeEnabled();
    // Everything is locked in one click — no per-stat or roll-all buttons remain.
    expect(screen.queryByRole('button', { name: /^Roll/ })).toBeNull();
  });
});
