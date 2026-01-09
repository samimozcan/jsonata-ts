import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import _ from 'lodash';

dayjs.extend(customParseFormat);

/**
 * Converts a date input to a formatted date string without time component.
 * If the input is invalid, returns the current date.
 *
 * @param input - The date to format (string, Date object, or null)
 * @returns A date string in 'YYYY-MM-DD' format
 * @example
 * getValidDateWithoutTime("2025-01-05T10:30:00") => "2025-01-05"
 * getValidDateWithoutTime(new Date()) => "2025-01-05"
 * getValidDateWithoutTime(null) => current date in "YYYY-MM-DD" format
 *
 * @jsonata_signature `<(sl)-:s>` - Takes an optional string or null (uses context if missing), returns string
 */
const getValidDateWithoutTime = (input: string | Date | null): string => {
  const date = dayjs(input);
  return (date.isValid() ? date : dayjs()).format('YYYY-MM-DD');
};

/**
 * Checks if a given input is a valid date.
 *
 * @param input - The value to check (string, Date object, or null)
 * @returns true if the input is a valid date, false otherwise
 * @example
 * isValidDate("2025-01-05") => true
 * isValidDate("invalid") => false
 * isValidDate(null) => false
 *
 * @jsonata_signature `<(sl)-:b>` - Takes an optional string or null (uses context if missing), returns boolean
 */
const isValidDate = (input: string | Date | null): boolean => {
  const date = dayjs(input);
  return date.isValid();
};

/**
 * Checks if a given string is a valid date in 'YYYY-MM-DD' format (strict parsing).
 *
 * @param date - The date string to validate
 * @returns true if the string matches 'YYYY-MM-DD' format exactly, false otherwise
 * @example
 * isValidDateWithoutTime("2025-01-05") => true
 * isValidDateWithoutTime("2025-1-5") => false (not zero-padded)
 * isValidDateWithoutTime("01-05-2025") => false (wrong format)
 * isValidDateWithoutTime("2025-01-05T10:00:00") => false (has time component)
 *
 * @jsonata_signature `<(sl)-:b>` - Takes an optional string or null (uses context if missing), returns boolean
 */
const isValidDateWithoutTime = (date: string | null) => {
  return dayjs(date, 'YYYY-MM-DD', true).isValid();
};

/**
 * Removes everything from the destination pattern to the end of the source string.
 * Supports regex patterns. Falls back to case-insensitive string matching if regex is invalid.
 *
 * @param source - The source string to process (can be null)
 * @param destination - The regex pattern to find; everything from this point to the end is removed (can be null)
 * @param regexFlag - Optional regex flags (default: 'i' for case-insensitive)
 * @returns The source string with everything from destination match to end removed, or original if not found
 * @example
 * removeAfter("Test1-Unregistriert", "1?-?[Uu]nregistriert") => "Test"
 * removeAfter("Test-Unregistriert", "1?-?[Uu]nregistriert") => "Test"
 * removeAfter("TestUnregistriert", "1?-?[Uu]nregistriert") => "Test"
 * removeAfter("Hello World", "World") => "Hello "
 * removeAfter("NoMatch", "xyz") => "NoMatch"
 * removeAfter(null, "pattern") => ""
 *
 * @jsonata_signature `<(sl)-(sl)-(sl)?:s>` - Takes source (string|null, context if missing),
 *                                            destination (string|null, context if missing),
 *                                            optional regex flag (string|null), returns string
 */
