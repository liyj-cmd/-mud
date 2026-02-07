const SHICHEN = [
  { label: "子时", start: 23, end: 1 },
  { label: "丑时", start: 1, end: 3 },
  { label: "寅时", start: 3, end: 5 },
  { label: "卯时", start: 5, end: 7 },
  { label: "辰时", start: 7, end: 9 },
  { label: "巳时", start: 9, end: 11 },
  { label: "午时", start: 11, end: 13 },
  { label: "未时", start: 13, end: 15 },
  { label: "申时", start: 15, end: 17 },
  { label: "酉时", start: 17, end: 19 },
  { label: "戌时", start: 19, end: 21 },
  { label: "亥时", start: 21, end: 23 }
];

export const DEFAULT_TIME = {
  day: 1,
  hour: 6,
  minute: 0
};

export function createTimeSystem({ onTick, stepMinutes = 10, intervalMs = 1000 }) {
  let timer = null;

  return {
    start() {
      if (timer) {
        return;
      }
      timer = setInterval(() => {
        onTick(stepMinutes);
      }, intervalMs);
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  };
}

export function advanceTime(timeState, minutes) {
  const next = {
    day: timeState.day,
    hour: timeState.hour,
    minute: timeState.minute
  };

  let left = Math.max(0, minutes);
  while (left > 0) {
    const chunk = Math.min(left, 60 - next.minute);
    next.minute += chunk;
    left -= chunk;

    if (next.minute >= 60) {
      next.minute = 0;
      next.hour += 1;
      if (next.hour >= 24) {
        next.hour = 0;
        next.day += 1;
      }
    }
  }

  return next;
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function getShichenLabel(hour) {
  for (const branch of SHICHEN) {
    if (isHourInRange(hour, branch.start, branch.end)) {
      return branch.label;
    }
  }
  return "子时";
}

export function formatGameTime(timeState) {
  return `第${timeState.day}天 ${pad2(timeState.hour)}:${pad2(timeState.minute)} ${getShichenLabel(timeState.hour)}`;
}

export function isHourInRange(hour, startHour, endHour) {
  if (startHour === endHour) {
    return true;
  }
  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }
  return hour >= startHour || hour < endHour;
}
