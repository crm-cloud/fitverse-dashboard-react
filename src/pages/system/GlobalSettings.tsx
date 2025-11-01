import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HierarchicalSettingsManager } from '@/components/settings/HierarchicalSettingsManager';
import { Database, Globe, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function GlobalSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground">
          Configure platform-wide settings that apply to all gyms and branches
        </p>
      </div>

      <HierarchicalSettingsManager level={{ level: 'super_admin' }} />
    </div>
  );
}
