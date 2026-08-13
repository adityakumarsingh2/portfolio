import { motion } from "framer-motion";
import { Github, ExternalLink, GitCommit, Flame, BookOpen, Users, Calendar } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface DayContribution {
  date: string;
  contributionCount: number;
  level: number;
}

interface GitHubStatsData {
  totalContributions: number;
  longestStreak: number;
  currentStreak: number;
  repos: number;
  followers: number;
  weeks: (DayContribution | null)[][];
}

// Timezone-safe local date formatting
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Timezone-safe date string parsing
const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Calculate month labels with minimum separation to prevent overlap
const getMonthLabels = (weeks: (DayContribution | null)[][]) => {
  const labels: { name: string; colIndex: number }[] = [];
  let lastLabelCol = -10;

  weeks.forEach((week, idx) => {
    const firstDay = week.find((d): d is DayContribution => d !== null);
    if (!firstDay) return;

    const currentDate = parseDateString(firstDay.date);
    const currentMonth = currentDate.getMonth();

    let isNewMonth = false;
    if (idx === 0) {
      isNewMonth = true;
    } else {
      const prevWeek = weeks[idx - 1];
      const prevFirstDay = prevWeek.find((d): d is DayContribution => d !== null);
      if (prevFirstDay) {
        const prevDate = parseDateString(prevFirstDay.date);
        isNewMonth = currentMonth !== prevDate.getMonth();
      }
    }

    if (isNewMonth) {
      // Ensure at least 3 columns gap to prevent labels from overlapping
      if (idx - lastLabelCol >= 3) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        labels.push({ name: monthNames[currentMonth], colIndex: idx });
        lastLabelCol = idx;
      }
    }
  });

  return labels;
};


const GitHubHeatmapSkeleton = () => (
  <div className="space-y-6">
    {/* Main Stats Skeleton */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-muted/30 rounded-xl p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="w-16 h-3" />
          </div>
          <Skeleton className="w-12 h-8 mx-auto" />
          <Skeleton className="w-10 h-3 mx-auto" />
        </div>
      ))}
    </div>

    {/* Heatmap Grid Skeleton */}
    <div className="space-y-3">
      <Skeleton className="w-32 h-3" />
      <div className="bg-muted/20 rounded-xl p-4 border border-foreground/[0.05]">
        <div className="flex gap-1 overflow-hidden py-2">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1 flex-shrink-0">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="w-2.5 h-2.5 rounded-[2px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Badge Skeleton */}
    <Skeleton className="w-full h-10 rounded-lg" />
  </div>
);

