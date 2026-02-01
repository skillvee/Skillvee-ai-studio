import React from 'react';
import { Play, GitBranch, Users, Clock } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '../ui/index';
import { Scenario } from '../../types/index';

interface WelcomeViewProps {
  scenario: Scenario;
  onStart: () => void;
}

export function WelcomeView({ scenario, onStart }: WelcomeViewProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-white to-slate-100 h-full">
      <Card className="max-w-2xl w-full shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-primary ml-1" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome to {scenario.companyName}</CardTitle>
          <p className="text-slate-500 mt-2">
            You're about to start your technical assessment
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Task Overview */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
            <h3 className="font-semibold text-sm text-slate-900">Your Task</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {scenario.taskDescription}
            </p>
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 justify-center">
            {scenario.techStack.map(tech => (
              <Badge key={tech} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200">
                {tech}
              </Badge>
            ))}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <GitBranch className="w-5 h-5 mx-auto mb-2 text-primary/80" />
              <p className="text-xs font-medium text-slate-600">Real Repo</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <Users className="w-5 h-5 mx-auto mb-2 text-primary/80" />
              <p className="text-xs font-medium text-slate-600">AI Coworkers</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
              <Clock className="w-5 h-5 mx-auto mb-2 text-primary/80" />
              <p className="text-xs font-medium text-slate-600">Your Pace</p>
            </div>
          </div>

          {/* Start Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
              onClick={onStart}
            >
              Start Assessment
            </Button>

            <p className="text-[10px] text-center text-slate-400">
              By clicking start, you agree to record your screen and microphone during the assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}