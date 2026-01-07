import { motion } from "framer-motion";
import { Code2, Trophy, Target, TrendingUp, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LeetCodeData {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

const LeetCodeStatsSkeleton = () => (
  <div className="space-y-6">
    {/* Main Stats Skeleton */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-muted/30 rounded-xl p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-16 h-3" />
        </div>
        <Skeleton className="w-12 h-8 mx-auto" />
        <Skeleton className="w-10 h-3 mx-auto" />
      </div>
      <div className="bg-muted/30 rounded-xl p-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-14 h-3" />
        </div>
        <Skeleton className="w-14 h-8 mx-auto" />
        <Skeleton className="w-10 h-3 mx-auto" />
      </div>
    </div>

    {/* Difficulty Breakdown Skeleton */}
    <div className="space-y-3">
      <Skeleton className="w-32 h-3" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-16 h-3" />
          <Skeleton className="flex-1 h-2 rounded-full" />
          <Skeleton className="w-8 h-4" />
        </div>
      ))}
    </div>

    {/* Contest Badge Skeleton */}
    <Skeleton className="w-full h-10 rounded-lg" />
  </div>
);

const LeetCodeStats = () => {
  const [stats, setStats] = useState<LeetCodeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Using LeetCode GraphQL API via proxy
        const response = await fetch(
          "https://leetcode-stats-api.herokuapp.com/adityakumarsingh2"
        );
        const data = await response.json();
        
        if (data.status === "success") {
          setStats({
            totalSolved: data.totalSolved || 0,
            easySolved: data.easySolved || 0,
            mediumSolved: data.mediumSolved || 0,
            hardSolved: data.hardSolved || 0,
            ranking: data.ranking || 0,
          });
        }
      } catch (error) {
        console.log("Using fallback LeetCode stats");
        // Fallback to known stats from resume
        setStats({
          totalSolved: 150,
          easySolved: 60,
          mediumSolved: 70,
          hardSolved: 20,
          ranking: 500000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const difficulties = [
    { label: "Easy", count: stats?.easySolved || 0, color: "text-green-400", bg: "bg-green-400" },
    { label: "Medium", count: stats?.mediumSolved || 0, color: "text-yellow-400", bg: "bg-yellow-400" },
    { label: "Hard", count: stats?.hardSolved || 0, color: "text-red-400", bg: "bg-red-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="card-elegant card-glow p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Code2 className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <span className="font-mono text-purple-400">{"<"}</span>
                LeetCode
                <span className="font-mono text-purple-400">{"/>"}</span>
              </h3>
              <p className="text-xs text-muted-foreground font-mono">@adityakumarsingh2</p>
            </div>
          </div>
          <motion.a
            href="https://leetcode.com/adityakumarsingh2"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </motion.a>
        </div>

        {loading ? (
          <LeetCodeStatsSkeleton />
        ) : (
          <>
            {/* Main Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-mono">Problems</span>
                </div>
                <p className="text-3xl font-bold text-foreground">{stats?.totalSolved}</p>
                <p className="text-xs text-muted-foreground">Solved</p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground font-mono">Ranking</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.ranking ? `${Math.round(stats.ranking / 1000)}k` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Global</p>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono mb-2">
                {"// Difficulty breakdown"}
              </p>
              {difficulties.map((diff, index) => (
                <motion.div
                  key={diff.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className={`text-xs font-mono w-16 ${diff.color}`}>{diff.label}</span>
                  <div className="flex-1 h-2 bg-muted/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${diff.bg} rounded-full`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(diff.count / (stats?.totalSolved || 1)) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{diff.count}</span>
                </motion.div>
              ))}
            </div>

            {/* Contest Badge */}
            <motion.div
              className="mt-5 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium">
                  <span className="text-amber-500">Contest 470:</span>
                  <span className="text-foreground ml-1">Rank 1543 / 30.7k+</span>
                </span>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default LeetCodeStats;