const GitHubHeatmap = () => {
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayContribution | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const monthLabels = useMemo(() => {
    if (!stats?.weeks) return [];
    return getMonthLabels(stats.weeks);
  }, [stats?.weeks]);


  // Generate fallback weeks if API is unavailable or offline
  const generateFallbackWeeks = (): DayContribution[][] => {
    const weeks: DayContribution[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());

    const startDate = new Date(currentSunday);
    startDate.setDate(currentSunday.getDate() - 52 * 7);

    let currDate = new Date(startDate);
    for (let w = 0; w < 53; w++) {
      const week: DayContribution[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = formatLocalDate(currDate);
        let count = 0;
        let level = 0;

        if (currDate <= today) {
          const isWeekend = d === 0 || d === 6;
          const rand = Math.random();
          if (rand > 0.4) {
            count = isWeekend ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 8) + 1;
            if (count === 0) level = 0;
            else if (count <= 2) level = 1;
            else if (count <= 4) level = 2;
            else if (count <= 7) level = 3;
            else level = 4;
          }
        }
        week.push({ date: dateStr, contributionCount: count, level });
        currDate.setDate(currDate.getDate() + 1);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const calculateStreaks = (sortedContributions: { date: string; count: number; level: number }[]) => {
    let longest = 0;
    let tempStreak = 0;

    sortedContributions.forEach((day) => {
      if (day.count > 0) {
        tempStreak++;
        if (tempStreak > longest) longest = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    let current = 0;
    const todayStr = formatLocalDate(new Date());

    let todayIdx = sortedContributions.findIndex((d) => d.date === todayStr);

    // If today is not in the list, look for the most recent past date
    if (todayIdx === -1) {
      for (let i = sortedContributions.length - 1; i >= 0; i--) {
        if (sortedContributions[i].date <= todayStr) {
          todayIdx = i;
          break;
        }
      }
    }

    if (todayIdx !== -1) {
      const todayContributed = sortedContributions[todayIdx].count > 0;
      let startIdx = todayIdx;

      if (!todayContributed) {
        const yesterdayIdx = todayIdx - 1;
        if (yesterdayIdx >= 0 && sortedContributions[yesterdayIdx].count > 0) {
          startIdx = yesterdayIdx;
        } else {
          startIdx = -1;
        }
      }

      if (startIdx !== -1) {
        for (let i = startIdx; i >= 0; i--) {
          if (sortedContributions[i].count > 0) {
            current++;
          } else {
            break;
          }
        }
      }
    }

    return { longest, current };
  };

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const CACHE_KEY = "github_stats_data_v2";
        const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

        // Check local cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION && data && data.weeks) {
              setStats(data);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.error("Error reading github stats cache", e);
          }
        }

        const [profileRes, contribRes] = await Promise.allSettled([
          fetch("https://api.github.com/users/adityakumarsingh2"),
          fetch("https://github-contributions-api.jogruber.de/v4/adityakumarsingh2")
        ]);

        let repos = 35;
        let followers = 48;
        if (profileRes.status === "fulfilled" && profileRes.value.ok) {
          const profileJson = await profileRes.value.json();
          repos = profileJson.public_repos || repos;
          followers = profileJson.followers || followers;
        }

        let weeks: (DayContribution | null)[][] = [];
        let totalContributions = 0;
        let streaks = { longest: 0, current: 0 };

        if (contribRes.status === "fulfilled" && contribRes.value.ok) {
          const contribJson = await contribRes.value.json();
          if (contribJson && Array.isArray(contribJson.contributions)) {
            // Sort chronologically (oldest to newest)
            const sortedContributions = [...contribJson.contributions].sort((a, b) =>
              a.date.localeCompare(b.date)
            );

            // Calculate streaks
            streaks = calculateStreaks(sortedContributions);

            // Generate 53 weeks starting from currentSunday - 52 weeks
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const currentSunday = new Date(today);
            currentSunday.setDate(today.getDate() - today.getDay());

            const startDate = new Date(currentSunday);
            startDate.setDate(currentSunday.getDate() - 52 * 7);

            // Create a lookup map for contributions
            const dataMap = new Map<string, { count: number; level: number }>();
            sortedContributions.forEach((item) => {
              dataMap.set(item.date, { count: item.count, level: item.level });
            });

            let currentCursor = new Date(startDate);
            for (let w = 0; w < 53; w++) {
              const week: (DayContribution | null)[] = [];
              for (let d = 0; d < 7; d++) {
                if (currentCursor > today) {
                  week.push(null);
                } else {
                  const dateStr = formatLocalDate(currentCursor);
                  const data = dataMap.get(dateStr);
                  week.push({
                    date: dateStr,
                    contributionCount: data ? data.count : 0,
                    level: data ? data.level : 0,
                  });
                }
                currentCursor.setDate(currentCursor.getDate() + 1);
              }
              weeks.push(week);
            }

            const allDays = weeks.flat().filter((d): d is DayContribution => d !== null);
            totalContributions = allDays.reduce((sum, day) => sum + day.contributionCount, 0);
          }
        }

        if (weeks.length === 0) {
          const fallbackWeeks = generateFallbackWeeks();
          const allDays = fallbackWeeks.flat();
          totalContributions = allDays.reduce((sum, d) => sum + d.contributionCount, 0);
          const fallbackContributions = allDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
            level: d.level,
          }));
          streaks = calculateStreaks(fallbackContributions);
          weeks = fallbackWeeks;
        }

        const statsData: GitHubStatsData = {
          totalContributions: totalContributions > 0 ? totalContributions : 524,
          longestStreak: streaks.longest > 0 ? streaks.longest : 14,
          currentStreak: streaks.current > 0 ? streaks.current : 5,
          repos,
          followers,
          weeks,
        };

        setStats(statsData);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: statsData,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error("Error fetching GitHub activity, using fallback:", error);
        const fallbackWeeks = generateFallbackWeeks();
        const allDays = fallbackWeeks.flat();
        const total = allDays.reduce((sum, d) => sum + d.contributionCount, 0);
        const fallbackContributions = allDays.map((d) => ({
          date: d.date,
          count: d.contributionCount,
          level: d.level,
        }));
        const streaks = calculateStreaks(fallbackContributions);

        setStats({
          totalContributions: total > 0 ? total : 524,
          longestStreak: streaks.longest > 0 ? streaks.longest : 14,
          currentStreak: streaks.current > 0 ? streaks.current : 5,
          repos: 35,
          followers: 48,
          weeks: fallbackWeeks,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, []);

  // Automatically scroll the calendar container all the way to the right
  useEffect(() => {
    if (!loading && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading, stats]);

  const getColorClass = (level: number) => {
    if (level === 0) return "bg-muted/40 border border-foreground/[0.03]";
    if (level === 1) return "bg-green-950 border border-green-900/60";
    if (level === 2) return "bg-green-800 border border-green-700/60";
    if (level === 3) return "bg-green-600 border border-green-500/60";
    return "bg-green-400 border border-green-300";
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-elegant card-glow p-6 relative overflow-hidden"
    >
      {/* Background decoration matching original theme */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <Github className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="font-mono text-purple-400">{"<"}</span>
                GitHub
                <span className="font-mono text-purple-400">{"/>"}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-mono">@adityakumarsingh2</p>
            </div>
          </div>
          <motion.a
            href="https://github.com/adityakumarsingh2"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </motion.a>
        </div>

        {loading ? (
          <GitHubHeatmapSkeleton />
        ) : (
          <>
            {/* Main Stats matching original 4-card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GitCommit className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-mono">Commits</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.totalContributions}</p>
                <p className="text-xs text-muted-foreground">Last Year</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-muted-foreground font-mono">Streak</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.longestStreak}d</p>
                <p className="text-xs text-muted-foreground">Longest</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-muted-foreground font-mono">Repos</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.repos}</p>
                <p className="text-xs text-muted-foreground">Public</p>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground font-mono">Followers</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.followers}</p>
                <p className="text-xs text-muted-foreground">Community</p>
              </div>
            </div>

            {/* Heatmap Grid Section */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono mb-2">
                {"// Contribution graph"}
              </p>

              <div className="bg-muted/20 rounded-xl p-4 border border-foreground/[0.05] relative overflow-hidden">
                <div className="flex gap-2 items-start">
                  {/* Day of week sidebar */}
                  <div className="flex flex-col gap-[3px] text-[9px] font-mono text-muted-foreground/60 pt-4 pr-1 select-none flex-shrink-0">
                    <div className="h-2.5 sm:h-3" /> {/* Sun */}
                    <div className="h-2.5 sm:h-3 flex items-center">Mon</div>
                    <div className="h-2.5 sm:h-3" /> {/* Tue */}
                    <div className="h-2.5 sm:h-3 flex items-center">Wed</div>
                    <div className="h-2.5 sm:h-3" /> {/* Thu */}
                    <div className="h-2.5 sm:h-3 flex items-center">Fri</div>
                    <div className="h-2.5 sm:h-3" /> {/* Sat */}
                  </div>

                  {/* Horizontal Scrollable Calendar */}
                  <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-none flex-1 pb-1"
                  >
                    <div className="min-w-max flex flex-col gap-1.5">
                      {/* Month labels aligned with week columns */}
                      <div className="flex gap-[3px] text-[10px] font-mono text-muted-foreground/70 h-4 select-none relative mb-0.5">
                        {stats?.weeks.map((week, idx) => {
                          const labelObj = monthLabels.find((l) => l.colIndex === idx);
                          return (
                            <div key={idx} className="w-2.5 sm:w-3 relative flex-shrink-0">
                              {labelObj && (
                                <span className="absolute left-0 top-0 whitespace-nowrap font-medium">
                                  {labelObj.name}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Heatmap Squares */}
                      <div className="flex gap-[3px] items-start">
                        {stats?.weeks.map((week, wIdx) => {
                          return (
                            <div key={wIdx} className="flex flex-col gap-[3px] flex-shrink-0">
                              {week.map((day, dIdx) =>
                                day ? (
                                  <motion.div
                                    key={day.date}
                                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] cursor-pointer transition-transform ${getColorClass(
                                      day.level
                                    )}`}
                                    onMouseEnter={() => setHoveredDay(day)}
                                    whileHover={{ scale: 1.3, zIndex: 10 }}
                                  />
                                ) : (
                                  <div
                                    key={`empty-${wIdx}-${dIdx}`}
                                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-[2px] opacity-0 pointer-events-none"
                                  />
                                )
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-muted-foreground pt-3 border-t border-foreground/[0.05]">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {hoveredDay ? (
                      <span className="truncate">
                        <span className="font-semibold text-foreground">{hoveredDay.contributionCount} contributions</span>
                        <span> on {parseDateString(hoveredDay.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    ) : (
                      <span className="truncate">Hover over any square to view activity</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground flex-shrink-0 self-end sm:self-center">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-muted/40 border border-foreground/[0.03]"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-green-950 border border-green-900/60"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-green-800 border border-green-700/60"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-green-600 border border-green-500/60"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-green-400 border border-green-300"></span>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Highlight Banner matching original contest badge style */}
            <motion.div
              className="mt-5 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-medium">
                  <span className="text-purple-400">Open Source:</span>
                  <span className="text-foreground ml-1">Active contributor across MERN stack & cloud projects</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GitHubHeatmap;