const removeAfter = (
  source: string | null,
  destination: string | null,
  regexFlag?: string
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

/**
 * Floors a number to a specified number of decimal places.
 * Unlike Math.floor which only returns integers, this function supports decimal precision.
 * Handles string inputs by parsing them as numbers.
 *
 * @param value - The number to floor (also accepts string that can be parsed as number)
 * @param decimalPlaces - Number of decimal places to keep (default: 0)
 * @returns The floored number
 * @example
 * floor(3.789) => 3
 * floor(3.789, 1) => 3.7
 * floor(3.789, 2) => 3.78
 * floor("3.789", 1) => 3.7
 * floor(123.456, 0) => 123
 *
 * @jsonata_signature `<(ns)-n?:n>` - Takes a number or string (context if missing),
 *                                    optional decimal places number, returns number
 */
const floor = (value: number | string, decimalPlaces: number = 0): number => {
  const floorHelper = (val: number, places: number): number => {
    const factor = 10 ** places;
    return Math.floor(val * factor) / factor;
  };

  if (typeof value === 'string') {
    value = parseFloat(value);
    if (Number.isNaN(value)) {
      return value;
    }

    return floorHelper(value, decimalPlaces);
  }

  return floorHelper(value, decimalPlaces);
};

/**
 * Removes all falsy values (null, undefined, false, '', 0, NaN) from an array.
 * If input is not an array, wraps it in an array first then compacts.
 * Uses lodash's compact function internally.
 *
 * @param arr - The array to compact, or a single value to wrap and compact
 * @returns A new array with all falsy values removed
 * @example
 * compact([1, null, 2, undefined, 3, false, 4]) => [1, 2, 3, 4]
 * compact([0, 1, '', 'hello', NaN]) => [1, 'hello']
 * compact(null) => []
 * compact('hello') => ['hello']
 * compact(0) => []
 *
 * @jsonata_signature `<x:a>` - Takes any type, returns array
 */
const compact = (arr: unknown[] | unknown): unknown[] => {
  if (!Array.isArray(arr)) {
    return _.compact([arr]);
  }
  return _.compact(arr);
};

/**
 * Returns the length of a string, array, or number (as string).
 * Handles null/undefined inputs gracefully by returning 0.
 *
 * @param input - The value to get length of (string, array, number, null, or undefined)
 * @returns The length of the input, or 0 if null/undefined
 * @example
 * length("hello") => 5
 * length([1, 2, 3]) => 3
 * length(12345) => 5
 * length(null) => 0
 * length(undefined) => 0
 *
 * @jsonata_signature `<x:n>` - Takes any type, returns number
 */
const length = (input: string | unknown[] | null | undefined | number): number => {
  if (input == null) {
    return 0;
  }
  if (typeof input === 'string' || Array.isArray(input)) {
    return input.length;
  }
  if (typeof input === 'number') {
    return input.toString().length;
  }

  return 0;
};

/* ============================================
 * LODASH UTILITY FUNCTIONS
 * ============================================
 * The following functions wrap commonly used lodash utilities
 * for use in JSONata expressions with proper null handling.
 */

/**
 * Creates an array of unique values from the input array.
 * Uses SameValueZero for equality comparisons.
 *
 * @param arr - The array to inspect
 * @returns A new array with duplicate values removed
 * @example
 * uniq([1, 2, 2, 3, 3, 3]) => [1, 2, 3]
 * uniq(['a', 'b', 'a']) => ['a', 'b']
 * uniq(null) => []
 *
 * @jsonata_signature `<a:a>` - Takes array, returns array
 */
const uniq = (arr: unknown[] | null | undefined): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.uniq(arr);
};

/**
 * Flattens an array a single level deep.
 *
 * @param arr - The array to flatten
 * @returns A new flattened array
 * @example
 * flatten([[1, 2], [3, 4], [5]]) => [1, 2, 3, 4, 5]
 * flatten([1, [2, [3, [4]]]]) => [1, 2, [3, [4]]]
 * flatten(null) => []
 *
 * @jsonata_signature `<a:a>` - Takes array, returns array
 */
const flatten = (arr: unknown[] | null | undefined): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.flatten(arr);
};

/**
 * Recursively flattens an array to a single level.
 *
 * @param arr - The array to flatten
 * @returns A new deeply flattened array
 * @example
 * flattenDeep([1, [2, [3, [4, [5]]]]]) => [1, 2, 3, 4, 5]
 * flattenDeep([[1], [[2]], [[[3]]]]) => [1, 2, 3]
 * flattenDeep(null) => []
 *
 * @jsonata_signature `<a:a>` - Takes array, returns array
 */
const flattenDeep = (arr: unknown[] | null | undefined): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.flattenDeep(arr);
};

/**
 * Gets the first element of an array.
 *
 * @param arr - The array to query
 * @returns The first element, or undefined if empty
 * @example
 * first([1, 2, 3]) => 1
 * first(['a', 'b']) => 'a'
 * first([]) => undefined
 * first(null) => undefined
 *
 * @jsonata_signature `<a:x>` - Takes array, returns any type
 */
