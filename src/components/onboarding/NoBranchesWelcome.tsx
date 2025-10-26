import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NoBranchesWelcome() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">Welcome to FitVerse Admin</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Get started by adding your first branch to manage your fitness center
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="space-y-2">
            <h3 className="font-medium">What you can do with branches:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Manage members and memberships for each location</li>
              <li>• Schedule and track classes and personal training sessions</li>
              <li>• Monitor locker assignments and facility usage</li>
              <li>• Track revenue and manage staff for each location</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/settings/branches/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Branch
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
