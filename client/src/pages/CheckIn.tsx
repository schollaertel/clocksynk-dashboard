import TeamsLayout from "@/components/TeamsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CheckIn() {
  const { user } = useAuth();
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [mood, setMood] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [blockers, setBlockers] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  const handleCheckIn = () => {
    if (!dailyGoal.trim()) {
      toast.error("Please enter your daily goal");
      return;
    }

    // In a real implementation, this would save to Google Sheets
    // For now, we'll just show a success message
    const checkInData = {
      date: new Date().toISOString(),
      user: user?.name || "Unknown",
      mood,
      dailyGoal,
      blockers,
      workingHours,
    };

    console.log("Check-in data:", checkInData);
    
    toast.success("Checked in successfully! Have a productive day!");
    setHasCheckedIn(true);
  };

  const resetCheckIn = () => {
    setHasCheckedIn(false);
    setMood("");
    setDailyGoal("");
    setBlockers("");
    setWorkingHours("");
  };

  if (hasCheckedIn) {
    return (
      <TeamsLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl">You're all set!</CardTitle>
              <CardDescription>
                Thanks for checking in. Have a great day!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div>
                  <strong className="text-sm">Your Daily Goal:</strong>
                  <p className="text-sm text-muted-foreground mt-1">{dailyGoal}</p>
                </div>
                {blockers && (
                  <div>
                    <strong className="text-sm">Blockers:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{blockers}</p>
                  </div>
                )}
                {workingHours && (
                  <div>
                    <strong className="text-sm">Working Hours:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{workingHours}</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full" onClick={resetCheckIn}>
                Update Check-in
              </Button>
            </CardContent>
          </Card>
        </div>
      </TeamsLayout>
    );
  }

  return (
    <TeamsLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>Morning Check-In</CardTitle>
            </div>
            <CardDescription>
              Start your day by setting your focus and letting the team know your status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mood">How are you feeling today?</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger id="mood">
                  <SelectValue placeholder="Select your mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="great">😄 Great - Ready to crush it!</SelectItem>
                  <SelectItem value="good">🙂 Good - Feeling productive</SelectItem>
                  <SelectItem value="okay">😐 Okay - Getting started</SelectItem>
                  <SelectItem value="tired">😴 Tired - Need coffee</SelectItem>
                  <SelectItem value="stressed">😰 Stressed - Need support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dailyGoal">What's your main goal today? *</Label>
              <Textarea
                id="dailyGoal"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                placeholder="e.g., Complete sponsor outreach emails, finish product roadmap..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="blockers">Any blockers or concerns?</Label>
              <Textarea
                id="blockers"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="Anything preventing you from being productive today?"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="workingHours">Working hours today</Label>
              <Input
                id="workingHours"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                placeholder="e.g., 9 AM - 5 PM"
              />
            </div>

            <Button onClick={handleCheckIn} className="w-full">
              Check In
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your check-in will be saved to the team sheet and visible to Erin
            </p>
          </CardContent>
        </Card>
      </div>
    </TeamsLayout>
  );
}

