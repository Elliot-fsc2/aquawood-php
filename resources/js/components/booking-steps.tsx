import { Check, BedDouble, CalendarDays, ClipboardCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BookingStep = 'category' | 'dates' | 'confirm';

const steps: { key: BookingStep; label: string; icon: typeof BedDouble }[] = [
    { key: 'category', label: 'Category', icon: BedDouble },
    { key: 'dates', label: 'Dates', icon: CalendarDays },
    { key: 'confirm', label: 'Confirm', icon: ClipboardCheck },
];

interface Props {
    currentStep: BookingStep;
    /** Which steps are completed (only relevant for steps before current) */
    categorySelected?: boolean;
    datesSelected?: boolean;
}

export default function BookingSteps({ currentStep, categorySelected, datesSelected }: Props) {
    const isCompleted = (step: BookingStep): boolean => {
        if (step === 'category') return categorySelected || currentStep !== 'category';
        if (step === 'dates') return datesSelected || currentStep === 'confirm';
        return false;
    };

    const isActive = (step: BookingStep): boolean => step === currentStep;

    const currentIndex = steps.findIndex((s) => s.key === currentStep);

    return (
        <div className="w-full">
            <div className="flex items-center justify-center gap-0">
                {steps.map((step, index) => {
                    const completed = isCompleted(step.key);
                    const active = isActive(step.key);
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex items-center">
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center gap-1.5">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                                        completed &&
                                            'border-accent-foreground bg-accent-foreground text-accent',
                                        active &&
                                            !completed &&
                                            'border-primary bg-primary text-primary-foreground shadow-md',
                                        !active &&
                                            !completed &&
                                            'border-muted-foreground/25 bg-muted text-muted-foreground/50',
                                    )}
                                >
                                    {completed ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <Icon className="h-5 w-5" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        'text-xs font-medium transition-colors',
                                        active && 'text-primary',
                                        completed && 'text-accent-foreground',
                                        !active && !completed && 'text-muted-foreground/50',
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line between steps */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'mx-2 h-0.5 w-12 sm:w-20 md:w-32 rounded-full transition-colors',
                                        index < currentIndex || completed
                                            ? 'bg-accent-foreground/60'
                                            : 'bg-muted-foreground/20',
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
