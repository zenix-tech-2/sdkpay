export const STANDARD_FEE_RATE = 0.04;

/** 50% off fees during an active reduced-fee period (referral reward). */
export function momoFeeRate(user: { reducedFeeUntil?: Date | string | null }) {
  if (user.reducedFeeUntil && new Date(user.reducedFeeUntil).getTime() > Date.now()) {
    return STANDARD_FEE_RATE / 2;
  }
  return STANDARD_FEE_RATE;
}

export function hasReducedFees(user: { reducedFeeUntil?: Date | string | null }) {
  return momoFeeRate(user) < STANDARD_FEE_RATE;
}
