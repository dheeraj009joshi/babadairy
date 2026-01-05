import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    iconBgColor?: string;
    iconColor?: string;
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    iconBgColor = 'bg-primary/10',
    iconColor = 'text-primary',
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-chocolate/70 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-chocolate">{value}</h3>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-success' : 'text-error'}`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%{' '}
                            <span className="text-chocolate/60">vs last month</span>
                        </p>
                    )}
                </div>
                <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    );
}
