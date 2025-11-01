import { hexToRgb, rgbToHex, blendColors, adjustBrightness } from '@/utils/colors';

describe('Color Utilities', () => {
  describe('hexToRgb', () => {
    it('converts hex to RGB correctly', () => {
      const result = hexToRgb('#FF6B6B');
      expect(result).toEqual({ r: 255, g: 107, b: 107 });
    });

    it('handles hex without # prefix', () => {
      const result = hexToRgb('FF6B6B');
      expect(result).toEqual({ r: 255, g: 107, b: 107 });
    });

    it('returns null for invalid hex', () => {
      const result = hexToRgb('invalid');
      expect(result).toBeNull();
    });
  });

  describe('rgbToHex', () => {
    it('converts RGB to hex correctly', () => {
      const result = rgbToHex(255, 107, 107);
      expect(result).toBe('#ff6b6b');
    });

    it('pads single digits with zero', () => {
      const result = rgbToHex(1, 2, 3);
      expect(result).toBe('#010203');
    });
  });

  describe('blendColors', () => {
    it('blends two colors at 50%', () => {
      const result = blendColors('#FF0000', '#0000FF', 0.5);
      expect(result).toBe('#800080'); // Purple
    });

    it('returns first color at ratio 0', () => {
      const result = blendColors('#FF0000', '#0000FF', 0);
      expect(result).toBe('#ff0000');
    });

    it('returns second color at ratio 1', () => {
      const result = blendColors('#FF0000', '#0000FF', 1);
      expect(result).toBe('#0000ff');
    });
  });

  describe('adjustBrightness', () => {
    it('brightens color by positive percent', () => {
      const result = adjustBrightness('#808080', 50);
      expect(result).toBe('#c0c0c0');
    });

    it('darkens color by negative percent', () => {
      const result = adjustBrightness('#808080', -50);
      expect(result).toBe('#404040');
    });
  });
});