const first = (arr: unknown[] | null | undefined): unknown => {
  if (!Array.isArray(arr)) {
    return undefined;
  }
  return _.first(arr);
};

/**
 * Gets the last element of an array.
 *
 * @param arr - The array to query
 * @returns The last element, or undefined if empty
 * @example
 * last([1, 2, 3]) => 3
 * last(['a', 'b']) => 'b'
 * last([]) => undefined
 * last(null) => undefined
 *
 * @jsonata_signature `<a:x>` - Takes array, returns any type
 */
const last = (arr: unknown[] | null | undefined): unknown => {
  if (!Array.isArray(arr)) {
    return undefined;
  }
  return _.last(arr);
};

/**
 * Gets all but the first element of an array.
 *
 * @param arr - The array to query
 * @returns A new array with all elements except the first
 * @example
 * tail([1, 2, 3]) => [2, 3]
 * tail(['a']) => []
 * tail([]) => []
 * tail(null) => []
 *
 * @jsonata_signature `<a:a>` - Takes array, returns array
 */
const tail = (arr: unknown[] | null | undefined): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.tail(arr);
};

/**
 * Creates a slice of array with n elements taken from the beginning.
 *
 * @param arr - The array to query
 * @param n - The number of elements to take (default: 1)
 * @returns A new array with the first n elements
 * @example
 * take([1, 2, 3, 4], 2) => [1, 2]
 * take([1, 2, 3]) => [1]
 * take(null, 2) => []
 *
 * @jsonata_signature `<an?:a>` - Takes array, optional number, returns array
 */
const take = (arr: unknown[] | null | undefined, n: number = 1): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.take(arr, n);
};

/**
 * Creates a slice of array with n elements dropped from the beginning.
 *
 * @param arr - The array to query
 * @param n - The number of elements to drop (default: 1)
 * @returns A new array with elements after the first n elements
 * @example
 * drop([1, 2, 3, 4], 2) => [3, 4]
 * drop([1, 2, 3]) => [2, 3]
 * drop(null, 2) => []
 *
 * @jsonata_signature `<an?:a>` - Takes array, optional number, returns array
 */
const drop = (arr: unknown[] | null | undefined, n: number = 1): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.drop(arr, n);
};

/**
 * Reverses an array so that the first element becomes the last.
 * Note: This creates a new array, does not mutate the original.
 *
 * @param arr - The array to reverse
 * @returns A new reversed array
 * @example
 * reverse([1, 2, 3]) => [3, 2, 1]
 * reverse(['a', 'b', 'c']) => ['c', 'b', 'a']
 * reverse(null) => []
 *
 * @jsonata_signature `<a:a>` - Takes array, returns array
 */
const reverse = (arr: unknown[] | null | undefined): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.reverse([...arr]); // Clone to avoid mutation
};

/**
 * Creates an array of grouped elements, the first of which contains the first elements
 * of the given arrays, the second of which contains the second elements, and so on.
 *
 * @param arrays - The arrays to process
 * @returns A new array of grouped elements
 * @example
 * zip(['a', 'b'], [1, 2], [true, false]) => [['a', 1, true], ['b', 2, false]]
 * zip(['a', 'b'], [1, 2, 3]) => [['a', 1], ['b', 2], [undefined, 3]]
 *
 * @jsonata_signature `<a+:a>` - Takes one or more arrays, returns array
 */
const zip = (...arrays: (unknown[] | null | undefined)[]): unknown[][] => {
  const validArrays = arrays.filter(Array.isArray);
  if (validArrays.length === 0) {
    return [];
  }
  return _.zip(...validArrays) as unknown[][];
};

/**
 * Creates an object composed of keys generated from the results of running
 * each element through an iteratee. Values are arrays of elements that produced the same key.
 *
 * @param arr - The array to group
 * @param key - The property name to group by
 * @returns An object with grouped arrays
 * @example
 * groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], 'type')
 *   => {a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}]}
 *
 * @jsonata_signature `<as:o>` - Takes array and string key, returns object
 */
