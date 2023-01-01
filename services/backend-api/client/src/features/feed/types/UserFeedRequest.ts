import {
  InferType, number, object, string,
} from 'yup';

export enum UserFeedRequestStatus {
  OK = 'OK',
  FAILED = 'FAILED',
  FETCH_ERROR = 'FETCH_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
}

export const UserFeedRequestSchema = object({
  id: number().required(),
  status: string().oneOf(Object.values(UserFeedRequestStatus)).required(),
  createdAt: number().required(),
});

export type UserFeedRequest = InferType<typeof UserFeedRequestSchema>;