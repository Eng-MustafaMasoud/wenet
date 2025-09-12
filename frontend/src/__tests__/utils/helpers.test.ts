import {
  formatCurrency,
  formatTime,
  formatDateTime,
  formatDate,
  formatDuration,
  generateId,
  debounce,
  throttle,
  isValidEmail,
  isValidPlateNumber,
  getInitials,
  classNames,
  cn,
  copyToClipboard,
  downloadAsFile,
  isSpecialRateActive,
  getRateMode,
  getCurrentRate,
} from "@/utils/helpers";

describe("Helper Functions", () => {
  describe("formatCurrency", () => {
    it("formats currency correctly", () => {
      expect(formatCurrency(10.5)).toBe("$10.50");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(1000)).toBe("$1,000.00");
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(-50)).toBe("-$50.00");
    });
  });

  describe("formatTime", () => {
    it("formats time correctly", () => {
      const date = new Date("2024-01-01T14:30:00Z");
      expect(formatTime(date.toISOString())).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });
  });

  describe("formatDateTime", () => {
    it("formats date and time correctly", () => {
      const date = new Date("2024-01-01T14:30:00Z");
      const formatted = formatDateTime(date.toISOString());
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("2024");
    });
  });

  describe("formatDate", () => {
    it("formats date correctly", () => {
      const date = new Date("2024-01-01T14:30:00Z");
      const formatted = formatDate(date.toISOString());
      expect(formatted).toContain("Jan");
      expect(formatted).toContain("2024");
    });
  });

  describe("formatDuration", () => {
    it("formats duration correctly", () => {
      expect(formatDuration(1.5)).toBe("1h 30m");
      expect(formatDuration(0.5)).toBe("30m");
      expect(formatDuration(2)).toBe("2h");
      expect(formatDuration(0.25)).toBe("15m");
    });
  });

  describe("isValidEmail", () => {
    it("validates email addresses correctly", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidPlateNumber", () => {
    it("validates plate numbers correctly", () => {
      expect(isValidPlateNumber("ABC-123")).toBe(true);
      expect(isValidPlateNumber("XYZ789")).toBe(true);
      expect(isValidPlateNumber("A1B2C3")).toBe(true);
      expect(isValidPlateNumber("ab-123")).toBe(true); // should convert to uppercase
      expect(isValidPlateNumber("AB")).toBe(false); // too short
      expect(isValidPlateNumber("ABCDEFGHIJK")).toBe(false); // too long
      expect(isValidPlateNumber("")).toBe(false);
    });
  });

  describe("getInitials", () => {
    it("generates initials correctly", () => {
      expect(getInitials("John Doe")).toBe("JD");
      expect(getInitials("Jane")).toBe("J");
      expect(getInitials("Mary Jane Smith")).toBe("MJ");
      expect(getInitials("")).toBe("");
    });
  });

  describe("classNames", () => {
    it("combines class names correctly", () => {
      expect(classNames("class1", "class2")).toBe("class1 class2");
      expect(classNames("class1", undefined, "class2")).toBe("class1 class2");
      expect(classNames("class1", false, "class2")).toBe("class1 class2");
      expect(classNames("class1", null, "class2")).toBe("class1 class2");
      expect(classNames()).toBe("");
    });
  });

  describe("generateId", () => {
    it("generates unique IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
      expect(id1.length).toBe(9);
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("debounces function calls", () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1");
      debouncedFn("arg2");
      debouncedFn("arg3");

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("arg3");
    });
  });

  describe("throttle", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("throttles function calls", () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn("arg1");
      expect(mockFn).toHaveBeenCalledTimes(1);

      throttledFn("arg2");
      throttledFn("arg3");
      expect(mockFn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttledFn("arg4");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("cn (alias for classNames)", () => {
    it("works as alias for classNames", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    });
  });

  describe("copyToClipboard", () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
      });
    });

    it("copies text to clipboard successfully", async () => {
      const result = await copyToClipboard("test text");
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test text");
    });

    it("handles clipboard errors", async () => {
      navigator.clipboard.writeText = jest
        .fn()
        .mockRejectedValue(new Error("Clipboard error"));
      const result = await copyToClipboard("test text");
      expect(result).toBe(false);
    });
  });

  describe("downloadAsFile", () => {
    beforeEach(() => {
      // Mock DOM methods
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
      };
      document.createElement = jest.fn(() => mockLink as any);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      URL.createObjectURL = jest.fn(() => "mock-url");
      URL.revokeObjectURL = jest.fn();
    });

    it("downloads file with default content type", () => {
      downloadAsFile("test content", "test.txt");
      expect(document.createElement).toHaveBeenCalledWith("a");
    });

    it("downloads file with custom content type", () => {
      downloadAsFile("test content", "test.json", "application/json");
      expect(document.createElement).toHaveBeenCalledWith("a");
    });
  });

  describe("isSpecialRateActive", () => {
    it("returns false for any zone (placeholder implementation)", () => {
      const mockZone = { rateSpecial: 5, rateNormal: 2 };
      expect(isSpecialRateActive(mockZone)).toBe(false);
      expect(isSpecialRateActive(null)).toBe(false);
      expect(isSpecialRateActive(undefined)).toBe(false);
    });
  });

  describe("getRateMode", () => {
    it("returns normal mode when special rate is not active", () => {
      const mockZone = { rateSpecial: 5, rateNormal: 2 };
      expect(getRateMode(mockZone)).toBe("normal");
    });
  });

  describe("getCurrentRate", () => {
    it("returns normal rate when in normal mode", () => {
      const mockZone = { rateSpecial: 5, rateNormal: 2 };
      expect(getCurrentRate(mockZone)).toBe(2);
    });
  });
});