const groupBy = (arr: unknown[] | null | undefined, key: string): Record<string, unknown[]> => {
  if (!Array.isArray(arr)) {
    return {};
  }
  return _.groupBy(arr, key);
};

/**
 * Creates an object composed of keys generated from the results of running
 * each element through an iteratee. The value of each key is the last element
 * that produced the key.
 *
 * @param arr - The array to convert
 * @param key - The property name to key by
 * @returns An object keyed by the specified property
 * @example
 * keyBy([{id: 'a', val: 1}, {id: 'b', val: 2}], 'id')
 *   => {a: {id: 'a', val: 1}, b: {id: 'b', val: 2}}
 *
 * @jsonata_signature `<as:o>` - Takes array and string key, returns object
 */
const keyBy = (arr: unknown[] | null | undefined, key: string): Record<string, unknown> => {
  if (!Array.isArray(arr)) {
    return {};
  }
  return _.keyBy(arr, key);
};

/**
 * Creates an array of values by running each element in array through iteratee.
 * Extracts a property from each object in an array.
 *
 * @param arr - The array to iterate over
 * @param path - The property path to extract
 * @returns A new array of extracted values
 * @example
 * pluck([{name: 'John', age: 30}, {name: 'Jane', age: 25}], 'name') => ['John', 'Jane']
 * pluck([{a: {b: 1}}, {a: {b: 2}}], 'a.b') => [1, 2]
 * pluck(null, 'name') => []
 *
 * @jsonata_signature `<as:a>` - Takes array and string path, returns array
 */
const pluck = (arr: unknown[] | null | undefined, path: string): unknown[] => {
  if (!Array.isArray(arr)) {
    return [];
  }
  return _.map(arr, path);
};

/**
 * Gets the value at path of object. If the resolved value is undefined, the defaultValue is returned.
 *
 * @param obj - The object to query
 * @param path - The path of the property to get (string or array)
 * @param defaultValue - The value returned if the resolved value is undefined
 * @returns The resolved value or defaultValue
 * @example
 * get({a: {b: {c: 3}}}, 'a.b.c') => 3
 * get({a: {b: {c: 3}}}, 'a.b.d', 'default') => 'default'
 * get({a: [{b: 1}]}, 'a[0].b') => 1
 * get(null, 'a.b') => undefined
 *
 * @jsonata_signature `<osx?:x>` - Takes object, string path, optional default, returns any type
 */
const get = (obj: object | null | undefined, path: string, defaultValue?: unknown): unknown => {
  if (obj == null) {
    return defaultValue;
  }
  return _.get(obj, path, defaultValue);
};

/**
 * Checks if path is a direct property of object (not inherited).
 *
 * @param obj - The object to query
 * @param path - The path to check
 * @returns true if path exists as a direct property, else false
 * @example
 * has({a: {b: 2}}, 'a') => true
 * has({a: {b: 2}}, 'a.b') => true
 * has({a: {b: 2}}, 'c') => false
 * has(null, 'a') => false
 *
 * @jsonata_signature `<os:b>` - Takes object and string path, returns boolean
 */
const has = (obj: object | null | undefined, path: string): boolean => {
  if (obj == null) {
    return false;
  }
  return _.has(obj, path);
};

/**
 * Creates an array of the own enumerable property names of object.
 *
 * @param obj - The object to query
 * @returns An array of property names
 * @example
 * keys({a: 1, b: 2, c: 3}) => ['a', 'b', 'c']
 * keys(null) => []
 *
 * @jsonata_signature `<o:a>` - Takes object, returns array
 */
const keys = (obj: object | null | undefined): string[] => {
  if (obj == null) {
    return [];
  }
  return _.keys(obj);
};

/**
 * Creates an array of the own enumerable property values of object.
 *
 * @param obj - The object to convert
 * @returns An array of property values
 * @example
 * values({a: 1, b: 2, c: 3}) => [1, 2, 3]
 * values(null) => []
 *
 * @jsonata_signature `<o:a>` - Takes object, returns array
 */
const values = (obj: object | null | undefined): unknown[] => {
  if (obj == null) {
    return [];
  }
  return _.values(obj);
};

