import { useState } from 'react';
import { useModelStore } from '@/stores/modelStore';
import { useResultsStore } from '@/stores/resultsStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SystemHealthBanner } from '@/components/intelligence/SystemHealthBanner';
import { BottleneckRadar } from '@/components/intelligence/BottleneckRadar';
import { GlobalOptimizer } from '@/components/intelligence/GlobalOptimizer';
import { LotSizeExplorer } from '@/components/intelligence/LotSizeExplorer';

export default function TroobaIntelligence() {
  usePageTitle('Trooba Intelligence');
  const model = useModelStore((s) => s.getActiveModel());
  const results = useResultsStore((s) => s.getResults('basecase'));
  const [activeTab, setActiveTab] = useState('bottleneck');

  if (!model) return <div className="p-6 text-muted-foreground">No model selected.</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SystemHealthBanner model={model} results={results} />

      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="px-4 pt-3 border-b border-border">
          <TabsList className="bg-muted/50 backdrop-blur-sm p-1 rounded-xl flex w-full">
  <TabsTrigger
    value="bottleneck"
    className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-all
             data-[state=active]:bg-background 
             data-[state=active]:shadow-sm
             data-[state=active]:text-foreground
             text-muted-foreground hover:text-foreground"
  >
    Bottleneck Radar
  </TabsTrigger>

  <TabsTrigger
    value="optimizer"
    className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-all
             data-[state=active]:bg-background 
             data-[state=active]:shadow-sm
             data-[state=active]:text-foreground
             text-muted-foreground hover:text-foreground"
  >
    Global Optimizer
  </TabsTrigger>

  <TabsTrigger
    value="lotsizer"
    className="flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-all
             data-[state=active]:bg-background 
             data-[state=active]:shadow-sm
             data-[state=active]:text-foreground
             text-muted-foreground hover:text-foreground"
  >
    Lot Size Explorer
  </TabsTrigger>
</TabsList>
          </div>

          <TabsContent value="bottleneck" className="flex-1 overflow-y-auto p-4">
            <BottleneckRadar model={model} results={results} />
          </TabsContent>

          <TabsContent value="optimizer" className="flex-1 overflow-y-auto p-4">
            <GlobalOptimizer model={model} results={results} />
          </TabsContent>

          <TabsContent value="lotsizer" className="flex-1 overflow-y-auto p-4">
            <LotSizeExplorer model={model} results={results} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
