import React, { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { hasPermission, hasAnyPermission, canAccessFeature } from '@/components/utils/permissions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Component to guard features based on user permissions
 */
export function PermissionGuard({ 
  permission, 
  permissions, 
  feature,
  fallback, 
  showMessage = true,
  children 
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d4af37]" />
    </div>;
  }

  if (!user) {
    return showMessage ? (
      <PermissionDenied message="You must be logged in to access this feature" />
    ) : null;
  }

  // Check feature access
  if (feature && !canAccessFeature(user.role, feature)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  // Check single permission
  if (permission && !hasPermission(user.role, permission)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  // Check multiple permissions (any)
  if (permissions && !hasAnyPermission(user.role, permissions)) {
    return fallback || (showMessage ? <PermissionDenied /> : null);
  }

  return <>{children}</>;
}

/**
 * Hook to check permissions
 */
export function usePermissions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const can = (permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const canAny = (permissions) => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const canAccess = (feature) => {
    if (!user) return false;
    return canAccessFeature(user.role, feature);
  };

  return {
    user,
    loading,
    can,
    canAny,
    canAccess,
    isAdmin: user?.role === 'admin' || user?.role === 'owner',
    role: user?.role
  };
}

/**
 * Permission denied message component
 */
function PermissionDenied({ message }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Alert className="max-w-md border-red-200 bg-red-50">
        <Lock className="h-5 w-5 text-red-600" />
        <AlertTitle className="text-red-900">Access Denied</AlertTitle>
        <AlertDescription className="text-red-700">
          {message || "You don't have permission to access this feature. Please contact your administrator to request access."}
          <div className="mt-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="outline" size="sm">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

/**
 * Component to show/hide based on permission
 */
export function HasPermission({ permission, permissions, feature, children }) {
  const { can, canAny, canAccess } = usePermissions();

  if (feature && !canAccess(feature)) {
    return null;
  }

  if (permission && !can(permission)) {
    return null;
  }

  if (permissions && !canAny(permissions)) {
    return null;
  }

  return <>{children}</>;
}