/**
 * Creates an array of own enumerable key-value pairs for object.
 *
 * @param obj - The object to convert
 * @returns An array of [key, value] pairs
 * @example
 * entries({a: 1, b: 2}) => [['a', 1], ['b', 2]]
 * entries(null) => []
 *
 * @jsonata_signature `<o:a>` - Takes object, returns array
 */
const entries = (obj: object | null | undefined): [string, unknown][] => {
  if (obj == null) {
    return [];
  }
  return _.toPairs(obj);
};

/**
 * The inverse of entries - creates an object from key-value pairs.
 *
 * @param pairs - The key-value pairs array
 * @returns An object composed from the pairs
 * @example
 * fromEntries([['a', 1], ['b', 2]]) => {a: 1, b: 2}
 * fromEntries(null) => {}
 *
 * @jsonata_signature `<a:o>` - Takes array of pairs, returns object
 */
const fromEntries = (pairs: [string, unknown][] | null | undefined): Record<string, unknown> => {
  if (!Array.isArray(pairs)) {
    return {};
  }
  return _.fromPairs(pairs);
};

/**
 * Creates an object with the same values but keys transformed.
 * Picks specified properties from an object.
 *
 * @param obj - The source object
 * @param paths - The property paths to pick (array of strings)
 * @returns A new object with only the picked properties
 * @example
 * pick({a: 1, b: 2, c: 3}, ['a', 'c']) => {a: 1, c: 3}
 * pick({name: 'John', age: 30, city: 'NYC'}, ['name', 'age']) => {name: 'John', age: 30}
 * pick(null, ['a']) => {}
 *
 * @jsonata_signature `<oa:o>` - Takes object and array of paths, returns object
 */
const pick = (obj: object | null | undefined, paths: string[]) => {
  if (obj == null) {
    return {};
  }
  return _.pick(obj, paths);
};

/**
 * The opposite of pick - creates an object without the specified properties.
 *
 * @param obj - The source object
 * @param paths - The property paths to omit (array of strings)
 * @returns A new object without the omitted properties
 * @example
 * omit({a: 1, b: 2, c: 3}, ['b']) => {a: 1, c: 3}
 * omit({name: 'John', password: 'secret'}, ['password']) => {name: 'John'}
 * omit(null, ['a']) => {}
 *
 * @jsonata_signature `<oa:o>` - Takes object and array of paths, returns object
 */
const omit = (obj: object | null | undefined, paths: string[]) => {
  if (obj == null) {
    return {};
  }
  return _.omit(obj, paths);
};

/**
 * Recursively merges own and inherited enumerable properties of source objects into the destination object.
 * Source properties that resolve to undefined are skipped.
 *
 * @param object - The destination object
 * @param sources - The source objects to merge
 * @returns The merged object
 * @example
 * merge({a: 1}, {b: 2}, {c: 3}) => {a: 1, b: 2, c: 3}
 * merge({a: {b: 1}}, {a: {c: 2}}) => {a: {b: 1, c: 2}}
 *
 * @jsonata_signature `<o+:o>` - Takes one or more objects, returns object
 */
const merge = (...objects: (object | null | undefined)[]): Record<string, unknown> => {
  const validObjects = objects.filter((obj) => obj != null);
  if (validObjects.length === 0) {
    return {};
  }
  return _.merge({}, ...validObjects);
};

/**
 * Converts string to camelCase.
 *
 * @param str - The string to convert
 * @returns The camel cased string
 * @example
 * camelCase('Foo Bar') => 'fooBar'
 * camelCase('--foo-bar--') => 'fooBar'
 * camelCase('__FOO_BAR__') => 'fooBar'
 *
 * @jsonata_signature `<s:s>` - Takes string, returns string
 */
const camelCase = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  return _.camelCase(str);
};

/**
 * Converts string to snake_case.
 *
 * @param str - The string to convert
 * @returns The snake cased string
 * @example
 * snakeCase('Foo Bar') => 'foo_bar'
 * snakeCase('fooBar') => 'foo_bar'
 * snakeCase('--FOO-BAR--') => 'foo_bar'
 *
 * @jsonata_signature `<s:s>` - Takes string, returns string
 */
const snakeCase = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  return _.snakeCase(str);
};

