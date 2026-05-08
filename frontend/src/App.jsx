import { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Login from './screens/Login.jsx';

// Participant screens
import Dashboard       from './screens/participant/Dashboard.jsx';
import Training        from './screens/participant/Training.jsx';
import ModuleViewer    from './screens/participant/ModuleViewer.jsx';
import Events          from './screens/participant/Events.jsx';
import EventDetail     from './screens/participant/EventDetail.jsx';
import Submission      from './screens/participant/Submission.jsx';
import MySubmissions   from './screens/participant/MySubmissions.jsx';
import Leaderboard     from './screens/participant/Leaderboard.jsx';
import Profile         from './screens/participant/Profile.jsx';

// Admin screens
import AdminDashboard  from './screens/admin/Dashboard.jsx';
import AdminEvents     from './screens/admin/Events.jsx';
import AdminUsers      from './screens/admin/Users.jsx';
import AdminOrgs       from './screens/admin/Organisations.jsx';
import AdminTraining   from './screens/admin/Training.jsx';
import AdminAnalytics  from './screens/admin/Analytics.jsx';

// Instructor screens
import InstructorTracks    from './screens/instructor/Tracks.jsx';
import InstructorEditor    from './screens/instructor/Editor.jsx';
import InstructorExercises from './screens/instructor/Exercises.jsx';
import InstructorProgress  from './screens/instructor/Progress.jsx';

// Judge screens
import JudgeEvents  from './screens/judge/Events.jsx';
import JudgeQueue   from './screens/judge/Queue.jsx';
import JudgeHistory from './screens/judge/History.jsx';

const DEFAULT_SCREEN = {
  participant: 'dashboard',
  admin:       'admin-dashboard',
  instructor:  'instructor-tracks',
  judge:       'judge-events',
  org_manager: 'org-events',
};

export default function App() {
  const [screen, setScreen]     = useState('login');
  const [role, setRole]         = useState('participant');
  const [user, setUser]         = useState(null);
  const [ctx, setCtx]           = useState({});

  const handleLogin = (newRole, newUser, defaultScreen) => {
    setRole(newRole);
    setUser(newUser);
    setScreen(defaultScreen || DEFAULT_SCREEN[newRole]);
    setCtx({});
  };

  const handleNav = (s) => {
    setScreen(s);
    setCtx({});
  };

  // Navigate to a screen with extra context data (e.g. eventId, trackId)
  const handleNavWithCtx = (s, newCtx = {}) => {
    setScreen(s);
    setCtx(newCtx);
  };

  if (screen === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  const renderScreen = () => {
    const props = { ...ctx, onNav: handleNav, onNavWithCtx: handleNavWithCtx, user, role };

    switch (screen) {
      // Participant
      case 'dashboard':      return <Dashboard      {...props} />;
      case 'training':       return <Training       {...props} />;
      case 'module-viewer':  return <ModuleViewer   {...props} trackId={ctx.trackId} trackTitle={ctx.trackTitle} />;
      case 'events':         return <Events         {...props} />;
      case 'event-detail':   return <EventDetail    {...props} eventId={ctx.eventId} eventTitle={ctx.eventTitle} />;
      case 'submission':     return <Submission     {...props} eventId={ctx.eventId} eventTitle={ctx.eventTitle} challengeId={ctx.challengeId} challengeTitle={ctx.challengeTitle} />;
      case 'my-submissions': return <MySubmissions  {...props} />;
      case 'leaderboard':    return <Leaderboard    {...props} eventId={ctx.eventId} eventTitle={ctx.eventTitle} />;
      case 'profile':        return <Profile        {...props} />;

      // Admin
      case 'admin-dashboard': return <AdminDashboard {...props} />;
      case 'admin-events':    return <AdminEvents    {...props} />;
      case 'admin-users':     return <AdminUsers     {...props} />;
      case 'admin-orgs':      return <AdminOrgs      {...props} />;
      case 'admin-training':  return <AdminTraining  {...props} />;
      case 'admin-analytics': return <AdminAnalytics {...props} />;

      // Instructor
      case 'instructor-tracks':    return <InstructorTracks    {...props} />;
      case 'instructor-editor':    return <InstructorEditor    {...props} trackId={ctx.trackId} trackTitle={ctx.trackTitle} />;
      case 'instructor-exercises': return <InstructorExercises {...props} />;
      case 'instructor-progress':  return <InstructorProgress  {...props} trackId={ctx.trackId} trackTitle={ctx.trackTitle} />;

      // Judge
      case 'judge-events':  return <JudgeEvents  {...props} />;
      case 'judge-queue':   return <JudgeQueue   {...props} eventId={ctx.eventId} eventTitle={ctx.eventTitle} />;
      case 'judge-history': return <JudgeHistory {...props} />;

      // Organisation Manager — reuses admin screens scoped to their org
      case 'org-dashboard':  return <AdminDashboard {...props} />;
      case 'org-events':     return <AdminEvents    {...props} />;
      case 'org-users':      return <AdminUsers     {...props} />;
      case 'org-training':   return <AdminTraining  {...props} />;
      case 'org-analytics':  return <AdminAnalytics {...props} />;

      default:
        return (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--gl)' }}>
            Screen "{screen}" not found
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--black)' }}>
      <Sidebar
        screen={screen}
        role={role}
        onNav={handleNav}
        onLogout={() => setScreen('login')}
        user={user}
      />
      <main
        style={{
          flex: 1,
          padding: 28,
          overflowY: 'auto',
          maxHeight: '100vh',
          minWidth: 0,
        }}
      >
        {renderScreen()}
      </main>
    </div>
  );
}
