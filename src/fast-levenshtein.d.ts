declare module 'fast-levenshtein' {
  interface LevenshteinStatic {
    get: (str1: string, str2: string) => number;
  }
  const levenshtein: LevenshteinStatic;
  export = levenshtein;
}