/**
 * Converts string to kebab-case.
 *
 * @param str - The string to convert
 * @returns The kebab cased string
 * @example
 * kebabCase('Foo Bar') => 'foo-bar'
 * kebabCase('fooBar') => 'foo-bar'
 * kebabCase('__FOO_BAR__') => 'foo-bar'
 *
 * @jsonata_signature `<s:s>` - Takes string, returns string
 */
const kebabCase = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  return _.kebabCase(str);
};

/**
 * Converts the first character of string to upper case and the remaining to lower case.
 *
 * @param str - The string to capitalize
 * @returns The capitalized string
 * @example
 * capitalize('FRED') => 'Fred'
 * capitalize('fred') => 'Fred'
 *
 * @jsonata_signature `<s:s>` - Takes string, returns string
 */
const capitalize = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  return _.capitalize(str);
};

/**
 * Converts the first character of string to upper case.
 *
 * @param str - The string to convert
 * @returns The string with first char uppercased
 * @example
 * upperFirst('fred') => 'Fred'
 * upperFirst('FRED') => 'FRED'
 *
 * @jsonata_signature `<s:s>` - Takes string, returns string
 */
const upperFirst = (str: string | null | undefined): string => {
  if (str == null) {
    return '';
  }
  return _.upperFirst(str);
};

/**
 * Removes leading and trailing whitespace or specified characters from string.
 *
 * @param str - The string to trim
 * @param chars - The characters to trim (optional, defaults to whitespace)
 * @returns The trimmed string
 * @example
 * trim('  abc  ') => 'abc'
 * trim('-_-abc-_-', '_-') => 'abc'
 *
 * @jsonata_signature `<ss?:s>` - Takes string, optional chars string, returns string
 */
const trim = (str: string | null | undefined, chars?: string): string => {
  if (str == null) {
    return '';
  }
  return _.trim(str, chars);
};

/**
 * Pads string on the left and right sides if it's shorter than length.
 *
 * @param str - The string to pad
 * @param length - The target length
 * @param chars - The string used as padding (optional, defaults to space)
 * @returns The padded string
 * @example
 * pad('abc', 8) => '  abc   '
 * pad('abc', 8, '_-') => '_-abc_-_'
 *
 * @jsonata_signature `<sns?:s>` - Takes string, length number, optional padding string, returns string
 */
const pad = (str: string | null | undefined, length: number, chars?: string): string => {
  if (str == null) {
    return '';
  }
  return _.pad(str, length, chars);
};

/**
 * Checks if value is an empty object, collection, map, or set.
 * Objects are considered empty if they have no own enumerable string keyed properties.
 *
 * @param value - The value to check
 * @returns true if value is empty, else false
 * @example
 * isEmpty(null) => true
 * isEmpty('') => true
 * isEmpty([]) => true
 * isEmpty({}) => true
 * isEmpty([1, 2, 3]) => false
 * isEmpty('abc') => false
 * isEmpty({a: 1}) => false
 *
 * @jsonata_signature `<x:b>` - Takes any type, returns boolean
 */
const isEmpty = (value: unknown): boolean => {
  return _.isEmpty(value);
};

/**
 * Checks if value is null or undefined.
 *
 * @param value - The value to check
 * @returns true if value is null or undefined, else false
 * @example
 * isNil(null) => true
 * isNil(undefined) => true
 * isNil(0) => false
 * isNil('') => false
 *
 * @jsonata_signature `<x:b>` - Takes any type, returns boolean
 */
const isNil = (value: unknown): boolean => {
  return _.isNil(value);
};

/**
 * Clamps number within the inclusive lower and upper bounds.
 *
 * @param number - The number to clamp
 * @param lower - The lower bound
 * @param upper - The upper bound
 * @returns The clamped number
 * @example
 * clamp(-10, -5, 5) => -5
 * clamp(10, -5, 5) => 5
 * clamp(3, -5, 5) => 3
 *
 * @jsonata_signature `<nnn:n>` - Takes three numbers, returns number
 */
const clamp = (number: number, lower: number, upper: number): number => {
  return _.clamp(number, lower, upper);
};

