/**
 * pages.config.jsx — Application routing configuration
 *
 * Consumed by App.jsx:
 *   const { Pages, Layout, mainPage } = pagesConfig;
 *
 * Pages: object mapping URL-segment → React component
 * Layout: the persistent shell component wrapping all pages
 * mainPage: key of the default landing page
 *
 * URL format: /{PageKey}  e.g. /Dashboard, /Content, /Settings
 * The root path "/" renders the mainPage (Dashboard).
 *
 * Place at: src/pages.config.jsx
 */

// ─── Page imports ─────────────────────────────────────────────────────────────
import Dashboard          from '@/components/Dashboard';
import Content            from '@/components/Content';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SocialListening    from '@/components/SocialListening';
import Inbox              from '@/components/Inbox';
import Monetization       from '@/components/Monetization';
import Campaigns          from '@/components/Campaigns';
import CampaignDetails    from '@/components/CampaignDetails';
import Team               from '@/components/Team';
import Settings           from '@/components/Settings';
import Integrations       from '@/components/Integrations';
import Onboarding         from '@/components/Onboarding';
import Pricing            from '@/components/Pricing';
import Help               from '@/components/Help';
import Landing            from '@/components/Landing';
import CreateWorkspace    from '@/components/CreateWorkspace';
import AgencyDashboard    from '@/components/AgencyDashboard';
import AgencyClientManagement from '@/components/AgencyClientManagement';
import ClientPortal       from '@/components/ClientPortal';
import ClientReports      from '@/components/ClientReports';
import MultiWorkspaceDashboard from '@/components/MultiWorkspaceDashboard';
import AIAssistant        from '@/components/AIAssistant';
import Collaboration      from '@/components/Collaboration';
import RoleManagement     from '@/components/RoleManagement';
import WhiteLabelSettings from '@/components/WhiteLabelSettings';
import MediaLibrary       from '@/components/MediaLibrary';

// ─── Layout shell ─────────────────────────────────────────────────────────────
import Layout from '@/components/Layout';

// ─── Pages config ─────────────────────────────────────────────────────────────
export const pagesConfig = {
  /**
   * Default landing page after login.
   * App.jsx renders this at the root path "/".
   */
  mainPage: 'Dashboard',

  /**
   * Persistent layout shell wrapping every page.
   * Provides sidebar, nav, notifications, workspace switcher.
   * Set to null to disable layout (e.g. for a landing page app).
   */
  Layout,

  /**
   * Route map: URL key → page component.
   *
   * URL pattern: /{key}  (e.g. /Content, /Settings)
   * Components receive no mandatory props — they fetch their own data.
   */
  Pages: {
    // ── Core ──────────────────────────────────────────────────────────────
    Dashboard,
    Content,
    AnalyticsDashboard,
    SocialListening,
    Inbox,
    Monetization,
    Campaigns,
    CampaignDetails,
    Team,
    Settings,
    Integrations,
    MediaLibrary,
    AIAssistant,
    Collaboration,

    // ── Account & workspace ───────────────────────────────────────────────
    Onboarding,
    CreateWorkspace,
    Pricing,
    RoleManagement,
    WhiteLabelSettings,

    // ── Agency / client management ────────────────────────────────────────
    AgencyDashboard,
    AgencyClientManagement,
    MultiWorkspaceDashboard,
    ClientPortal,
    ClientReports,

    // ── Support ───────────────────────────────────────────────────────────
    Help,
    Landing,
  },
};

export default pagesConfig;
