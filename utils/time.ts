import { sub } from "date-fns";
import moment from "moment";

export const ONE_SECOND_MS = 1000;

export const ONE_MINUTE = 1000 * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;

export const ONE_DAY_SECONDS = 86400;
export const ONE_WEEK_SECONDS = ONE_DAY_SECONDS * 7;
export const ONE_MONTH_SECONDS = ONE_DAY_SECONDS * 30;
export const THREE_MONTHS_SECONDS = ONE_DAY_SECONDS * 90;
export const ONE_YEAR_SECONDS = ONE_DAY_SECONDS * 365;

export const BSC_BLOCKS_PER_DAY = 28800;

export function getPreviousThursday(date: Date = new Date()): Date {
  let daysSinceThursday = date.getDay() - 4;
  if (daysSinceThursday < 0) daysSinceThursday += 7;

  return sub(date, {
    days: daysSinceThursday,
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  });
}

export function getCurrentEpochStartTime() {
  const lastThursday = getPreviousThursday();
  const startOfCurrentEpoch = moment(lastThursday.getTime()).utc().startOf("day");

  return {
    moment: startOfCurrentEpoch,
    ts: startOfCurrentEpoch.unix(),
  };
}

// Assumes initial epoch was already set
export function getStartOfNextEpoch(momentObj: moment.Moment) {
  return momentObj.add(1, "week").startOf("day").utc();
}

export function getStartOfLastEpoch(momentObj: moment.Moment) {
  return momentObj.subtract(1, "week").startOf("day").utc();
}

export function getPreviousEpoch(weeksToGoBack = 0): Date {
  const now = new Date();
  const todayAtMidnightUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  let daysSinceThursday = now.getDay() - 4;
  if (daysSinceThursday < 0) daysSinceThursday += 7;

  daysSinceThursday = daysSinceThursday + weeksToGoBack * 7;

  return sub(todayAtMidnightUTC, {
    days: daysSinceThursday,
  });
}

export function toUnixTimestamp(jsTimestamp: number): number {
  return Math.round(jsTimestamp / ONE_SECOND_MS);
}

export function getPreviousEpochUnix(weeksToGoBack = 0): number {
  const now = moment();
  const todayAtMidnightUTC = moment().utc();

  let daysSinceThursday = now.diff(4, "days");
  if (daysSinceThursday) {
    daysSinceThursday += 7;
  }

  daysSinceThursday = daysSinceThursday + weeksToGoBack * 7;

  return todayAtMidnightUTC.subtract(daysSinceThursday, "days").unix();
}

export function secondsToDate(seconds: number) {
  return new Date(seconds * 1000).toLocaleString();
}
