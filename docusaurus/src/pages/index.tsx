import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className={styles.heroGrid}></div>
      <div className={styles.scanline}></div>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className={styles.heroGlitch}>
          <Heading as="h1" className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
        </div>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>12+</span>
            <span className={styles.statLabel}>Modules</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>AI</span>
            <span className={styles.statLabel}>Powered</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>ROS2</span>
            <span className={styles.statLabel}>Compatible</span>
          </div>
        </div>
        <div className={styles.buttons}>
          <Link
            className={clsx('cyber-button', styles.heroButton)}
            to="/docs/intro">
            INITIALIZE TRAINING SEQUENCE
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Physical AI Systems',
    icon: '🤖',
    description: (
      <>
        Master the fundamentals of Physical AI - from sensor fusion to
        real-time decision making. Learn how robots perceive and interact
        with the physical world.
      </>
    ),
  },
  {
    title: 'Humanoid Robotics',
    icon: '🦾',
    description: (
      <>
        Deep dive into bipedal locomotion, manipulation, and human-robot
        interaction. Build systems that move and respond like humans.
      </>
    ),
  },
  {
    title: 'Neural Networks & Vision',
    icon: '🧠',
    description: (
      <>
        Implement computer vision, object detection, and neural network
        architectures optimized for robotics applications on edge devices.
      </>
    ),
  },
  {
    title: 'ROS2 & Simulation',
    icon: '⚙️',
    description: (
      <>
        Build production-ready robotic systems with ROS2. Test in simulation
        with Gazebo and Isaac Sim before deploying to real hardware.
      </>
    ),
  },
  {
    title: 'NVIDIA Jetson Integration',
    icon: '💻',
    description: (
      <>
        Optimize your AI models for NVIDIA Jetson platforms. Learn TensorRT,
        DeepStream, and CUDA programming for real-time robotics.
      </>
    ),
  },
  {
    title: 'AI-Powered Learning',
    icon: '✨',
    description: (
      <>
        Experience personalized content with AI summaries, Urdu translations,
        and intelligent assistance through our RAG-powered drone assistant.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDesc}>{description}</p>
        <div className={styles.featureGlow}></div>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>// SYSTEM MODULES</span>
          <Heading as="h2" className={styles.sectionTitle}>Core Training Protocols</Heading>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechStackSection(): ReactNode {
  const techStack = [
    { name: 'Python', category: 'Core' },
    { name: 'ROS2', category: 'Framework' },
    { name: 'PyTorch', category: 'AI/ML' },
    { name: 'TensorRT', category: 'Optimization' },
    { name: 'NVIDIA Jetson', category: 'Hardware' },
    { name: 'Isaac Sim', category: 'Simulation' },
  ];

  return (
    <section className={styles.techStack}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>// TECH STACK</span>
          <Heading as="h2" className={styles.sectionTitle}>Integrated Systems</Heading>
        </div>
        <div className={styles.techGrid}>
          {techStack.map((tech, idx) => (
            <div key={idx} className={styles.techItem}>
              <span className={styles.techName}>{tech.name}</span>
              <span className={styles.techCategory}>{tech.category}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection(): ReactNode {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2" className={styles.ctaTitle}>Ready to Build the Future?</Heading>
          <p className={styles.ctaDesc}>
            Join the next generation of robotics engineers. Start your journey into
            Physical AI and Humanoid Robotics today.
          </p>
          <div className={styles.ctaButtons}>
            <Link className="cyber-button" to="/docs/intro">
              BEGIN TRAINING
            </Link>
            <Link className="cyber-button secondary" to="/blog">
              VIEW MISSION LOGS
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Physical AI & Humanoid Robotics"
      description="Master Physical AI and Humanoid Robotics with AI-powered documentation, personalized learning, and intelligent assistance.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <TechStackSection />
        <CTASection />
      </main>
    </Layout>
  );
}
