import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

const getValidDateWithoutTime = (input: string | Date | null): string => {
  const date = dayjs(input);
  return (date.isValid() ? date : dayjs()).format('YYYY-MM-DD');
};
const isValidDate = (input: string | Date | null): boolean => {
  const date = dayjs(input);
  return date.isValid();
};
const isValidDateWithoutTime = (date: string | null) => {
  return dayjs(date, 'YYYY-MM-DD', true).isValid();
};

/**
 * Removes everything from the destination pattern to the end of the source string.
 * Supports regex patterns and is case-insensitive.
 * @param source - The source string to process
 * @param destination - The regex pattern to find; everything from this point to the end is removed
 * @returns The source string with everything from destination match to end removed, or original if not found
 * @example
 * removeAfter("Test1-Unregistriert", "1?-?[Uu]nregistriert") => "Test"
 * removeAfter("Test-Unregistriert", "1?-?[Uu]nregistriert") => "Test"
 * removeAfter("TestUnregistriert", "1?-?[Uu]nregistriert") => "Test"
 */
const removeAfter = (
  source: string | null,
  destination: string | null,
  regexFlag?: string,
): string => {
  if (!source || typeof source !== 'string') {
    return source ?? '';
  }
  if (!destination || typeof destination !== 'string') {
    return source;
  }

  try {
    // Create case-insensitive regex from the destination pattern
    const regex = new RegExp(destination, regexFlag ?? 'i');
    const match = source.match(regex);

    if (!match || match.index === undefined) {
      return source;
    }

    return source.substring(0, match.index);
  } catch {
    // If regex is invalid, fall back to simple string matching (case-insensitive)
    const lowerSource = source.toLowerCase();
    const lowerDest = destination.toLowerCase();
    const index = lowerSource.indexOf(lowerDest);

    if (index === -1) {
      return source;
    }

    return source.substring(0, index);
  }
};

export const assignFunctionList: {
    name: string;
    func: (this: any, ...args: any[]) => any;
    type: string;
}[] = [
    { name: '_dateWithoutTime', func: getValidDateWithoutTime, type: '<(sl):s>' },
    { name: '_isValidDate', func: isValidDate, type: '<(sl):b>' },
    {
        name: '_isValidDateWithoutTime',
        func: isValidDateWithoutTime,
        type: '<(sl):b>',
    },
    { name: '_removeAfter', func: removeAfter, type: '<(sl)(sl)(sl)?:s>' },
];
