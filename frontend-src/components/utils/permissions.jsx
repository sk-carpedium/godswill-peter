/**
 * permissions.js — Role-based permission utilities
 *
 * Used by PermissionGuard.jsx and RoleManagement.jsx.
 * Place at: src/components/utils/permissions.js
 *
 * Roles (least → most privileged):
 *   client_viewer → member → manager → admin → owner
 */

const ROLE_HIERARCHY = {
  client_viewer: 0,
  member:        1,
  manager:       2,
  admin:         3,
  owner:         4,
  agency:        4,
};

const PERMISSIONS = {
  // Publishing
  'publish_posts':        ['member','manager','admin','owner','agency'],
  'schedule_posts':       ['member','manager','admin','owner','agency'],
  'delete_posts':         ['manager','admin','owner','agency'],
  'bulk_actions':         ['manager','admin','owner','agency'],
  // Analytics
  'view_analytics':       ['client_viewer','member','manager','admin','owner','agency'],
  'export_data':          ['manager','admin','owner','agency'],
  // Team
  'invite_members':       ['admin','owner','agency'],
  'manage_roles':         ['owner','agency'],
  'remove_members':       ['admin','owner','agency'],
  // Workspace
  'manage_workspace':     ['admin','owner','agency'],
  'billing':              ['owner','agency'],
  'white_label':          ['owner','agency'],
  'api_access':           ['admin','owner','agency'],
  // Approvals
  'approve_posts':        ['manager','admin','owner','agency'],
  'manage_approvals':     ['manager','admin','owner','agency'],
  // Integrations
  'connect_platforms':    ['manager','admin','owner','agency'],
  'manage_integrations':  ['admin','owner','agency'],
  // Client portal
  'view_client_portal':   ['client_viewer','member','manager','admin','owner','agency'],
  'manage_clients':       ['manager','admin','owner','agency'],
  // Reports
  'view_reports':         ['client_viewer','member','manager','admin','owner','agency'],
  'create_reports':       ['manager','admin','owner','agency'],
  'schedule_reports':     ['admin','owner','agency'],
};

const FEATURE_ACCESS = {
  ai_assistant:        ['member','manager','admin','owner','agency'],
  social_listening:    ['member','manager','admin','owner','agency'],
  campaigns:           ['member','manager','admin','owner','agency'],
  monetization:        ['member','manager','admin','owner','agency'],
  agency_dashboard:    ['manager','admin','owner','agency'],
  multi_workspace:     ['admin','owner','agency'],
  white_label:         ['owner','agency'],
  client_portal:       ['client_viewer','manager','admin','owner','agency'],
  advanced_analytics:  ['manager','admin','owner','agency'],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  const userLevel = ROLE_HIERARCHY[role] ?? -1;
  return allowed.some(r => (ROLE_HIERARCHY[r] ?? -1) <= userLevel);
}

/**
 * Check if a role has ANY of the listed permissions
 */
export function hasAnyPermission(role, permissions = []) {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role can access a feature
 */
export function canAccessFeature(role, feature) {
  if (!role || !feature) return false;
  const allowed = FEATURE_ACCESS[feature];
  if (!allowed) return true; // default to accessible if not defined
  return allowed.includes(role);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role) {
  return Object.keys(PERMISSIONS).filter(p => hasPermission(role, p));
}

export { ROLE_HIERARCHY, PERMISSIONS, FEATURE_ACCESS };
