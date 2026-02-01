import React from 'react';
import { Terminal, Code, Github } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, ScrollArea } from '../ui/index';
import { Scenario } from '../../types/index';

export function DashboardView({ scenario }: { scenario: Scenario }) {
  return (
    <ScrollArea className="h-full bg-slate-50/50">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary">
            New Assignment
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{scenario.companyName}</h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl leading-relaxed">{scenario.companyDescription}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Terminal size={18} className="text-primary"/>
                Task Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-7 text-slate-700">{scenario.taskDescription}</p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Code size={18} className="text-primary"/>
                  Tech Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scenario.techStack.map(tech => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-slate-800 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Github size={18}/>
                  Repository
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-300 font-mono bg-black/30 p-3 rounded border border-white/10 overflow-x-auto whitespace-nowrap">
                  <span className="text-green-400 select-none">$</span>
                  git clone https://{scenario.repoUrl}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>* Mock environment. No real git commands available.</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