/**
 * Produces a random number between the inclusive lower and upper bounds.
 * If only one argument is provided, returns between 0 and that number.
 *
 * @param lower - The lower bound (or upper if only one arg)
 * @param upper - The upper bound
 * @param floating - Specify returning a floating-point number
 * @returns A random number
 * @example
 * random(0, 5) => random integer between 0 and 5
 * random(5) => random integer between 0 and 5
 * random(1.2, 5.2) => random floating-point between 1.2 and 5.2
 *
 * @jsonata_signature `<n?n?b?:n>` - Takes optional lower, upper, floating flag, returns number
 */
const random = (lower?: number, upper?: number, floating?: boolean): number => {
  return _.random(lower ?? 0, upper ?? 1, floating);
};

/**
 * JSONata Function Signature Syntax Reference
 * ============================================
 *
 * A function signature is a string of the form `<params:return>` where:
 * - `params` is a sequence of type symbols representing input argument types
 * - `return` is a single type symbol representing the return value type
 *
 * SIMPLE TYPES:
 * -------------
 * - `b` - Boolean
 * - `n` - number
 * - `s` - string
 * - `l` - null
 *
 * COMPLEX TYPES:
 * --------------
 * - `a` - array
 * - `o` - object
 * - `f` - function
 *
 * UNION TYPES:
 * ------------
 * - `(sao)` - string, array or object (multiple types in parentheses)
 * - `(sl)` - string or null
 * - `u` - equivalent to `(bnsl)` i.e. Boolean, number, string or null
 * - `j` - any JSON type. Equivalent to `(bnsloa)` - excludes function
 * - `x` - any type. Equivalent to `(bnsloaf)` - includes all types
 *
 * PARAMETRISED TYPES:
 * -------------------
 * - `a<s>` - array of strings
 * - `a<n>` - array of numbers
 * - `a<x>` - array of values of any type
 *
 * TYPE OPTIONS/MODIFIERS:
 * -----------------------
 * - `+` - one or more arguments of this type (e.g., `<a+>` accepts 1+ arrays)
 * - `?` - optional argument (e.g., `<sn?:s>` second number is optional)
 * - `-` - if argument is missing, use the context value ("focus")
 *         (e.g., `<s-:n>` can be called as `$length(str)` or `str.$length()`)
 *
 * EXAMPLES OF BUILT-IN JSONata FUNCTION SIGNATURES:
 * -------------------------------------------------
 * - `$count` has signature `<a:n>` - accepts array, returns number
 * - `$append` has signature `<aa:a>` - accepts two arrays, returns array
 * - `$sum` has signature `<a<n>:n>` - accepts array of numbers, returns number
 * - `$join` has signature `<a<s>s?:s>` - accepts array of strings + optional joiner, returns string
 * - `$length` has signature `<s-:n>` - accepts string (or uses context), returns number
 * - `$reduce` has signature `<fa<j>:j>` - accepts function + array of JSON, returns JSON
 *
 * @see https://docs.jsonata.org/embedding-extending for full documentation
 */
