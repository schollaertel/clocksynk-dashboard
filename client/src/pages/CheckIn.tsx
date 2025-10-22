import TeamsLayout from "@/components/TeamsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckCircle2, Clock, LogIn, LogOut, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function CheckIn() {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState("");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  
  const { data: todayEntry, refetch } = trpc.timeTracking.getTodayEntry.useQuery();
  const clockInMutation = trpc.timeTracking.clockIn.useMutation();
  const clockOutMutation = trpc.timeTracking.clockOut.useMutation();
  const checkInMutation = trpc.checkIn.submit.useMutation();

  useEffect(() => {
    if (todayEntry) {
      setIsClockedIn(!todayEntry.clockOut);
      setCurrentEntry(todayEntry);
    }
  }, [todayEntry]);

  const handleClockIn = async () => {
    try {
      await clockInMutation.mutateAsync({});
      toast.success("Clocked in! Have a productive day!");
      setIsClockedIn(true);
      refetch();
    } catch (error) {
      toast.error("Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync({});
      toast.success("Clocked out! Great work today!");
      setIsClockedIn(false);
      refetch();
    } catch (error) {
      toast.error("Failed to clock out");
    }
  };

  const handleDailyCheckIn = async () => {
    if (!dailyGoal.trim()) {
      toast.error("Please enter your daily goal");
      return;
    }

    try {
      await checkInMutation.mutateAsync({ goal: dailyGoal });
      toast.success("Daily check-in submitted!");
      setDailyGoal("");
    } catch (error) {
      toast.error("Failed to submit check-in");
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateHours = () => {
    if (!currentEntry?.clockIn) return "0:00";
    
    const start = new Date(currentEntry.clockIn);
    const end = currentEntry.clockOut ? new Date(currentEntry.clockOut) : new Date();
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <TeamsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Morning Check-In</h1>
          <p className="text-gray-400 mt-2">
            Start your day by clocking in and setting your daily goal
          </p>
        </div>

        {/* Time Tracking Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-blue-400" />
              Time Tracking
            </CardTitle>
            <CardDescription className="text-gray-400">
              Clock in when you start work, clock out when you're done
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-lg font-semibold text-white flex items-center gap-2">
                  {isClockedIn ? (
                    <>
                      <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                      Clocked In
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 bg-gray-500 rounded-full"></span>
                      Clocked Out
                    </>
                  )}
                </p>
              </div>
              
              {currentEntry && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {isClockedIn ? "Since" : "Total Today"}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {isClockedIn ? formatTime(currentEntry.clockIn) : calculateHours()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {!isClockedIn ? (
                <Button 
                  onClick={handleClockIn}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={clockInMutation.isPending}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Clock In
                </Button>
              ) : (
                <Button 
                  onClick={handleClockOut}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                  disabled={clockOutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Clock Out
                </Button>
              )}
            </div>

            {isClockedIn && (
              <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-sm text-blue-300">
                  <Clock className="inline h-4 w-4 mr-1" />
                  You've been working for <strong>{calculateHours()}</strong> today
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Goal Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              Daily Goal
            </CardTitle>
            <CardDescription className="text-gray-400">
              What's your main focus for today?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Example: Complete client proposal, Review marketing materials, Schedule 3 tournament meetings..."
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              rows={4}
              className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
            />
            
            <Button 
              onClick={handleDailyCheckIn}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={checkInMutation.isPending || !dailyGoal.trim()}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Submit Daily Goal
            </Button>
          </CardContent>
        </Card>

        {/* Tips for Team */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Team Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-green-400 mb-1">For Bill:</p>
              <p className="text-sm text-gray-300">
                1. Click "Clock In" when you start<br/>
                2. Type what you'll work on today<br/>
                3. Click "Submit Daily Goal"<br/>
                4. Click "Clock Out" when you finish
              </p>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-blue-400 mb-1">For Jared:</p>
              <p className="text-sm text-gray-300">
                Be specific with your daily goal - it helps Erin track progress and keeps you focused!
              </p>
            </div>
            
            <div className="p-3 bg-gray-900/50 rounded-lg">
              <p className="font-semibold text-orange-400 mb-1">For Erin:</p>
              <p className="text-sm text-gray-300">
                You can see everyone's check-ins and hours in the Reports section
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeamsLayout>
  );
}

