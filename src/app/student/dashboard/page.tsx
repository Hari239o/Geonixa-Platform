import Link from 'next/link';
import styles from './dashboard.module.css';
import { Icon, IconName } from '@/components/icons';

const features: { name: string; icon: IconName; path: string }[] = [
  { name: 'Exam Portal', icon: 'exam', path: '/exam/123' },
];

const leaderboard = [
  { rank: 1, name: 'Alice Smith', score: 980 },
  { rank: 2, name: 'John Doe', score: 945 },
  { rank: 3, name: 'Emma Wilson', score: 920 },
  { rank: 4, name: 'Michael Brown', score: 890 },
];

const topProjects = [
  { name: 'AI Content Generator', author: 'Team Alpha', tech: ['React', 'Node.js'] },
  { name: 'E-commerce Dashboard', author: 'Team Beta', tech: ['Next.js', 'Tailwind'] },
];

export default function StudentDashboard() {
  return (
    <div className={`${styles.container} animate-fade-in`}>
      <header className={styles.header}>
        <h1><span>Student</span> LMS Dashboard</h1>
        <div className={styles.profile}>
          <div className={styles.welcomeText}>
            <span>Welcome back,</span>
            <span>Candidate</span>
          </div>
          <div className={styles.avatar}>C</div>
        </div>
      </header>

      <main className={styles.mainLayout}>
        <div className={styles.grid}>
          {features.map((feature) => (
            <Link href={feature.path} key={feature.name} className={styles.card}>
              <div className={styles.iconWrapper}>
                <Icon name={feature.icon} size={28} />
              </div>
              <h2 className={styles.cardTitle}>{feature.name}</h2>
            </Link>
          ))}
        </div>

        <aside className={styles.sidePanel}>
          <div className={styles.widget}>
            <h2 className={styles.widgetTitle}>
              <Icon name="trophy" size={24} className={styles.widgetIcon} /> 
              Batchwise Leaderboard
            </h2>
            <div className={styles.list}>
              {leaderboard.map((user) => (
                <div key={user.rank} className={styles.listItem}>
                  <div className={styles.itemInfo}>
                    <span className={`${styles.rank} ${styles[`rank${user.rank}`] || ''}`}>
                      #{user.rank}
                    </span>
                    <span>{user.name}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                    {user.score} pt
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.widget}>
            <h2 className={styles.widgetTitle}>
              <Icon name="star" size={24} className={styles.widgetIcon} />
              Top Project Showcase
            </h2>
            <div className={styles.list}>
              {topProjects.map((project, idx) => (
                <div key={idx} className={styles.listItem} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className={styles.projectName}>{project.name}</div>
                  <div className={styles.projectAuthor}>By {project.author}</div>
                  <div className={styles.techStack}>
                    {project.tech.map(t => (
                      <span key={t} className={styles.techBadge}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
