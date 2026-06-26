import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import * as React from "react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import InputError from "@/components/input-error"

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  error?: string
  className?: string
}

export function DateRangePicker({ value, onChange, error, className }: DateRangePickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value?.from}
            className={cn(
              "w-full justify-start text-left font-normal",
              "data-[empty=true]:text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <span>
                  {format(value.from, "MMM d, yyyy")} — {format(value.to, "MMM d, yyyy")}
                </span>
              ) : (
                <span>{format(value.from, "MMM d, yyyy")}</span>
              )
            ) : (
              <span>Select check-in & check-out dates</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            fromDate={new Date()}
          />
        </PopoverContent>
      </Popover>
      {error && <InputError message={error} />}
    </div>
  )
}
