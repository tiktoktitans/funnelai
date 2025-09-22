'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  DollarSign,
  Calendar,
  User,
  Phone,
  Mail,
  MessageSquare,
  Tag,
  Clock,
  TrendingUp,
  ChevronRight,
  Edit2,
  Trash2,
  GripVertical,
  Target,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Deal {
  id: string;
  title: string;
  value: number;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  stage: string;
  probability: number;
  closeDate: Date;
  lastActivity: Date;
  tags: string[];
  notes?: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  deals: Deal[];
  value: number;
  probability: number;
}

function DealCard({ deal }: { deal: Deal }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const daysUntilClose = Math.ceil(
    (new Date(deal.closeDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-gray-900 line-clamp-1">{deal.title}</h4>
        <button className="p-1 rounded hover:bg-gray-100 transition-colors">
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-gray-900">
            ${(deal.value / 1000).toFixed(0)}k
          </span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            deal.probability >= 75 ? 'bg-green-100 text-green-700' :
            deal.probability >= 50 ? 'bg-yellow-100 text-yellow-700' :
            deal.probability >= 25 ? 'bg-orange-100 text-orange-700' :
            'bg-red-100 text-red-700'
          }`}>
            {deal.probability}%
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="truncate">{deal.contactName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className={daysUntilClose < 7 ? 'text-orange-600 font-medium' : ''}>
            {daysUntilClose > 0 ? `${daysUntilClose} days left` : 'Overdue'}
          </span>
        </div>

        {deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {deal.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <Phone className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <Mail className="w-4 h-4 text-gray-400" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 transition-colors">
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(deal.lastActivity).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function StageColumn({ stage, onAddDeal }: { stage: Stage; onAddDeal: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-xl"
    >
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full`}
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
            <span className="text-sm text-gray-500">({stage.deals.length})</span>
          </div>
          <button
            onClick={onAddDeal}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Value</span>
          <span className="font-semibold text-gray-900">
            ${(stage.value / 1000).toFixed(0)}k
          </span>
        </div>
      </div>

      <div className="p-3 space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto">
        <SortableContext
          items={stage.deals.map(d => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {stage.deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {stage.deals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No deals in this stage</p>
            <button
              onClick={onAddDeal}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Add a deal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PipelinesPage() {
  const { toast } = useToast();
  const [stages, setStages] = useState<Stage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPipeline();
  }, []);

  const loadPipeline = async () => {
    // Mock data - replace with actual API call
    const mockStages: Stage[] = [
      {
        id: 's1',
        name: 'Lead In',
        color: '#3B82F6',
        probability: 10,
        value: 150000,
        deals: [
          {
            id: 'd1',
            title: 'Enterprise Coaching Package',
            value: 50000,
            contactName: 'John Smith',
            contactEmail: 'john@enterprise.com',
            stage: 's1',
            probability: 10,
            closeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            tags: ['Enterprise', 'High-Value'],
          },
          {
            id: 'd2',
            title: 'Group Mastermind Program',
            value: 25000,
            contactName: 'Sarah Johnson',
            contactEmail: 'sarah@example.com',
            stage: 's1',
            probability: 15,
            closeDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            tags: ['Mastermind'],
          },
        ],
      },
      {
        id: 's2',
        name: 'Qualified',
        color: '#8B5CF6',
        probability: 25,
        value: 125000,
        deals: [
          {
            id: 'd3',
            title: 'Executive 1-on-1 Coaching',
            value: 35000,
            contactName: 'Mike Wilson',
            contactPhone: '+1234567890',
            stage: 's2',
            probability: 30,
            closeDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            tags: ['Executive', 'Urgent'],
          },
        ],
      },
      {
        id: 's3',
        name: 'Proposal',
        color: '#F59E0B',
        probability: 50,
        value: 175000,
        deals: [
          {
            id: 'd4',
            title: 'Annual Retainer Package',
            value: 75000,
            contactName: 'Lisa Chen',
            contactEmail: 'lisa@corporation.com',
            stage: 's3',
            probability: 60,
            closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now()),
            tags: ['Retainer', 'Priority'],
          },
        ],
      },
      {
        id: 's4',
        name: 'Negotiation',
        color: '#EF4444',
        probability: 75,
        value: 95000,
        deals: [
          {
            id: 'd5',
            title: 'Digital Course Bundle',
            value: 15000,
            contactName: 'Alex Turner',
            contactEmail: 'alex@startup.com',
            stage: 's4',
            probability: 80,
            closeDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now()),
            tags: ['Digital', 'Course'],
          },
        ],
      },
      {
        id: 's5',
        name: 'Closed Won',
        color: '#10B981',
        probability: 100,
        value: 285000,
        deals: [
          {
            id: 'd6',
            title: 'Premium Coaching Program',
            value: 45000,
            contactName: 'Emma Davis',
            contactEmail: 'emma@success.com',
            stage: 's5',
            probability: 100,
            closeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            lastActivity: new Date(Date.now()),
            tags: ['Closed', 'Premium'],
          },
        ],
      },
    ];

    setStages(mockStages);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the deal being moved
    let dealToMove: Deal | null = null;
    let fromStage: Stage | null = null;

    for (const stage of stages) {
      const deal = stage.deals.find(d => d.id === activeId);
      if (deal) {
        dealToMove = deal;
        fromStage = stage;
        break;
      }
    }

    if (!dealToMove || !fromStage) return;

    // Find the target stage
    let toStage = stages.find(s => s.id === overId);
    if (!toStage) {
      // Check if we're dropping on another deal
      for (const stage of stages) {
        if (stage.deals.some(d => d.id === overId)) {
          toStage = stage;
          break;
        }
      }
    }

    if (!toStage || fromStage.id === toStage.id) {
      setActiveId(null);
      return;
    }

    // Move the deal
    setStages(prev => {
      const newStages = [...prev];
      const fromStageIndex = newStages.findIndex(s => s.id === fromStage.id);
      const toStageIndex = newStages.findIndex(s => s.id === toStage!.id);

      // Remove deal from source stage
      newStages[fromStageIndex] = {
        ...newStages[fromStageIndex],
        deals: newStages[fromStageIndex].deals.filter(d => d.id !== dealToMove!.id),
        value: newStages[fromStageIndex].value - dealToMove!.value,
      };

      // Update deal stage and probability
      const updatedDeal = {
        ...dealToMove!,
        stage: toStage!.id,
        probability: toStage!.probability,
      };

      // Add deal to target stage
      newStages[toStageIndex] = {
        ...newStages[toStageIndex],
        deals: [...newStages[toStageIndex].deals, updatedDeal],
        value: newStages[toStageIndex].value + dealToMove!.value,
      };

      return newStages;
    });

    toast({
      title: "Deal moved",
      description: `${dealToMove.title} moved to ${toStage.name}`,
    });

    setActiveId(null);
  };

  const totalValue = stages.reduce((sum, stage) => sum + stage.value, 0);
  const weightedValue = stages.reduce(
    (sum, stage) => sum + stage.value * (stage.probability / 100),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
            <p className="text-gray-600 mt-1">Manage your deals through the sales process</p>
          </div>
          <button
            onClick={() => {
              setShowAddDeal(true);
              setSelectedStage(stages[0]?.id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Total Pipeline</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${(totalValue / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Weighted Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${(weightedValue / 1000).toFixed(0)}k
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">68%</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Avg. Deal Time</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">21 days</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            <SortableContext
              items={stages.map(s => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              {stages.map((stage) => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  onAddDeal={() => {
                    setShowAddDeal(true);
                    setSelectedStage(stage.id);
                  }}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="bg-white rounded-lg border-2 border-blue-500 shadow-xl p-4 opacity-90">
                <p className="font-medium">Moving deal...</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}