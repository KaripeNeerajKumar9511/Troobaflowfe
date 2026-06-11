import { describe, it, expect } from 'vitest';
import {
  assignBackwardTimes,
  calcCriticalPathTime,
  scheduleIbomTree,
  findCriticalPathIds,
  schedulePolePath,
  type IbomScheduleNode,
} from '@/lib/ibomSchedule';

function node(id: string, flowTime: number, children: IbomScheduleNode[] = []): IbomScheduleNode {
  return { id, flowTime, children };
}

describe('ibomSchedule', () => {
  it('leaf critical path equals flow time', () => {
    const n = node('a', 12);
    expect(calcCriticalPathTime(n)).toBe(12);
    expect(n.criticalPathTime).toBe(12);
  });

  it('critical path picks longest child branch', () => {
    const tree = node('root', 10, [
      node('slow', 20),
      node('fast', 5),
    ]);
    expect(calcCriticalPathTime(tree)).toBe(30);
  });

  it('backward schedule: root end = critical path, child end = parent start', () => {
    const tree = node('root', 10, [
      node('slow', 20),
      node('fast', 5),
    ]);
    scheduleIbomTree(tree);

    expect(tree.endTime).toBe(30);
    expect(tree.startTime).toBe(20);

    const slow = tree.children[0];
    const fast = tree.children[1];
    expect(slow.endTime).toBe(20);
    expect(slow.startTime).toBe(0);
    expect(fast.endTime).toBe(20);
    expect(fast.startTime).toBe(15);
  });

  it('clamps start time at zero when endTime - flowTime is negative', () => {
    const n = node('x', 20);
    assignBackwardTimes(n, 5);
    expect(n.startTime).toBe(0);
  });

  it('findCriticalPathIds follows max child branch', () => {
    const tree = node('root', 10, [
      node('slow', 20),
      node('fast', 5),
    ]);
    scheduleIbomTree(tree);
    const ids = findCriticalPathIds(tree);
    expect(ids.has('root')).toBe(true);
    expect(ids.has('slow')).toBe(true);
    expect(ids.has('fast')).toBe(false);
  });

  it('schedulePolePath matches linear chain totals', () => {
    const pole = schedulePolePath([
      { id: 'root', flowTime: 10 },
      { id: 'mid', flowTime: 15 },
      { id: 'leaf', flowTime: 5 },
    ]);
    expect(pole.criticalPathTime).toBe(30);
    expect(pole.endTime).toBe(30);
    expect(pole.startTime).toBe(20);
    expect(pole.stepTimes).toHaveLength(3);
    expect(pole.stepTimes[2].startTime).toBe(0);
    expect(pole.stepTimes[2].endTime).toBe(5);
  });
});
