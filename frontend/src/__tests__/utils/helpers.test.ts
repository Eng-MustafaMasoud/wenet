import {
  formatCurrency,
  formatTime,
  formatDateTime,
  formatDate,
  formatDuration,
  isValidEmail,
  isValidPlateNumber,
  getInitials,
  classNames,
} from "@/utils/helpers";

describe("Helper Functions", () => {
  describe("formatCurrency", () => {
    it("formats currency correctly", () => {
      expect(formatCurrency(10.5)).toBe("$10.50");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(1000)).toBe("$1,000.00");
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
});
