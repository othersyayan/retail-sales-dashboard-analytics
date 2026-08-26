import { Gender } from './sales';

export interface DashboardFilterState {
  page: number;
  limit: number;
  search: string;
  category: string;
  gender: Gender | '';
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: DashboardFilterState = {
  page: 1,
  limit: 10,
  search: '',
  category: '',
  gender: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'transactionId',
  sortOrder: 'asc',
};
