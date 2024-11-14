'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, Database, AlertCircle, Search, Key } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const sports = [
  { id: 'football', name: 'American Football', emoji: '🏈' },
  { id: 'soccer', name: 'Football (Soccer)', emoji: '⚽' },
  { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  { id: 'baseball', name: 'Baseball', emoji: '⚾' },
  { id: 'volleyball', name: 'Volleyball', emoji: '🏐' },
  { id: 'handball', name: 'Handball', emoji: '🤾' },
  { id: 'mma', name: 'MMA', emoji: '🥊' },
  { id: 'formula1', name: 'Formula 1', emoji: '🏎️' },
  { id: 'hockey', name: 'Hockey', emoji: '🏑' },
  { id: 'rugby', name: 'Rugby', emoji: '🏉' },
] as const;

type SportId = typeof sports[number]['id'];

interface SportSelectionState {
  'machina-core': SportId[];
  'sportradar': SportId[];
}

const dataSources = [
  {
    id: 'machina-core',
    name: 'Machina Core',
    description: 'Machina Sports Built-in sports data',
    icon: Database,
    status: 'active',
  },
  {
    id: 'sportradar',
    name: 'Sportradar',
    description: 'Advanced sports data and statistics',
    icon: Database,
    status: 'inactive',
  },
] as const;

export default function ProjectForm({ form }: { form: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDataSource, setCurrentDataSource] = useState<string | null>(null);
  const [tempSelectedSports, setTempSelectedSports] = useState<SportId[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [sportradarConnected, setSportradarConnected] = useState(false);
  
  const watchDataSources = form.watch('dataSources') || [];
  const watchSportSelections = form.watch('sportSelections') || {};

  const handleDialogOpen = (open: boolean, dataSourceId?: string) => {
    if (open && dataSourceId) {
      setCurrentDataSource(dataSourceId);
      setTempSelectedSports(watchSportSelections[dataSourceId] || []);
    }
    setIsOpen(open);
  };

  const handleSelectAll = () => {
    if (tempSelectedSports.length === sports.length) {
      setTempSelectedSports([]);
    } else {
      setTempSelectedSports(sports.map(sport => sport.id));
    }
  };

  const handleSportSelect = (sportId: SportId) => {
    setTempSelectedSports(current => {
      if (current.includes(sportId)) {
        return current.filter(id => id !== sportId);
      }
      return [...current, sportId];
    });
  };

  const handleConfirm = () => {
    if (currentDataSource) {
      const currentSelections = { ...watchSportSelections };
      currentSelections[currentDataSource] = tempSelectedSports;
      form.setValue('sportSelections', currentSelections);
    }
    setIsOpen(false);
  };

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setSportradarConnected(true);
      const newDataSources = [...watchDataSources];
      if (!newDataSources.includes('sportradar')) {
        newDataSources.push('sportradar');
        form.setValue('dataSources', newDataSources);
      }
      setIsApiKeyModalOpen(false);
      toast({
        title: 'Sportradar Connected',
        description: 'Your API key has been saved successfully.',
      });
    }
  };

  const filteredSports = sports.filter(sport =>
    sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sport.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSportsSelection = (dataSourceId: string) => {
    const selectedSports = watchSportSelections[dataSourceId] || [];
    
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel className="text-sm font-medium text-muted-foreground">Sports Selection</FormLabel>
          <Dialog open={isOpen && currentDataSource === dataSourceId} onOpenChange={(open) => handleDialogOpen(open, dataSourceId)}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                {selectedSports.length > 0
                  ? `${selectedSports.length} sport${selectedSports.length === 1 ? '' : 's'} selected`
                  : 'Select sports'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Select Sports for {dataSourceId === 'machina-core' ? 'Machina Core' : 'Sportradar'}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSelectAll}
                    className="whitespace-nowrap"
                  >
                    {tempSelectedSports.length === sports.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                <ScrollArea className="h-[300px]">
                  <div className="pr-4 space-y-2">
                    {filteredSports.map((sport) => {
                      const isSelected = tempSelectedSports.includes(sport.id);
                      return (
                        <div
                          key={sport.id}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-md cursor-pointer transition-colors',
                            isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                          )}
                          onClick={() => handleSportSelect(sport.id)}
                        >
                          <div className={cn(
                            'w-4 h-4 rounded-sm border flex items-center justify-center',
                            isSelected ? 'bg-primary border-primary' : 'border-input'
                          )}>
                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className="w-6">{sport.emoji}</span>
                          <span className="flex-1">{sport.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <Separator />
                
                <DialogFooter>
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      disabled={tempSelectedSports.length === 0}
                    >
                      Confirm Selection
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {selectedSports.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedSports.map((sportId: SportId) => {
              const sport = sports.find((s) => s.id === sportId);
              return (
                <Badge 
                  key={sportId} 
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => {
                    const newSelections = { ...watchSportSelections };
                    newSelections[dataSourceId] = selectedSports.filter(id => id !== sportId);
                    form.setValue('sportSelections', newSelections);
                  }}
                >
                  <span className="mr-1">{sport?.emoji}</span>
                  {sport?.name}
                  <span className="sr-only">Remove</span>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="projectName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter project name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="dataSources"
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Sports Data Sources</FormLabel>
            </div>

            <div className="space-y-4">
              {dataSources.map((source) => {
                const isActive = source.id === 'machina-core' || sportradarConnected;
                const isSelected = field.value?.includes(source.id);

                return (
                  <div key={source.id} className="space-y-4">
                    <Card
                      className={cn(
                        'transition-colors',
                        source.id === 'sportradar' && !sportradarConnected ? 'opacity-80' : '',
                        isSelected && 'border-primary'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <source.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{source.name}</h4>
                              {source.id === 'sportradar' && (
                                <div className="flex items-center gap-2">
                                  {sportradarConnected ? (
                                    <Badge variant="secondary">Connected</Badge>
                                  ) : (
                                    <Dialog open={isApiKeyModalOpen} onOpenChange={setIsApiKeyModalOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                          <Key className="h-4 w-4 mr-2" />
                                          Add API Key
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Connect Sportradar</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                          <FormItem>
                                            <FormLabel>API Key</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter your Sportradar API key"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                              />
                                            </FormControl>
                                            <FormDescription>
                                              You can find your API key in the Sportradar dashboard
                                            </FormDescription>
                                          </FormItem>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setIsApiKeyModalOpen(false)}>
                                            Cancel
                                          </Button>
                                          <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                                            Connect
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  )}
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {source.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {isSelected && isActive && renderSportsSelection(source.id)}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}