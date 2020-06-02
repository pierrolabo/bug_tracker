import { GET_ERRORS, CLEAR_ERRORS } from './types';

//  Return ERRORS
export const returnErrors = (msg, status, id = null) => {
  return {
    type: GET_ERRORS,
    payload: { msg, status, id },
  };
};

//  Clear ERRORS
export const clearErrors = () => {
  return {
    type: CLEAR_ERRORS,
  };
};