export const assignFunctionList: {
  name: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (this: any, ...args: any[]) => any;
  /** JSONata function signature string in format `<params:return>` */
  type: string;
}[] = [
  /* ============================================
   * DATE FUNCTIONS
   * ============================================ */
  /** Converts date to 'YYYY-MM-DD' format, returns current date if invalid */
  {
    name: '_dateWithoutTime',
    func: getValidDateWithoutTime,
    type: '<(sl)-:s>',
  },

  /** Checks if input is a valid date */
  { name: '_isValidDate', func: isValidDate, type: '<(sl)-:b>' },

  /** Checks if string is exactly in 'YYYY-MM-DD' format (strict parsing) */
  {
    name: '_isValidDateWithoutTime',
    func: isValidDateWithoutTime,
    type: '<(sl)-:b>',
  },

  /* ============================================
   * STRING FUNCTIONS
   * ============================================ */
  /** Removes everything from regex pattern match to end of string */
  { name: '_removeAfter', func: removeAfter, type: '<(sl)-(sl)-(sl)?:s>' },

  /** Converts string to camelCase */
  { name: '_camelCase', func: camelCase, type: '<(sl):s>' },

  /** Converts string to snake_case */
  { name: '_snakeCase', func: snakeCase, type: '<(sl):s>' },

  /** Converts string to kebab-case */
  { name: '_kebabCase', func: kebabCase, type: '<(sl):s>' },

  /** Capitalizes first character, lowercases rest */
  { name: '_capitalize', func: capitalize, type: '<(sl):s>' },

  /** Converts first character to upper case */
  { name: '_upperFirst', func: upperFirst, type: '<(sl):s>' },

  /** Removes leading/trailing whitespace or specified characters */
  { name: '_trim', func: trim, type: '<(sl)(sl)?:s>' },

  /** Pads string on both sides to target length */
  { name: '_pad', func: pad, type: '<(sl)n(sl)?:s>' },

  /* ============================================
   * NUMBER FUNCTIONS
   * ============================================ */
  /** Floors number to specified decimal places (default: 0) */
  { name: '_floor', func: floor, type: '<(ns)-n?:n>' },

  /** Clamps number within lower and upper bounds */
  { name: '_clamp', func: clamp, type: '<nnn:n>' },

  /** Produces a random number between bounds */
  { name: '_random', func: random, type: '<n?n?b?:n>' },

  /* ============================================
   * ARRAY FUNCTIONS
   * ============================================ */
  /** Removes all falsy values from array (null, undefined, false, '', 0, NaN) */
  { name: '_compact', func: compact, type: '<x:a>' },

  /** Returns length of string, array, or number */
  { name: '_length', func: length, type: '<x:n>' },

  /** Creates array of unique values */
  { name: '_uniq', func: uniq, type: '<a:a>' },

  /** Flattens array one level deep */
  { name: '_flatten', func: flatten, type: '<a:a>' },

  /** Recursively flattens array to single level */
  { name: '_flattenDeep', func: flattenDeep, type: '<a:a>' },

  /** Gets first element of array */
  { name: '_first', func: first, type: '<a:x>' },

  /** Gets last element of array */
  { name: '_last', func: last, type: '<a:x>' },

  /** Gets all but the first element */
  { name: '_tail', func: tail, type: '<a:a>' },

  /** Takes first n elements from array */
  { name: '_take', func: take, type: '<an?:a>' },

  /** Drops first n elements from array */
  { name: '_drop', func: drop, type: '<an?:a>' },

  /** Reverses an array (non-mutating) */
  { name: '_reverse', func: reverse, type: '<a:a>' },

  /** Creates array of grouped elements from multiple arrays */
  { name: '_zip', func: zip, type: '<a+:a>' },

  /** Groups array elements by property value */
  { name: '_groupBy', func: groupBy, type: '<as:o>' },

  /** Creates object keyed by property value */
  { name: '_keyBy', func: keyBy, type: '<as:o>' },

  /** Extracts property values from array of objects */
  { name: '_pluck', func: pluck, type: '<as:a>' },

  /* ============================================
   * OBJECT FUNCTIONS
   * ============================================ */
  /** Gets value at path of object with optional default */
  { name: '_get', func: get, type: '<osx?:x>' },

  /** Checks if path exists in object */
  { name: '_has', func: has, type: '<os:b>' },

  /** Gets array of object's own property names */
  { name: '_keys', func: keys, type: '<o:a>' },

  /** Gets array of object's own property values */
  { name: '_values', func: values, type: '<o:a>' },

  /** Converts object to array of [key, value] pairs */
  { name: '_entries', func: entries, type: '<o:a>' },

  /** Creates object from array of [key, value] pairs */
  { name: '_fromEntries', func: fromEntries, type: '<a:o>' },

  /** Picks specified properties from object */
  { name: '_pick', func: pick, type: '<oa:o>' },

  /** Omits specified properties from object */
  { name: '_omit', func: omit, type: '<oa:o>' },

  /** Recursively merges objects */
  { name: '_merge', func: merge, type: '<o+:o>' },

  /* ============================================
   * UTILITY/CHECK FUNCTIONS
   * ============================================ */
  /** Checks if value is empty (null, '', [], {}) */
  { name: '_isEmpty', func: isEmpty, type: '<x:b>' },

  /** Checks if value is null or undefined */
  { name: '_isNil', func: isNil, type: '<x:b>' },
];
