import { addMonths, startOfMonth, setDate, isAfter, differenceInDays, format, addDays } from 'date-fns';

export type ReturnType = 'GSTR-1' | 'GSTR-3B' | 'GSTR-9' | 'GSTR-4';
export type FilerType = 'Monthly' | 'Quarterly';

export interface LateFeeParams {
  returnType: ReturnType;
  filerType: FilerType;
  isNil: boolean;
  taxDue: number;
  annualTurnover?: number;
  dueDate: Date;
  filingDate: Date;
}

export interface LateFeeResult {
  daysLate: number;
  cgstLateFee: number;
  sgstLateFee: number;
  interest: number;
  totalPayable: number;
  isMaxCap: boolean;
  isApproachingCap: boolean;
  maxCapValue: number;
}

export interface DueDateEntry {
  name: string;
  date: Date;
}

export const getDueDate = (returnType: ReturnType, filerType: FilerType, period: Date): Date => {
  const nextMonth = addMonths(startOfMonth(period), 1);
  
  switch (returnType) {
    case 'GSTR-1':
      return filerType === 'Monthly' 
        ? setDate(nextMonth, 11) 
        : setDate(addMonths(nextMonth, 1), 13); // Simplification for Quarterly
    
    case 'GSTR-3B':
      if (filerType === 'Monthly') return setDate(nextMonth, 20);
      // Simplify states: Cat1 = 22nd, Cat2 = 24th. Default to 22nd.
      return setDate(addMonths(nextMonth, 1), 22);
      
    case 'GSTR-9':
      // 31st Dec of next FY. For simplicity, just return 31st Dec of current year or next.
      return new Date(period.getFullYear() + 1, 11, 31);
      
    case 'GSTR-4':
      // 30th April of next FY.
      return new Date(period.getFullYear() + 1, 3, 30);
      
    default:
      return setDate(nextMonth, 20);
  }
};

export const calculateLateFee = (params: LateFeeParams): LateFeeResult => {
  const { returnType, isNil, taxDue, annualTurnover = 0, dueDate, filingDate } = params;
  
  let daysLate = differenceInDays(filingDate, dueDate);
  if (daysLate < 0) daysLate = 0;
  
  let ratePerDay = 0;
  let maxCapValue = 10000;
  
  switch (returnType) {
    case 'GSTR-1':
    case 'GSTR-3B':
      ratePerDay = isNil ? 20 : 50;
      maxCapValue = 10000;
      break;
    case 'GSTR-9':
      ratePerDay = 200;
      maxCapValue = annualTurnover * 0.0025;
      break;
    case 'GSTR-4':
      ratePerDay = isNil ? 20 : 50;
      maxCapValue = 2000;
      break;
  }
  
  let basicLateFee = daysLate * ratePerDay;
  let isMaxCap = false;
  
  if (basicLateFee > maxCapValue) {
    basicLateFee = maxCapValue;
    isMaxCap = true;
  }
  
  const cgstLateFee = basicLateFee / 2;
  const sgstLateFee = basicLateFee / 2;
  
  // Interest for GSTR-3B
  let interest = 0;
  if (returnType === 'GSTR-3B' && !isNil && taxDue > 0) {
    interest = (taxDue * 18 * daysLate) / (100 * 365);
  }
  
  const totalPayable = cgstLateFee + sgstLateFee + interest;
  const isApproachingCap = !isMaxCap && (maxCapValue - basicLateFee) <= 500 && basicLateFee > 0;
  
  return {
    daysLate,
    cgstLateFee,
    sgstLateFee,
    interest,
    totalPayable,
    isMaxCap,
    isApproachingCap,
    maxCapValue
  };
};

export const getUpcomingDueDates = (filerType: FilerType): DueDateEntry[] => {
  const today = new Date();
  const currentMonth = startOfMonth(today);
  
  const dates: DueDateEntry[] = [
    { name: 'GSTR-1', date: getDueDate('GSTR-1', filerType, currentMonth) },
    { name: 'GSTR-3B', date: getDueDate('GSTR-3B', filerType, currentMonth) },
    { name: 'GSTR-1 (Prev)', date: getDueDate('GSTR-1', filerType, addMonths(currentMonth, -1)) },
    { name: 'GSTR-3B (Prev)', date: getDueDate('GSTR-3B', filerType, addMonths(currentMonth, -1)) },
  ].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return dates.slice(0, 4);
};

export const formatIndianCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
