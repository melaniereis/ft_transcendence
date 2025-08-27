import { json as streamJson } from "stream/consumers";


// services/renderProfilePage.ts
export async function renderProfilePage(container: HTMLElement, onBadgeUpdate?: () => void) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    container.innerHTML = '<p>Please log in to view your profile.</p>';
    return;
  }

  // Types
  type Stats = {
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    win_rate: number;
    points_scored: number;
    points_conceded: number;
    tournaments_won: number;
  };

  type Match = {
    id: string;
    date_played: string;
    opponent_id: string;
    user_score: number;
    opponent_score: number;
    result: 'win' | 'loss';
    duration?: string;
  };

  type Friend = {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    online_status: boolean;
  };

  function getDefaultStats(): Stats {
    return {
      matches_played: 0,
      win_rate: 0,
      points_scored: 0,
      points_conceded: 0,
      matches_won: 0,
      matches_lost: 0,
      tournaments_won: 0
    };
  }

  let editMode = false;
  let originalProfile: any = {};
  let currentStats: Stats = getDefaultStats();
  let currentHistory: Match[] = [];
  let currentFriends: Friend[] = [];
  let activeStatsTab = 'overview'; // overview, performance, trends
  let activeHistoryView = 'list'; // list, detailed, analysis

  // Available avatars
  const availableAvatars = [
    '/assets/avatar/default.png',
    '/assets/avatar/Blue_002.png',
    '/assets/avatar/Blue_003.png',
    '/assets/avatar/Blue_004.png',
    '/assets/avatar/Blue_005.png',
    '/assets/avatar/Blue_006.png',
    '/assets/avatar/Blue_007.png',
    '/assets/avatar/Blue_008.png',
    '/assets/avatar/Blue_009.png',
    '/assets/avatar/Blue_010.png',
    '/assets/avatar/Blue_011.png',
    '/assets/avatar/Blue_012.png',
    '/assets/avatar/Blue_013.png',
    '/assets/avatar/Blue_014.png',
    '/assets/avatar/Blue_015.png',
    '/assets/avatar/Blue_016.png',
    '/assets/avatar/Blue_017.png',
    '/assets/avatar/Blue_018.png',
    '/assets/avatar/Blue_019.png',
    '/assets/avatar/Blue_020.png'
  ];

  // Helper functions for enhanced statistics and analysis
  function calculateWinStreak(): number {
    let streak = 0;
    for (let i = currentHistory.length - 1; i >= 0; i--) {
      if (currentHistory[i].result === 'win') {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  function getBestPerformance(): { score: string, match?: Match } {
    if (!currentHistory.length) return { score: 'N/A' };
    const bestMatch = currentHistory.reduce((best, current) => {
      return current.user_score > best.user_score ? current : best;
    });
    return { score: bestMatch.user_score.toString(), match: bestMatch };
  }

  function getGamesThisWeek(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return currentHistory.filter(match => new Date(match.date_played) >= weekAgo).length;
  }

  function getMostActiveTime(): string {
    if (!currentHistory.length) return 'N/A';
    const timeSlots: { [key: string]: number } = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-18
      evening: 0,   // 18-24
      night: 0      // 0-6
    };

    currentHistory.forEach(match => {
      const hour = new Date(match.date_played).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else if (hour >= 18 && hour < 24) timeSlots.evening++;
      else timeSlots.night++;
    });

    const mostActive = Object.entries(timeSlots).reduce((a, b) => timeSlots[a[0]] > timeSlots[b[0]] ? a : b);
    return mostActive[0].charAt(0).toUpperCase() + mostActive[0].slice(1);
  }

  function getPerformanceRankings(): Array<{label: string, value: string, description: string, color: string, icon: string}> {
    const avgScore = currentStats.matches_played ? (currentStats.points_scored / currentStats.matches_played).toFixed(1) : '0';
    const consistency = getConsistencyScore();
    const clutchFactor = getClutchFactor();
    
    return [
      {
        label: 'Average Score',
        value: avgScore,
        description: 'Points per match',
        color: parseFloat(avgScore) >= 10 ? '#28a745' : '#ffc107',
        icon: '⚡'
      },
      {
        label: 'Consistency',
        value: `${consistency}%`,
        description: 'Performance stability',
        color: consistency >= 70 ? '#28a745' : consistency >= 50 ? '#ffc107' : '#dc3545',
        icon: '🎯'
      },
      {
        label: 'Clutch Factor',
        value: `${clutchFactor}%`,
        description: 'Close game wins',
        color: clutchFactor >= 60 ? '#28a745' : '#ffc107',
        icon: '🔥'
      }
    ];
  }

  function getAdvancedMetrics(): Array<{label: string, value: string, description: string, color: string, icon: string, trend?: number}> {
    return [
      {
        label: 'Dominance Rating',
        value: getDominanceRating().toString(),
        description: 'Overall game control',
        color: '#6f42c1',
        icon: '👑'
        // Remove fake trend
      },
      {
        label: 'Comeback Wins',
        value: getComebackWins().toString(),
        description: 'Wins from behind',
        color: '#fd7e14',
        icon: '🔄'
        // Remove fake trend
      },
      {
        label: 'Peak Performance',
        value: getBestPerformance().score,
        description: 'Highest single score',
        color: '#17a2b8',
        icon: '🏔️'
        // Remove fake trend
      },
      {
        label: 'Efficiency Score',
        value: getEfficiencyScore().toFixed(1),
        description: 'Performance per match',
        color: '#e83e8c',
        icon: '⚡'
        // Remove fake trend
      }
    ];
  }

  function getTrendMetrics(): Array<{label: string, value: string, period: string, change: number, color: string, icon: string}> {
    const avgScore = currentStats.matches_played > 0 ? (currentStats.points_scored / currentStats.matches_played).toFixed(1) : '0';
    
    return [
      {
        label: 'Win Rate',
        value: `${(currentStats.win_rate * 100).toFixed(1)}%`,
        period: 'current stats',
        change: 0, // Remove fake trend data
        color: '#28a745',
        icon: '🏆'
      },
      {
        label: 'Avg Score',
        value: avgScore,
        period: 'per match',
        change: 0, // Remove fake trend data
        color: '#007bff',
        icon: '📊'
      },
      {
        label: 'Games/Week',
        value: getGamesThisWeek().toString(),
        period: 'this week',
        change: 0, // Remove fake trend data
        color: '#17a2b8',
        icon: '🎮'
      },
      {
        label: 'Total Matches',
        value: currentStats.matches_played.toString(),
        period: 'all time',
        change: 0, // Remove fake trend data
        color: '#6f42c1',
        icon: '📈'
      }
    ];
  }

  function getGoalProgress(): Array<{label: string, current: number, target: number, color: string}> {
    return [
      {
        label: 'Monthly Wins',
        current: currentStats.matches_won || 0,
        target: 20,
        color: '#28a745'
      },
      {
        label: 'Win Rate Target',
        current: Math.floor((currentStats.win_rate || 0) * 100),
        target: 75,
        color: '#007bff'
      },
      {
        label: 'Score Average',
        current: currentStats.matches_played ? Math.floor(currentStats.points_scored / currentStats.matches_played) : 0,
        target: 15,
        color: '#ffc107'
      },
      {
        label: 'Tournament Wins',
        current: currentStats.tournaments_won || 0,
        target: 3,
        color: '#dc3545'
      }
    ];
  }

  function getAverageScore(): string {
    if (!currentHistory.length) return '0';
    const total = currentHistory.reduce((sum, match) => sum + match.user_score, 0);
    return (total / currentHistory.length).toFixed(1);
  }

  function getLongestWinStreak(): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    currentHistory.forEach(match => {
      if (match.result === 'win') {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }

  function getMatchType(scoreDiff: number): {label: string, color: string} {
    if (scoreDiff <= 2) return {label: 'NAIL-BITER', color: '#dc3545'};
    if (scoreDiff <= 5) return {label: 'CLOSE', color: '#ffc107'};
    if (scoreDiff <= 10) return {label: 'COMPETITIVE', color: '#17a2b8'};
    return {label: 'DOMINANT', color: '#28a745'};
  }

  function getPerformanceIndicators(match: Match): Array<{label: string, color: string}> {
    const indicators = [];
    const scoreDiff = Math.abs(match.user_score - match.opponent_score);
    
    if (match.user_score >= 15) indicators.push({label: 'HIGH SCORER', color: '#28a745'});
    if (scoreDiff <= 2) indicators.push({label: 'THRILLER', color: '#dc3545'});
    if (match.user_score > match.opponent_score && scoreDiff >= 10) indicators.push({label: 'DOMINATION', color: '#6f42c1'});
    if (match.user_score === 0) indicators.push({label: 'SHUTOUT', color: '#fd7e14'});
    
    return indicators;
  }

  function getConsistencyScore(): number {
    if (!currentHistory.length) return 0;
    const scores = currentHistory.map(m => m.user_score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg <= 0) return 0; // Proteção contra divisão por zero
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    return Math.max(0, Math.floor(100 - (stdDev / avg) * 100));
  }

  function getClutchFactor(): number {
    const closeGames = currentHistory.filter(match => Math.abs(match.user_score - match.opponent_score) <= 3);
    if (!closeGames.length) return 0;
    const closeWins = closeGames.filter(match => match.result === 'win');
    return Math.floor((closeWins.length / closeGames.length) * 100);
  }

  function getDominanceRating(): number {
    if (!currentHistory.length) return 0;
    const dominantWins = currentHistory.filter(match => 
      match.result === 'win' && (match.user_score - match.opponent_score) >= 7
    );
    return Math.floor((dominantWins.length / currentHistory.length) * 100);
  }

  function getComebackWins(): number {
    // Simplified calculation based on available data
    return currentHistory.filter(m => 
      m.result === 'win' && m.user_score > m.opponent_score && m.opponent_score > m.user_score * 0.7
    ).length;
  }

  function getEfficiencyScore(): number {
    // Simulated efficiency calculation
    if (!currentStats.matches_played) return 0;
    return (currentStats.points_scored / currentStats.matches_played) / 2.5; // Assuming avg match duration
  }

  function getPerformancePatterns(): Array<{label: string, value: string, description: string, color: string}> {
    return [
      {
        label: 'Best Day',
        value: getBestPlayingDay(),
        description: 'Highest win rate',
        color: '#28a745'
      },
      {
        label: 'Preferred Time',
        value: getMostActiveTime(),
        description: 'Most active period',
        color: '#007bff'
      },
      {
        label: 'Streak Potential',
        value: `${Math.min(getLongestWinStreak() + 2, 15)}`,
        description: 'Max possible streak',
        color: '#ffc107'
      },
      {
        label: 'Momentum',
        value: getCurrentMomentum(),
        description: 'Recent trend',
        color: '#17a2b8'
      }
    ];
  }

  function getOpponentAnalysis(): Array<{id: string, matches: number, winRate: number, record: string}> {
    const opponents: { [key: string]: { wins: number, total: number } } = {};
    currentHistory.forEach(match => {
      const oppId = match.opponent_id;
      if (!opponents[oppId]) {
        opponents[oppId] = { wins: 0, total: 0 };
      }
      opponents[oppId].total++;
      if (match.result === 'win') opponents[oppId].wins++;
    });

    return Object.entries(opponents)
      .map(([id, data]: [string, any]) => ({
        id,
        matches: data.total,
        winRate: Math.floor((data.wins / data.total) * 100),
        record: `${data.wins}W-${data.total - data.wins}L`
      }))
      .sort((a, b) => b.matches - a.matches)
      .slice(0, 5);
  }

  function getBestPlayingDay(): string {
    if (!currentHistory.length) return 'N/A';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayStats: { [key: string]: { wins: number, total: number } } = {};
    
    currentHistory.forEach(match => {
      const day = days[new Date(match.date_played).getDay()];
      if (!dayStats[day]) dayStats[day] = { wins: 0, total: 0 };
      dayStats[day].total++;
      if (match.result === 'win') dayStats[day].wins++;
    });

    const bestDay = Object.entries(dayStats)
      .map(([day, stats]: [string, any]) => ({ day, winRate: stats.wins / stats.total }))
      .sort((a, b) => b.winRate - a.winRate)[0];

    return bestDay ? bestDay.day : 'N/A';
  }

  function getCurrentMomentum(): string {
    if (currentHistory.length < 5) return 'Building';
    const recent = currentHistory.slice(-5);
    const recentWins = recent.filter(m => m.result === 'win').length;
    
    if (recentWins >= 4) return 'Hot Streak';
    if (recentWins >= 3) return 'Positive';
    if (recentWins === 2) return 'Stable';
    return 'Recovery Mode';
  }

  // Chart rendering functions (using HTML5 Canvas)
  function renderCharts() {
    setTimeout(() => {
      try {
        renderWinRateChart();
        renderPerformanceChart();
        renderTrendsChart();
        renderActivityHeatmap();
        renderWinLossChart();
        renderScoreDistribution();
        renderTimeAnalysisChart();
        renderWeeklyChart();
      } catch (e) {
        console.log('Charts will render when elements are available');
      }
    }, 100);
  }

  function renderWinRateChart() {
    const canvas = document.getElementById('winRateChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const winRate = currentStats.win_rate * 100;
    const lossRate = 100 - winRate;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw donut chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 60;
    const innerRadius = 35;
    
    // Win arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, (winRate / 100) * 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, (winRate / 100) * 2 * Math.PI, 0, true);
    ctx.fillStyle = '#28a745';
    ctx.fill();
    
    // Loss arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, (winRate / 100) * 2 * Math.PI, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, (winRate / 100) * 2 * Math.PI, true);
    ctx.fillStyle = '#dc3545';
    ctx.fill();
    
    // Center text
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${winRate.toFixed(1)}%`, centerX, centerY + 5);
    
    // Legend
    ctx.font = '12px Arial';
    ctx.fillStyle = '#28a745';
    ctx.fillText(`Wins: ${currentStats.matches_won}`, centerX - 60, canvas.height - 20);
    ctx.fillStyle = '#dc3545';
    ctx.fillText(`Losses: ${currentStats.matches_lost}`, centerX + 60, canvas.height - 20);
  }

  function renderPerformanceChart() {
    const canvas = document.getElementById('performanceChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple bar chart of recent performance
    const recentMatches = currentHistory.slice(-10).reverse();
    const barWidth = canvas.width / recentMatches.length - 5;
    const maxScore = Math.max(...recentMatches.map(m => m.user_score), 20);
    
    recentMatches.forEach((match, i) => {
      const barHeight = (match.user_score / maxScore) * (canvas.height - 40);
      const x = i * (barWidth + 5);
      const y = canvas.height - barHeight - 20;
      
      ctx.fillStyle = match.result === 'win' ? '#28a745' : '#dc3545';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Score labels
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(match.user_score.toString(), x + barWidth/2, canvas.height - 5);
    });
  }

  function renderTrendsChart() {
    const canvas = document.getElementById('trendsChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw trend line based on real match history
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    if (currentHistory.length < 2) {
      // Not enough data for trends
      ctx.fillStyle = '#666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data for trend analysis', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    // Calculate win rate over time from real data
    const trendData: Array<{match: number, winRate: number}> = [];
    let wins = 0;
    
    currentHistory.forEach((match, i) => {
      if (match.result === 'win') wins++;
      const winRate = (wins / (i + 1)) * 100;
      trendData.push({ match: i + 1, winRate });
    });
    
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    trendData.forEach((point, i) => {
      const x = padding + (i / (trendData.length - 1)) * chartWidth;
      const y = padding + (1 - point.winRate / 100) * chartHeight;
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('100%', 5, padding + 10);
    ctx.fillText('0%', 5, padding + chartHeight);
    ctx.textAlign = 'center';
    ctx.fillText('First Match', padding, canvas.height - 5);
    ctx.fillText('Latest Match', padding + chartWidth, canvas.height - 5);
  }

  function renderActivityHeatmap() {
    const canvas = document.getElementById('activityHeatmap') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const days = 7;
    const cellWidth = canvas.width / days;
    const cellHeight = canvas.height;
    
    // Generate activity data for last 7 days
    for (let i = 0; i < days; i++) {
      const activity = Math.random();
      const intensity = Math.floor(activity * 255);
      
      ctx.fillStyle = `rgba(40, 167, 69, ${activity})`;
      ctx.fillRect(i * cellWidth, 0, cellWidth - 2, cellHeight);
      
      // Day labels
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i];
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(dayName, i * cellWidth + cellWidth/2, cellHeight - 10);
    }
  }

  function renderWinLossChart() {
    const canvas = document.getElementById('winLossChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    renderWinRateChart(); // Reuse the same logic
  }

  function renderScoreDistribution() {
    const canvas = document.getElementById('scoreDistribution') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create score distribution histogram
    const scores = currentHistory.map(m => m.user_score);
    const maxScore = Math.max(...scores, 20);
    const buckets = Array(6).fill(0); // 0-3, 4-7, 8-11, 12-15, 16-19, 20+
    
    scores.forEach(score => {
      const bucketIndex = Math.min(Math.floor(score / 4), 5);
      buckets[bucketIndex]++;
    });
    
    const maxCount = Math.max(...buckets);
    const barWidth = canvas.width / buckets.length - 5;
    
    buckets.forEach((count, i) => {
      const barHeight = maxCount > 0 ? (count / maxCount) * (canvas.height - 40) : 0;
      const x = i * (barWidth + 5);
      const y = canvas.height - barHeight - 20;
      
      ctx.fillStyle = '#17a2b8';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Labels
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const label = i === 5 ? '20+' : `${i*4}-${i*4+3}`;
      ctx.fillText(label, x + barWidth/2, canvas.height - 5);
    });
  }

  function renderTimeAnalysisChart() {
    const canvas = document.getElementById('timeAnalysisChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Show performance by hour of day
    const hourlyData = Array(24).fill(0);
    const hourlyWins = Array(24).fill(0);
    
    currentHistory.forEach(match => {
      const hour = new Date(match.date_played).getHours();
      hourlyData[hour]++;
      if (match.result === 'win') hourlyWins[hour]++;
    });
    
    const maxGames = Math.max(...hourlyData, 1);
    const barWidth = canvas.width / 24 - 1;
    
    for (let hour = 0; hour < 24; hour++) {
      const games = hourlyData[hour];
      const winRate = games > 0 ? hourlyWins[hour] / games : 0;
      
      const barHeight = (games / maxGames) * (canvas.height - 30);
      const x = hour * (barWidth + 1);
      const y = canvas.height - barHeight - 20;
      
      // Color based on win rate
      const green = Math.floor(winRate * 255);
      const red = Math.floor((1 - winRate) * 255);
      ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Hour labels (show every 4 hours)
      if (hour % 4 === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${hour}h`, x + barWidth/2, canvas.height - 5);
      }
    }
  }

  function renderWeeklyChart() {
    const canvas = document.getElementById('weeklyChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate real weekly data from match history
    const weekData: Array<{week: string, games: number, wins: number}> = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);
      
      const weekMatches = currentHistory.filter(match => {
        const matchDate = new Date(match.date_played);
        return matchDate >= weekStart && matchDate < weekEnd;
      });
      
      const weekWins = weekMatches.filter(match => match.result === 'win').length;
      
      weekData.push({
        week: `Week ${4 - i}`,
        games: weekMatches.length,
        wins: weekWins
      });
    }
    
    if (weekData.every(week => week.games === 0)) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No matches in last 4 weeks', canvas.width / 2, canvas.height / 2);
      return;
    }
    
    const barWidth = canvas.width / weekData.length - 10;
    const maxGames = Math.max(...weekData.map(w => w.games), 1);
    
    weekData.forEach((week, i) => {
      const barHeight = (week.games / maxGames) * (canvas.height - 40);
      const x = i * (barWidth + 10) + 5;
      const y = canvas.height - barHeight - 20;
      
      // Games bar
      ctx.fillStyle = '#007bff';
      ctx.fillRect(x, y, barWidth * 0.6, barHeight);
      
      // Wins bar
      const winHeight = (week.wins / maxGames) * (canvas.height - 40);
      const winY = canvas.height - winHeight - 20;
      ctx.fillStyle = '#28a745';
      ctx.fillRect(x + barWidth * 0.4, winY, barWidth * 0.6, winHeight);
      
      // Labels
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(week.week, x + barWidth/2, canvas.height - 5);
    });
  }

  // Main load and render function
  async function loadAndRender() {
    console.log('🔍 Starting loadAndRender...');
    console.log('🎫 Token found:', token);
    
    try {
      console.log('📡 Fetching profile from /api/profile...');
      const res = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('📊 Response status:', res.status);
      console.log('✅ Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Failed to fetch profile: ${res.status} - ${errorText}`);
      }
      
      const profile = await res.json();
      console.log('👤 Profile loaded successfully:', profile);
      originalProfile = { ...profile };

      console.log('📊 Loading additional data for user ID:', profile.id);
      await Promise.all([
        loadStats(profile.id),
        loadHistory(),
        loadFriends()
      ]);

      console.log('✅ All data loaded successfully!');
      console.log('📊 Current stats:', currentStats);
      console.log('🎮 Current history:', currentHistory.length, 'matches');
      console.log('👥 Current friends:', currentFriends.length, 'friends');

      console.log('🎨 Starting to render content...');
      renderContent(profile, editMode);
      console.log('🎨 Content rendered successfully!');

      console.log('🔧 Setting up event listeners...');
      setupEventListeners();
      console.log('🔧 Event listeners set up!');

      try { onBadgeUpdate?.(); } catch { /* ignore */ }
      console.log('✨ Profile page loaded completely!');
    } catch (error: unknown) {
      console.error('💥 Full error details:', error);
      const message = error instanceof Error ? error.message : 'Error loading profile. Please try again.';
      container.innerHTML = `<p>${message}</p>`;
    }
  }

  // Data loading functions
  async function loadStats(userId: number) {
    console.log('📈 Loading stats for user:', userId);
    try {
      const res = await fetch(`/stats/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('📈 Stats response status:', res.status);
      if (res.ok) {
        const json = await res.json();
        console.log('📈 Stats loaded:', json);
        currentStats = {
          matches_played: json.matches_played ?? 0,
          matches_won: json.matches_won ?? 0,
          matches_lost: json.matches_lost ?? 0,
          win_rate: json.win_rate ?? 0,
          points_scored: json.points_scored ?? 0,
          points_conceded: json.points_conceded ?? 0,
          tournaments_won: json.tournaments_won ?? 0
        };
      } else {
        const errorText = await res.text();
        console.warn('📈 Stats failed:', res.status, errorText);
        currentStats = getDefaultStats();
      }
    } catch (error: unknown) {
      console.error('Failed to load stats:', error);
      currentStats = getDefaultStats();
    }
  }

  async function loadHistory() {
    console.log('🎮 Loading match history...');
    try {
      const res = await fetch('/api/match-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('🎮 History response status:', res.status);
      if (res.ok) {
        currentHistory = await res.json();
        console.log('🎮 History loaded:', currentHistory.length, 'matches');
      } else {
        const errorText = await res.text();
        console.warn('🎮 History failed:', res.status, errorText);
        currentHistory = [];
      }
    } catch (error: unknown) {
      console.error('Failed to load match history:', error);
      currentHistory = [];
    }
  }

  async function loadFriends() {
    console.log('👥 Loading friends...');
    try {
      const res = await fetch('/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('👥 Friends response status:', res.status);
      if (res.ok) {
        const friendsData = await res.json();
        console.log('👥 Friends response data:', friendsData);
        
        // Verificar se é array ou tem array aninhado
        if (Array.isArray(friendsData)) {
          currentFriends = friendsData;
        } else if (friendsData.friends && Array.isArray(friendsData.friends)) {
          currentFriends = friendsData.friends;
        } else if (friendsData.data && Array.isArray(friendsData.data)) {
          currentFriends = friendsData.data;
        } else {
          console.warn('👥 Friends data is not an array:', friendsData);
          currentFriends = [];
        }
        
        console.log('👥 Friends loaded:', currentFriends.length, 'friends');
      } else {
        const errorText = await res.text();
        console.warn('👥 Friends failed:', res.status, errorText);
        currentFriends = [];
      }
    } catch (error: unknown) {
      console.error('Failed to load friends:', error);
      currentFriends = [];
    }
  }

  function renderContent(profile: any, isEdit: boolean) {
    const avatarSection = isEdit
      ? `
      <div style="text-align:center;margin-bottom:15px">
        <div style="position:relative;display:inline-block">
          <img id="avatar-preview" src="${profile.avatar_url}" width="100" height="100"
               style="border-radius:50%;border:3px solid #ddd;object-fit:cover;cursor:pointer" alt="Avatar"/>
          <div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);
                      border-radius:50%;display:flex;align-items:center;justify-content:center;
                      opacity:0;transition:opacity 0.3s;cursor:pointer" id="avatar-overlay">
            <span style="color:white;font-size:14px;font-weight:bold">📷 Change</span>
          </div>
        </div>
        <div style="margin-top:10px">
          <button id="avatar-btn" type="button" style="background:#17a2b8;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
            📷 Choose Avatar
          </button>
        </div>
      </div>`
      : `
      <div style="text-align:center;margin-bottom:15px">
        <img src="${profile.avatar_url}" width="100" height="100"
             style="border-radius:50%;border:3px solid #ddd;object-fit:cover" alt="Avatar"/>
      </div>`;

    const profileHeader = isEdit
      ? `
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
        <div style="display:flex;align-items:flex-start;gap:20px">
          ${avatarSection}
          <div style="flex:1">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:15px">
              <div>
                <label style="display:block;margin-bottom:5px;font-weight:bold">Username:</label>
                <input id="username-input" type="text" value="${profile.username}" required minlength="3"
                       style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
                <small style="color:#666">Min 3 characters</small>
              </div>
              <div>
                <label style="display:block;margin-bottom:5px;font-weight:bold">Display Name:</label>
                <input id="display-input" type="text" value="${profile.display_name || profile.name}" required
                       style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
                <small style="color:#666">Public name shown in games</small>
              </div>
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Email:</label>
              <input id="email-input" type="email" value="${profile.email || ''}"
                     style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px"/>
              <small style="color:#666">Optional - for account recovery</small>
            </div>
            <div style="display:grid;grid-template-columns:auto auto auto;gap:10px;justify-content:start">
              <button id="save-btn" style="background:#28a745;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-weight:bold">
                💾 Save Changes
              </button>
              <button id="cancel-btn" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                ❌ Cancel
              </button>
              <button id="pass-btn" style="background:#ffc107;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                🔒 Change Password
              </button>
            </div>
            <div id="save-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
          </div>
        </div>
        <div style="margin-top:15px;padding-top:15px;border-top:1px solid #ddd">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;font-size:14px">
            <div><strong>Team:</strong> ${profile.team}</div>
            <div><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</div>
            <div><strong>Last seen:</strong> ${new Date(profile.last_seen).toLocaleString()}</div>
            <div><strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'}</div>
          </div>
        </div>
      </div>`
      : `
      <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin:15px 0">
        <div style="display:flex;align-items:center;gap:20px">
          ${avatarSection}
          <div style="flex:1">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <h3 style="margin:0;color:#333">@${profile.username}</h3>
              <button id="edit-btn" title="Edit profile"
                      style="background:none;border:none;cursor:pointer;font-size:18px;color:#007bff">
                🖊️
              </button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:15px">
              <div><strong>Display Name:</strong> ${profile.display_name || profile.name}</div>
              <div><strong>Email:</strong> ${profile.email || 'Not provided'}</div>
              <div><strong>Team:</strong> ${profile.team}</div>
              <div><strong>Member since:</strong> ${new Date(profile.created_at).toLocaleDateString()}</div>
            </div>
            <div style="font-size:12px;color:#666">
              <strong>Status:</strong> ${profile.online_status ? '🟢 Online' : '🔴 Offline'} • 
              <strong>Last seen:</strong> ${new Date(profile.last_seen).toLocaleString()}
            </div>
          </div>
        </div>
      </div>`;

    container.innerHTML = `
      <div style="max-width:1400px;margin:0 auto;padding:20px">
        <h2 style="color:#333;border-bottom:3px solid #007bff;padding-bottom:10px;margin-bottom:20px">
          👤 Profile Dashboard
        </h2>
        ${profileHeader}
        <div style="display:grid;grid-template-columns:2fr 1fr;gap:30px;margin-top:30px">
          <div>
            <!-- Enhanced Statistics Dashboard -->
            <div style="background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);margin-bottom:30px">
              <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
                <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">
                  📊 Gaming Statistics Dashboard
                </h3>
                <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Comprehensive view of your gaming performance</p>
              </div>
              
              <!-- Stats Tab Navigation -->
              <div style="display:flex;border-bottom:1px solid #e9ecef;background:#f8f9fa">
                <button class="stats-tab ${activeStatsTab === 'overview' ? 'active' : ''}" data-tab="overview"
                        style="flex:1;padding:12px 20px;border:none;background:${activeStatsTab === 'overview' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeStatsTab === 'overview' ? '#007bff' : 'transparent'};
                               cursor:pointer;font-weight:${activeStatsTab === 'overview' ? 'bold' : 'normal'};color:#333">
                  📈 Overview
                </button>
                <button class="stats-tab ${activeStatsTab === 'performance' ? 'active' : ''}" data-tab="performance"
                        style="flex:1;padding:12px 20px;border:none;background:${activeStatsTab === 'performance' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeStatsTab === 'performance' ? '#007bff' : 'transparent'};
                               cursor:pointer;font-weight:${activeStatsTab === 'performance' ? 'bold' : 'normal'};color:#333">
                  🎯 Performance
                </button>
                <button class="stats-tab ${activeStatsTab === 'trends' ? 'active' : ''}" data-tab="trends"
                        style="flex:1;padding:12px 20px;border:none;background:${activeStatsTab === 'trends' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeStatsTab === 'trends' ? '#007bff' : 'transparent'};
                               cursor:pointer;font-weight:${activeStatsTab === 'trends' ? 'bold' : 'normal'};color:#333">
                  📊 Trends
                </button>
              </div>
              
              <div id="stats-content" style="padding:20px">
                ${renderStatsContent()}
              </div>
            </div>

            <!-- Enhanced Match History Dashboard -->
            <div style="background:#fff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">
              <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);color:#fff;padding:20px;border-radius:12px 12px 0 0">
                <h3 style="margin:0;font-size:20px;display:flex;align-items:center;gap:10px">
                  🏆 Match History Dashboard
                </h3>
                <p style="margin:5px 0 0 0;opacity:0.9;font-size:14px">Detailed analysis of your game sessions</p>
              </div>
              
              <!-- History Tab Navigation -->
              <div style="display:flex;border-bottom:1px solid #e9ecef;background:#f8f9fa">
                <button class="history-tab ${activeHistoryView === 'list' ? 'active' : ''}" data-view="list"
                        style="flex:1;padding:12px 20px;border:none;background:${activeHistoryView === 'list' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeHistoryView === 'list' ? '#f5576c' : 'transparent'};
                               cursor:pointer;font-weight:${activeHistoryView === 'list' ? 'bold' : 'normal'};color:#333">
                  📋 Match List
                </button>
                <button class="history-tab ${activeHistoryView === 'detailed' ? 'active' : ''}" data-view="detailed"
                        style="flex:1;padding:12px 20px;border:none;background:${activeHistoryView === 'detailed' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeHistoryView === 'detailed' ? '#f5576c' : 'transparent'};
                               cursor:pointer;font-weight:${activeHistoryView === 'detailed' ? 'bold' : 'normal'};color:#333">
                  🔍 Detailed View
                </button>
                <button class="history-tab ${activeHistoryView === 'analysis' ? 'active' : ''}" data-view="analysis"
                        style="flex:1;padding:12px 20px;border:none;background:${activeHistoryView === 'analysis' ? '#fff' : 'transparent'};
                               border-bottom:3px solid ${activeHistoryView === 'analysis' ? '#f5576c' : 'transparent'};
                               cursor:pointer;font-weight:${activeHistoryView === 'analysis' ? 'bold' : 'normal'};color:#333">
                  📈 Analysis
                </button>
              </div>
              
              <div id="history-content" style="padding:20px">
                ${renderHistoryContent()}
              </div>
            </div>
          </div>
          <div>
            <h3 style="color:#333;border-bottom:2px solid #dc3545;padding-bottom:8px;margin-bottom:15px">
              👥 Friends
            </h3>
            <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px">
              <h4 style="margin:0 0 10px 0;font-size:14px;color:#666">Add New Friend</h4>
              <div style="display:flex;gap:8px">
                <input id="friend-input" placeholder="Enter username..."
                       style="flex:1;padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px"/>
                <button id="friend-add" style="background:#007bff;color:#fff;border:none;padding:8px 12px;border-radius:4px;cursor:pointer;font-size:14px">
                  ➕ Add
                </button>
              </div>
              <div id="friend-msg" style="margin-top:8px;font-size:12px"></div>
            </div>
            <div id="friends-container">${renderFriendsContent()}</div>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <div id="notification" style="display:none;position:fixed;top:20px;right:20px;background:#28a745;color:#fff;padding:15px 20px;border-radius:5px;z-index:1000;max-width:300px"></div>
      
      <!-- Avatar Modal -->
      <div id="avatar-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:2000">
        <div style="background:#fff;padding:30px;border-radius:15px;width:600px;max-width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="margin:0;color:#333;font-size:20px">🖼️ Choose Your Avatar</h3>
            <button id="avatar-modal-close" style="background:none;border:none;font-size:24px;cursor:pointer;color:#999;width:30px;height:30px;display:flex;align-items:center;justify-content:center">×</button>
          </div>
          <p style="color:#666;margin-bottom:20px;font-size:14px">Select an avatar from the options below:</p>
          <div id="avatar-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(80px,1fr));gap:12px">
            ${availableAvatars.map((avatar, i) => `
              <div class="avatar-option" data-avatar="${avatar}"
                   style="cursor:pointer;border:3px solid transparent;border-radius:12px;padding:8px;transition:all 0.3s;background:#f8f9fa">
                <img src="${avatar}" width="64" height="64"
                     style="border-radius:50%;object-fit:cover;display:block;width:100%"
                     alt="Avatar ${i+1}"/>
              </div>
            `).join('')}
          </div>
          <div style="margin-top:20px;text-align:center">
            <button id="avatar-confirm" disabled style="background:#007bff;color:#fff;border:none;padding:12px 24px;border-radius:6px;cursor:pointer;font-size:14px;opacity:0.5">
              Select Avatar
            </button>
          </div>
        </div>
      </div>

      <!-- Password Modal -->
      <div id="pass-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);justify-content:center;align-items:center;z-index:2000">
        <div style="background:#fff;padding:30px;border-radius:10px;width:400px;max-width:90%;box-shadow:0 10px 30px rgba(0,0,0,0.3)">
          <h3 style="margin:0 0 20px 0;color:#333">🔒 Change Password</h3>
          <form id="pass-form">
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Current Password:</label>
              <input id="pass-cur" type="password" required
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
            </div>
            <div style="margin-bottom:15px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">New Password:</label>
              <input id="pass-new" type="password" minlength="6" required
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
              <small style="color:#666">Minimum 6 characters</small>
            </div>
            <div style="margin-bottom:20px">
              <label style="display:block;margin-bottom:5px;font-weight:bold">Confirm Password:</label>
              <input id="pass-conf" type="password" minlength="6" required
                     style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box"/>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:10px">
              <button type="button" id="pass-cancel" style="background:#6c757d;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                Cancel
              </button>
              <button type="submit" style="background:#007bff;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer">
                Update Password
              </button>
            </div>
            <div id="pass-error" style="color:#dc3545;margin-top:10px;font-size:14px"></div>
          </form>
        </div>
      </div>
    `;

    // Render charts after DOM is ready
    renderCharts();
  }

  function renderHistoryContent(): string {
    if (!currentHistory.length) {
      return '<div style="padding:40px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px"><div style="font-size:48px;margin-bottom:15px">🎮</div><h4 style="margin:0 0 10px 0">No Match History</h4><p style="margin:0;color:#999">Your game history will appear here once you start playing!</p></div>';
    }

    switch (activeHistoryView) {
      case 'list':
        return renderHistoryList();
      case 'detailed':
        return renderHistoryDetailed();
      case 'analysis':
        return renderHistoryAnalysis();
      default:
        return renderHistoryList();
    }
  }

  function renderHistoryList(): string {
    const recentMatches = currentHistory.slice(0, 10); // Show last 10 matches
    
    return `
      <div>
        <!-- Quick Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:15px;margin-bottom:25px">
          <div style="background:linear-gradient(135deg, #28a74515, #28a74505);padding:15px;border-radius:10px;border-left:4px solid #28a745;text-align:center">
            <div style="font-size:20px;font-weight:bold;color:#28a745">${currentHistory.filter(m => m.result === 'win').length}</div>
            <div style="font-size:12px;color:#666">Total Wins</div>
          </div>
          <div style="background:linear-gradient(135deg, #dc354515, #dc354505);padding:15px;border-radius:10px;border-left:4px solid #dc3545;text-align:center">
            <div style="font-size:20px;font-weight:bold;color:#dc3545">${currentHistory.filter(m => m.result === 'loss').length}</div>
            <div style="font-size:12px;color:#666">Total Losses</div>
          </div>
          <div style="background:linear-gradient(135deg, #007bff15, #007bff05);padding:15px;border-radius:10px;border-left:4px solid #007bff;text-align:center">
            <div style="font-size:20px;font-weight:bold;color:#007bff">${getAverageScore()}</div>
            <div style="font-size:12px;color:#666">Avg Score</div>
          </div>
          <div style="background:linear-gradient(135deg, #ffc10715, #ffc10705);padding:15px;border-radius:10px;border-left:4px solid #ffc107;text-align:center">
            <div style="font-size:20px;font-weight:bold;color:#ffc107">${getLongestWinStreak()}</div>
            <div style="font-size:12px;color:#666">Best Streak</div>
          </div>
        </div>

        <!-- Recent Matches -->
        <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <div style="background:#f8f9fa;padding:15px;border-bottom:1px solid #e9ecef">
            <h4 style="margin:0;color:#333">🕒 Recent Matches</h4>
          </div>
          <div style="max-height:400px;overflow-y:auto">
            ${recentMatches.map((match, index) => {
              const isWin = match.result === 'win';
              const scoreDiff = Math.abs(match.user_score - match.opponent_score);
              const matchType = getMatchType(scoreDiff);
              
              return `
                <div style="padding:15px;border-bottom:1px solid #f1f3f4;display:flex;align-items:center;gap:15px;transition:background 0.2s;cursor:pointer" 
                     onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='#fff'"
                     onclick="showMatchDetails('${match.id}')">
                  <!-- Match Result Icon -->
                  <div style="width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                              background:${isWin ? '#28a745' : '#dc3545'};color:#fff;font-weight:bold;font-size:18px">
                    ${isWin ? '🏆' : '❌'}
                  </div>
                  
                  <!-- Match Info -->
                  <div style="flex:1">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                      <span style="font-weight:bold;color:#333">vs Player ${match.opponent_id}</span>
                      <span style="background:${matchType.color};color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:bold">
                        ${matchType.label}
                      </span>
                    </div>
                    <div style="font-size:13px;color:#666">
                      ${new Date(match.date_played).toLocaleDateString()} • ${new Date(match.date_played).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <!-- Score -->
                  <div style="text-align:right">
                    <div style="font-family:monospace;font-size:18px;font-weight:bold;color:#333">
                      ${match.user_score} - ${match.opponent_score}
                    </div>
                    <div style="font-size:12px;color:${isWin ? '#28a745' : '#dc3545'};font-weight:bold">
                      ${isWin ? 'VICTORY' : 'DEFEAT'}
                    </div>
                  </div>
                  
                  <!-- Duration -->
                  <div style="text-align:center;min-width:60px">
                    <div style="font-size:14px;color:#666">⏱️</div>
                    <div style="font-size:12px;color:#666">${match.duration || 'N/A'}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          ${currentHistory.length > 10 ? `
            <div style="padding:15px;text-align:center;background:#f8f9fa;border-top:1px solid #e9ecef">
              <button onclick="loadMoreMatches()" style="background:#007bff;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer">
                📄 Load More Matches (${currentHistory.length - 10} remaining)
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function renderHistoryDetailed(): string {
    return `
      <div>
        <!-- Match Filter -->
        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <label style="font-weight:bold;color:#333">Filter:</label>
            <select id="match-filter" style="padding:6px 12px;border:1px solid #ddd;border-radius:4px;background:#fff">
              <option value="all">All Matches</option>
              <option value="wins">Wins Only</option>
              <option value="losses">Losses Only</option>
              <option value="close">Close Games</option>
              <option value="blowouts">Decisive Wins</option>
            </select>
            <select id="time-filter" style="padding:6px 12px;border:1px solid #ddd;border-radius:4px;background:#fff">
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>
            <button onclick="applyHistoryFilters()" style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">
              🔍 Apply
            </button>
          </div>
        </div>

        <!-- Detailed Match Cards -->
        <div id="filtered-matches" style="display:grid;gap:15px">
          ${currentHistory.slice(0, 6).map((match, index) => `
            <div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1);border-left:5px solid ${match.result === 'win' ? '#28a745' : '#dc3545'}">
              <!-- Match Header -->
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px">
                <div style="display:flex;align-items:center;gap:12px">
                  <div style="width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;
                              background:${match.result === 'win' ? '#28a745' : '#dc3545'};color:#fff;font-size:16px">
                    ${match.result === 'win' ? '🏆' : '❌'}
                  </div>
                  <div>
                    <h4 style="margin:0;color:#333">Match #${currentHistory.length - index}</h4>
                    <div style="font-size:13px;color:#666">${new Date(match.date_played).toLocaleString()}</div>
                  </div>
                </div>
                <div style="text-align:right">
                  <div style="font-family:monospace;font-size:24px;font-weight:bold;color:#333">
                    ${match.user_score} - ${match.opponent_score}
                  </div>
                  <div style="font-size:12px;color:${match.result === 'win' ? '#28a745' : '#dc3545'};font-weight:bold">
                    ${match.result === 'win' ? 'VICTORY' : 'DEFEAT'}
                  </div>
                </div>
              </div>

              <!-- Match Details -->
              <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-bottom:15px">
                <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                  <div style="font-size:12px;color:#666;margin-bottom:4px">OPPONENT</div>
                  <div style="font-weight:bold;color:#333">Player ${match.opponent_id}</div>
                </div>
                <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                  <div style="font-size:12px;color:#666;margin-bottom:4px">DURATION</div>
                  <div style="font-weight:bold;color:#333">${match.duration || 'Unknown'}</div>
                </div>
                <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                  <div style="font-size:12px;color:#666;margin-bottom:4px">SCORE DIFF</div>
                  <div style="font-weight:bold;color:${Math.abs(match.user_score - match.opponent_score) > 5 ? '#dc3545' : '#28a745'}">
                    ${Math.abs(match.user_score - match.opponent_score)} pts
                  </div>
                </div>
                <div style="background:#f8f9fa;padding:12px;border-radius:8px">
                  <div style="font-size:12px;color:#666;margin-bottom:4px">MATCH TYPE</div>
                  <div style="font-weight:bold;color:#333">${getMatchType(Math.abs(match.user_score - match.opponent_score)).label}</div>
                </div>
              </div>

              <!-- Performance Indicators -->
              <div style="display:flex;gap:10px;margin-bottom:15px">
                ${getPerformanceIndicators(match).map(indicator => `
                  <span style="background:${indicator.color};color:#fff;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:bold">
                    ${indicator.label}
                  </span>
                `).join('')}
              </div>

              <!-- Match Actions -->
              <div style="display:flex;gap:10px">
                <button onclick="viewMatchReplay('${match.id}')" style="background:#007bff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
                  📽️ View Replay
                </button>
                <button onclick="shareMatch('${match.id}')" style="background:#28a745;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
                  📤 Share
                </button>
                <button onclick="analyzeMatch('${match.id}')" style="background:#ffc107;color:#000;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:12px">
                  📊 Analyze
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderHistoryAnalysis(): string {
    return `
      <div>
        <!-- Analysis Overview -->
        <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:25px">
          <h4 style="margin:0 0 15px 0;color:#333">📈 Match Performance Analysis</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <canvas id="winLossChart" width="250" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
            </div>
            <div>
              <canvas id="scoreDistribution" width="250" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
            </div>
          </div>
        </div>

        <!-- Detailed Analytics -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px">
          <!-- Performance Patterns -->
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
            <h4 style="margin:0 0 15px 0;color:#333">🎯 Performance Patterns</h4>
            <div style="space-y:12px">
              ${getPerformancePatterns().map(pattern => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f8f9fa;border-radius:8px;margin-bottom:10px">
                  <div>
                    <div style="font-weight:bold;color:#333">${pattern.label}</div>
                    <div style="font-size:12px;color:#666">${pattern.description}</div>
                  </div>
                  <div style="font-weight:bold;color:${pattern.color}">${pattern.value}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Opponent Analysis -->
          <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
            <h4 style="margin:0 0 15px 0;color:#333">👥 Opponent Analysis</h4>
            <div style="space-y:10px">
              ${getOpponentAnalysis().map((opponent, index) => `
                <div style="display:flex;align-items:center;gap:12px;padding:8px;border-bottom:1px solid #f1f3f4">
                  <div style="width:30px;height:30px;border-radius:50%;background:#007bff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px">
                    ${index + 1}
                  </div>
                  <div style="flex:1">
                    <div style="font-weight:bold;color:#333">Player ${opponent.id}</div>
                    <div style="font-size:12px;color:#666">${opponent.matches} matches</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-weight:bold;color:${opponent.winRate >= 50 ? '#28a745' : '#dc3545'}">${opponent.winRate}%</div>
                    <div style="font-size:12px;color:#666">${opponent.record}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Time-based Analysis -->
        <div style="background:#fff;padding:20px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1)">
          <h4 style="margin:0 0 15px 0;color:#333">⏰ Time-based Performance</h4>
          <canvas id="timeAnalysisChart" width="800" height="250" style="width:100%;height:250px;background:#f8f9fa;border-radius:8px"></canvas>
        </div>
      </div>
    `;
  }

  function renderStatsTrends(): string {
    return `
      <div>
        <!-- Trend Overview -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:15px;margin-bottom:30px">
          ${getTrendMetrics().map(trend => `
            <div style="background:linear-gradient(135deg, ${trend.color}15, ${trend.color}05);padding:18px;border-radius:12px;border-left:4px solid ${trend.color}">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:20px">${trend.icon}</span>
                <div style="text-align:right">
                  <div style="font-size:16px;font-weight:bold;color:${trend.color}">${trend.value}</div>
                </div>
              </div>
              <div style="font-size:14px;font-weight:bold;color:#333">${trend.label}</div>
              <div style="font-size:12px;color:#666">${trend.period}</div>
            </div>
          `).join('')}
        </div>

        <!-- Performance Trends Chart -->
        <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:30px">
          <h4 style="margin:0 0 15px 0;color:#333">📈 Win Rate Progression</h4>
          <canvas id="trendsChart" width="800" height="300" style="width:100%;height:300px;background:#fff;border-radius:8px"></canvas>
        </div>

        <!-- Weekly Analysis -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333">📅 Weekly Breakdown</h4>
            <canvas id="weeklyChart" width="300" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
          </div>

          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333">🎯 Real Statistics</h4>
            <div style="space-y:15px">
              ${[
                {
                  label: 'Total Points',
                  current: currentStats.points_scored || 0,
                  target: Math.max(currentStats.points_scored * 1.5, 100),
                  color: '#28a745'
                },
                {
                  label: 'Matches Played',
                  current: currentStats.matches_played || 0,
                  target: Math.max(currentStats.matches_played * 1.5, 20),
                  color: '#007bff'
                },
                {
                  label: 'Tournament Wins',
                  current: currentStats.tournaments_won || 0,
                  target: Math.max(currentStats.tournaments_won + 2, 3),
                  color: '#dc3545'
                }
              ].map(goal => `
                <div style="margin-bottom:20px">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                    <span style="font-weight:bold;color:#333">${goal.label}</span>
                    <span style="color:${goal.color};font-weight:bold">${goal.current}/${goal.target}</span>
                  </div>
                  <div style="background:#e9ecef;border-radius:10px;height:8px;overflow:hidden">
                    <div style="background:${goal.color};height:100%;width:${Math.min((goal.current/goal.target*100), 100).toFixed(1)}%;transition:width 0.3s"></div>
                  </div>
                  <div style="font-size:12px;color:#666;margin-top:4px">${Math.min(((goal.current/goal.target)*100), 100).toFixed(1)}% progress</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStatsContent(): string {
    if (!currentStats || !currentStats.matches_played) {
      return '<div style="padding:40px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px"><div style="font-size:48px;margin-bottom:15px">📊</div><h4 style="margin:0 0 10px 0">No Statistics Available</h4><p style="margin:0;color:#999">Start playing games to see your performance data here!</p></div>';
    }

    switch (activeStatsTab) {
      case 'overview':
        return renderStatsOverview();
      case 'performance':
        return renderStatsPerformance();
      case 'trends':
        return renderStatsTrends();
      default:
        return renderStatsOverview();
    }
  }

  function renderStatsOverview(): string {
    const wr = (currentStats.win_rate * 100).toFixed(1);
    const kd = currentStats.points_conceded
      ? (currentStats.points_scored / currentStats.points_conceded).toFixed(2)
      : currentStats.points_scored.toString();

    // Enhanced metrics
    const avgPointsPerMatch = currentStats.matches_played ? (currentStats.points_scored / currentStats.matches_played).toFixed(1) : '0';
    const avgPointsConcededPerMatch = currentStats.matches_played ? (currentStats.points_conceded / currentStats.matches_played).toFixed(1) : '0';
    const winStreak = calculateWinStreak();
    const bestPerformance = getBestPerformance();

    return `
      <div>
        <!-- Key Performance Indicators -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:20px;margin-bottom:30px">
          ${[
            { label: 'Total Matches', value: currentStats.matches_played, color: '#007bff', icon: '🎮', subtitle: 'Games played' },
            { label: 'Win Rate', value: `${wr}%`, color: parseFloat(wr) >= 50 ? '#28a745' : '#dc3545', icon: '🏆', subtitle: `${currentStats.matches_won}W / ${currentStats.matches_lost}L` },
            { label: 'Score Ratio', value: kd, color: parseFloat(kd) >= 1 ? '#28a745' : '#ffc107', icon: '⚡', subtitle: 'Points scored/conceded' },
            { label: 'Tournaments Won', value: currentStats.tournaments_won || 0, color: '#fd7e14', icon: '🏅', subtitle: 'Championship titles' }
          ].map(stat => `
            <div style="background:linear-gradient(135deg, ${stat.color}15, ${stat.color}05);padding:20px;border-radius:12px;border-left:4px solid ${stat.color};position:relative;overflow:hidden">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                <div style="font-size:28px;font-weight:bold;color:${stat.color}">${stat.value}</div>
                <div style="font-size:24px;opacity:0.7">${stat.icon}</div>
              </div>
              <div style="font-size:14px;font-weight:bold;color:#333;margin-bottom:2px">${stat.label}</div>
              <div style="font-size:12px;color:#666">${stat.subtitle}</div>
            </div>
          `).join('')}
        </div>

        <!-- Detailed Statistics Grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px">
              <span>📊</span> Scoring Statistics
            </h4>
            <div style="space-y:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Total Points Scored</span>
                <strong style="color:#28a745">${currentStats.points_scored}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Total Points Conceded</span>
                <strong style="color:#dc3545">${currentStats.points_conceded}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Avg Points per Match</span>
                <strong style="color:#007bff">${avgPointsPerMatch}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
                <span style="color:#666">Avg Conceded per Match</span>
                <strong style="color:#ffc107">${avgPointsConcededPerMatch}</strong>
              </div>
            </div>
          </div>

          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px">
              <span>🎯</span> Performance Metrics
            </h4>
            <div style="space-y:12px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Current Win Streak</span>
                <strong style="color:${winStreak > 0 ? '#28a745' : '#dc3545'}">${winStreak}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Best Match Score</span>
                <strong style="color:#007bff">${bestPerformance.score || 'N/A'}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #e9ecef">
                <span style="color:#666">Games This Week</span>
                <strong style="color:#17a2b8">${getGamesThisWeek()}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
                <span style="color:#666">Favorite Time</span>
                <strong style="color:#6f42c1">${getMostActiveTime()}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Win Rate Visualization -->
        <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:20px">
          <h4 style="margin:0 0 15px 0;color:#333;display:flex;align-items:center;gap:8px">
            <span>📈</span> Win Rate Visualization
          </h4>
          <canvas id="winRateChart" width="400" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
        </div>
      </div>
    `;
  }

  function renderStatsPerformance(): string {
    return `
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:30px">
          <!-- Performance Chart -->
          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333">📊 Recent Match Scores</h4>
            <canvas id="performanceChart" width="300" height="200" style="width:100%;height:200px;background:#fff;border-radius:8px"></canvas>
          </div>

          <!-- Performance Rankings -->
          <div style="background:#f8f9fa;padding:20px;border-radius:12px">
            <h4 style="margin:0 0 15px 0;color:#333">🏆 Performance Rankings</h4>
            <div style="space-y:10px">
              ${getPerformanceRankings().map((rank, i) => `
                <div style="display:flex;align-items:center;gap:12px;padding:10px;background:#fff;border-radius:8px;border-left:4px solid ${rank.color}">
                  <div style="font-size:20px">${rank.icon}</div>
                  <div style="flex:1">
                    <div style="font-weight:bold;color:#333">${rank.label}</div>
                    <div style="font-size:12px;color:#666">${rank.description}</div>
                  </div>
                  <div style="font-weight:bold;color:${rank.color}">${rank.value}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Detailed Performance Metrics -->
        <div style="background:#f8f9fa;padding:20px;border-radius:12px;margin-bottom:20px">
          <h4 style="margin:0 0 15px 0;color:#333">🎯 Advanced Metrics</h4>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px">
            ${getAdvancedMetrics().map(metric => `
              <div style="background:#fff;padding:15px;border-radius:8px;border-top:3px solid ${metric.color}">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
                  <span style="font-size:18px">${metric.icon}</span>
                  <span style="font-size:20px;font-weight:bold;color:${metric.color}">${metric.value}</span>
                </div>
                <div style="font-size:14px;font-weight:bold;color:#333">${metric.label}</div>
                <div style="font-size:12px;color:#666">${metric.description}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Performance Heatmap -->
        <div style="background:#f8f9fa;padding:20px;border-radius:12px">
          <h4 style="margin:0 0 15px 0;color:#333">🔥 Activity Heatmap</h4>
          <p style="margin:0 0 15px 0;color:#666;font-size:14px">Your gaming activity over the last 7 days</p>
          <canvas id="activityHeatmap" width="600" height="100" style="width:100%;height:100px;background:#fff;border-radius:8px"></canvas>
        </div>
      </div>
    `;
  }

  function renderFriendsContent(): string {
    if (!currentFriends.length) {
      return '<div style="padding:20px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px;font-size:14px">No friends added yet. Add some friends to see them here!</div>';
    }

    return currentFriends.map(friend => `
      <div style="display:flex;align-items:center;gap:10px;padding:10px;background:#fff;border-radius:8px;margin-bottom:10px;box-shadow:0 2px 5px rgba(0,0,0,0.1)">
        <img src="${friend.avatar_url}" width="40" height="40" style="border-radius:50%;object-fit:cover" alt="Avatar"/>
        <div style="flex:1">
          <div style="font-weight:bold;color:#333">${friend.display_name}</div>
          <div style="font-size:12px;color:#666">@${friend.username}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:10px;color:${friend.online_status ? '#28a745' : '#666'}">${friend.online_status ? 'Online' : 'Offline'}</div>
          <button onclick="removeFriend('${friend.id}')" style="background:#dc3545;color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-size:12px;margin-top:4px">Remove</button>
        </div>
      </div>
    `).join('');
  }

  // Event listeners and setup
  function setupEventListeners() {
    // Edit mode toggle
    const editBtn = document.getElementById('edit-btn');
    editBtn?.addEventListener('click', () => {
      editMode = true;
      renderContent(originalProfile, true);
      setupEventListeners();
    });

    // Save and cancel buttons
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const passBtn = document.getElementById('pass-btn');

    saveBtn?.addEventListener('click', saveProfile);
    cancelBtn?.addEventListener('click', () => {
      editMode = false;
      renderContent(originalProfile, false);
      setupEventListeners();
    });
    passBtn?.addEventListener('click', () => {
      document.getElementById('pass-modal')!.style.display = 'flex';
    });

    // Avatar modal
    const avatarBtn = document.getElementById('avatar-btn');
    const avatarModal = document.getElementById('avatar-modal');
    const avatarModalClose = document.getElementById('avatar-modal-close');
    
    avatarBtn?.addEventListener('click', () => {
      avatarModal!.style.display = 'flex';
    });
    avatarModalClose?.addEventListener('click', () => {
      avatarModal!.style.display = 'none';
    });

    // Avatar selection
    document.querySelectorAll('.avatar-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.avatar-option').forEach(opt => {
          (opt as HTMLElement).style.borderColor = 'transparent';
        });
        (option as HTMLElement).style.borderColor = '#007bff';
        
        const confirmBtn = document.getElementById('avatar-confirm') as HTMLButtonElement;
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        
        confirmBtn.onclick = () => {
          const selectedAvatar = option.getAttribute('data-avatar');
          const preview = document.getElementById('avatar-preview') as HTMLImageElement;
          preview.src = selectedAvatar!;
          avatarModal!.style.display = 'none';
        };
      });
    });

    // Password modal
    const passModal = document.getElementById('pass-modal');
    const passCancel = document.getElementById('pass-cancel');
    const passForm = document.getElementById('pass-form') as HTMLFormElement;

    passCancel?.addEventListener('click', () => {
      passModal!.style.display = 'none';
    });

    passForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const current = (document.getElementById('pass-cur') as HTMLInputElement).value;
      const newPass = (document.getElementById('pass-new') as HTMLInputElement).value;
      const confirm = (document.getElementById('pass-conf') as HTMLInputElement).value;
      
      if (newPass !== confirm) {
        showError('pass-error', 'Passwords do not match');
        return;
      }

      try {
        const res = await fetch('/api/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ current_password: current, new_password: newPass })
        });

        if (res.ok) {
          showNotification('Password updated successfully!', '#28a745');
          passModal!.style.display = 'none';
          passForm.reset();
        } else {
          const error = await res.json();
          showError('pass-error', error.error || 'Failed to update password');
        }
      } catch {
        showError('pass-error', 'Network error. Please try again.');
      }
    });

    // Tab switching
    document.querySelectorAll('.stats-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        activeStatsTab = target.dataset.tab || 'overview';
        document.getElementById('stats-content')!.innerHTML = renderStatsContent();
        renderCharts();
      });
    });

    document.querySelectorAll('.history-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        activeHistoryView = target.dataset.view || 'list';
        document.getElementById('history-content')!.innerHTML = renderHistoryContent();
      });
    });

    // Friends functionality
    const friendAdd = document.getElementById('friend-add');
    friendAdd?.addEventListener('click', addFriend);

    // Close modals on outside click
    window.addEventListener('click', (e) => {
      if (e.target === avatarModal) avatarModal!.style.display = 'none';
      if (e.target === passModal) passModal!.style.display = 'none';
    });
  }

  // Helper functions
  async function saveProfile() {
    const username = (document.getElementById('username-input') as HTMLInputElement).value;
    const displayName = (document.getElementById('display-input') as HTMLInputElement).value;
    const email = (document.getElementById('email-input') as HTMLInputElement).value;
    const avatarUrl = (document.getElementById('avatar-preview') as HTMLImageElement).src;

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          display_name: displayName,
          email,
          avatar_url: avatarUrl
        })
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        originalProfile = { ...updatedProfile };
        editMode = false;
        renderContent(originalProfile, false);
        setupEventListeners();
        showNotification('Profile updated successfully!', '#28a745');
      } else {
        const error = await res.json();
        showError('save-error', error.error || 'Failed to save profile');
      }
    } catch {
      showError('save-error', 'Network error. Please try again.');
    }
  }

  async function addFriend() {
    const input = document.getElementById('friend-input') as HTMLInputElement;
    const username = input.value.trim();
    
    if (!username) return;

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });

      if (res.ok) {
        input.value = '';
        await loadFriends();
        document.getElementById('friends-container')!.innerHTML = renderFriendsContent();
        showMessage('friend-msg', 'Friend added successfully!', '#28a745');
        try { onBadgeUpdate?.(); } catch { /* ignore */ }
      } else {
        const error = await res.json();
        showMessage('friend-msg', error.error || 'Failed to add friend', '#dc3545');
      }
    } catch {
      showMessage('friend-msg', 'Network error. Please try again.', '#dc3545');
    }
  }

  function showNotification(message: string, color: string) {
    const notification = document.getElementById('notification')!;
    notification.textContent = message;
    notification.style.backgroundColor = color;
    notification.style.display = 'block';
    
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  function showError(elementId: string, message: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      setTimeout(() => {
        element.textContent = '';
      }, 5000);
    }
  }

  function showMessage(elementId: string, message: string, color: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.color = color;
      setTimeout(() => {
        element.textContent = '';
      }, 3000);
    }
  }

  // Global functions for onclick handlers
  (window as any).showMatchDetails = (matchId: string) => {
    console.log('Show match details:', matchId);
  };

  (window as any).loadMoreMatches = () => {
    console.log('Load more matches');
  };

  (window as any).applyHistoryFilters = () => {
    console.log('Apply history filters');
  };

  (window as any).viewMatchReplay = (matchId: string) => {
    console.log('View match replay:', matchId);
  };

  (window as any).shareMatch = (matchId: string) => {
    console.log('Share match:', matchId);
  };

  (window as any).analyzeMatch = (matchId: string) => {
    console.log('Analyze match:', matchId);
  };

  (window as any).removeFriend = async (friendId: string) => {
    try {
      const res = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await loadFriends();
        document.getElementById('friends-container')!.innerHTML = renderFriendsContent();
        showNotification('Friend removed successfully!', '#28a745');
        try { onBadgeUpdate?.(); } catch { /* ignore */ }
      }
    } catch {
      console.error('Failed to remove friend');
    }
  };

  // Initialize
  loadAndRender();
}

function getDefaultStats() {
  return {
      matches_played: 0,
      win_rate: 0,
      points_scored: 0,
      points_conceded: 0,
      matches_won: 0,
      matches_lost: 0,
      tournaments_won: 0
  };
}