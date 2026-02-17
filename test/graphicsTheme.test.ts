import { describe, expect, it } from 'vitest';

import { graphicsTheme, textColorByBackground } from '../src/shared/graphicsTheme.js';

describe('graphicsTheme', () => {
  it('espone i colori principali richiesti', () => {
    expect(graphicsTheme.background.primary).toBe('#FFFFFF');
    expect(graphicsTheme.background.secondary).toBe('#6D28D9');
  });

  it('usa testo nero su sfondo bianco e bianco su sfondo viola', () => {
    expect(textColorByBackground.primary).toBe('#000000');
    expect(textColorByBackground.secondary).toBe('#FFFFFF');
  });
});
