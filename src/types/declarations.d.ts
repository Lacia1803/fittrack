declare module 'date-fns' {
  export function format(date: Date | number, formatStr: string, options?: any): string;
  export function subDays(date: Date | number, amount: number): Date;
}

declare module 'date-fns/locale' {
  export const vi: any;
}
