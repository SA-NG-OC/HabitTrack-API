import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { StatsService } from './stats.service';
import { HabitsService } from './habits.service';
import { CheckIn } from '../checkins/schemas/checkin.schema';

describe('StatsService (Unit)', () => {
  let service: StatsService;
  let mockAggregate: jest.Mock;

  beforeEach(async () => {
    mockAggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: HabitsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ _id: '60d0fe4f5311236168a109cb' }),
          },
        },
        {
          provide: getModelToken(CheckIn.name),
          useValue: {
            aggregate: jest.fn().mockReturnValue({
              exec: mockAggregate,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHabitStats boundary cases', () => {
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');

    const getDateOffsetStr = (offset: number): string => {
      const d = new Date(today);
      d.setDate(today.getDate() - offset);
      return d.toLocaleDateString('en-CA');
    };

    it('should return 0 stats when there are no check-ins', async () => {
      mockAggregate.mockResolvedValue([]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats).toEqual({
        habitId: '60d0fe4f5311236168a109cb',
        currentStreak: 0,
        longestStreak: 0,
        completionRateLast30Days: 0,
        totalCheckIns: 0,
      });
    });

    it('should preserve longest streak after gaps and reset current streak if yesterday is missed', async () => {
      // Checked in 3 days ago, 4 days ago, 5 days ago (streak of 3)
      // Today (streak of 1)
      // Gap in between (yesterday/2 days ago missed)
      const dates = [
        getDateOffsetStr(5),
        getDateOffsetStr(4),
        getDateOffsetStr(3),
        todayStr,
      ].sort();

      mockAggregate.mockResolvedValue([{ dates, total: dates.length }]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats.currentStreak).toBe(1); // Only today
      expect(stats.longestStreak).toBe(3); // Historical streak [5, 4, 3 days ago]
      expect(stats.totalCheckIns).toBe(4);
    });

    it('should reset current streak to 0 if yesterday was missed and today is not checked in', async () => {
      // Checked in 2 days ago, 3 days ago
      // Yesterday missed, today not checked in
      const dates = [getDateOffsetStr(3), getDateOffsetStr(2)].sort();

      mockAggregate.mockResolvedValue([{ dates, total: dates.length }]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats.currentStreak).toBe(0); // Yesterday and today missed
      expect(stats.longestStreak).toBe(2);
    });

    it('should calculate 100% completion rate for all 30 days checked in', async () => {
      const dates: string[] = [];
      for (let i = 0; i < 30; i++) {
        dates.push(getDateOffsetStr(i));
      }
      dates.sort();

      mockAggregate.mockResolvedValue([{ dates, total: dates.length }]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats.completionRateLast30Days).toBe(1.0);
      expect(stats.currentStreak).toBe(30);
      expect(stats.longestStreak).toBe(30);
    });

    it('should calculate 50% completion rate for 15 check-ins out of 30 days', async () => {
      const dates: string[] = [];
      // Checked in every other day for 30 days
      for (let i = 0; i < 30; i += 2) {
        dates.push(getDateOffsetStr(i));
      }
      dates.sort();

      mockAggregate.mockResolvedValue([{ dates, total: dates.length }]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats.completionRateLast30Days).toBe(0.5);
      expect(stats.currentStreak).toBe(1); // Only today is checked in (index 0), yesterday missed (index 1)
      expect(stats.longestStreak).toBe(1);
    });

    it('should calculate 0% completion rate if all check-ins are older than 30 days', async () => {
      // Check-in was 40 days ago
      const dates = [getDateOffsetStr(40)];

      mockAggregate.mockResolvedValue([{ dates, total: dates.length }]);

      const stats = await service.getHabitStats('60d0fe4f5311236168a109ca', '60d0fe4f5311236168a109cb');

      expect(stats.completionRateLast30Days).toBe(0.0);
      expect(stats.totalCheckIns).toBe(1);
    });
  });
});
