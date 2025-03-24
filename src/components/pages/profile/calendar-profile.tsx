"use client";

import { useState, useRef, useEffect, TouchEventHandler } from "react";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    CalendarIcon,
    CalendarPlus2Icon as CalendarIcon2,
    Clock,
    List,
} from "lucide-react";
import { motion, AnimatePresence} from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";
import {getExamsForUser} from "@/actions/take-exam.action";


// Ajoutez ces définitions de variants au début de votre composant Calendar
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

// Sample data for months
const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
];

// Time slots for day view
const timeSlots = Array.from({ length: 24 }, (_, i) => `${i }:00`);

export function Calendar({ viewMode }: { viewMode: string }) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Mois actuel
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Année actuelle
    const [currentDay, setCurrentDay] = useState(new Date().getDate()); // Jour actuel
    const [calendarView, setCalendarView] = useState("month"); // "day", "month" ou "year"
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const calendarRef = useRef(null);
    const dayViewRef = useRef(null);
    const isMobile = useIsMobile();

    const [exams, setExams] = useState([]); // État pour stocker les examens
    const [loading, setLoading] = useState(true); // État de chargement
    const [error, setError] = useState(null); // État d'erreur

    const isTeacher = viewMode === "teacher";

    // Récupérer les examens depuis le serveur
    useEffect(() => {
        const fetchExams = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getExamsForUser();
                if (result.success) {
                    setExams(result.data);
                } else {
                    setError(result.error || "Failed to fetch exams"); 
                }
            } catch  {
                setError("Failed to fetch exams");
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, []);

    // Formater les examens pour le calendrier
    const formattedExams = exams.map((exam: any) => ({
        id: exam.id,
        date: exam.startDate.toISOString().split("T")[0], // Format YYYY-MM-DD
        title: exam.title,
        type: exam.type.toLowerCase(), // Assurez-vous que cela correspond à vos types d'assignation
        time: exam.startDate.toTimeString().split(" ")[0].substring(0, 5), // Format HH:MM
        duration: Math.floor((exam.endDate - exam.startDate) / (1000 * 60)), // Durée en minutes
    }));

    // Get current date for highlighting today
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const currentDate = today.getDate();

    // Generate days for the calendar grid
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Convert to Monday-based (0 = Monday, 6 = Sunday)
    };

    const days = Array.from({ length: getDaysInMonth(currentMonth, currentYear) }, (_, i) => i + 1);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

    // Get assignments for a specific day
    const getAssignmentsForDay = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return formattedExams.filter((exam) => exam.date === dateStr);
    };

    // Get assignments for current day in day view
    const getDayViewAssignments = () => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(currentDay).padStart(2, "0")}`;
        return formattedExams
            .filter((exam) => exam.date === dateStr)
            .sort((a, b) => {
                const timeA = a.time.split(":").map(Number);
                const timeB = b.time.split(":").map(Number);
                return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
            });
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToPreviousDay = () => {
        if (currentDay === 1) {
            // Go to previous month
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);

            setCurrentDay(daysInPrevMonth);
            setCurrentMonth(prevMonth);
            setCurrentYear(prevYear);
        } else {
            setCurrentDay(currentDay - 1);
        }
    };

    const goToNextDay = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);

        if (currentDay === daysInMonth) {
            // Go to next month
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

            setCurrentDay(1);
            setCurrentMonth(nextMonth);
            setCurrentYear(nextYear);
        } else {
            setCurrentDay(currentDay + 1);
        }
    };

    // Format the current date for day view
    const formatCurrentDate = () => {
        const date = new Date(currentYear, currentMonth, currentDay);
        return format(date, "EEEE d MMMM yyyy", { locale: fr });
    };

    // Handle swipe gestures for mobile
    const handleTouchStart = (e: TouchEvent) => {
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left - go to next
                if (calendarView === "day") {
                    goToNextDay();
                } else {
                    goToNextMonth();
                }
            } else {
                // Swipe right - go to previous
                if (calendarView === "day") {
                    goToPreviousDay();
                } else {
                    goToPreviousMonth();
                }
            }
            setIsDragging(false);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Get color for assignment type
    const getAssignmentColor = (type: string) => {
        switch (type.toUpperCase()) {
            case "QCM":
                return { bg: "bg-[#7ee787]/20", text: "text-[#7ee787]", border: "border-[#7ee787]/30" };
            case "CODE":
                return { bg: "bg-[#d2a8ff]/20", text: "text-[#d2a8ff]", border: "border-[#d2a8ff]/30" };
            case "DOCUMENT":
                return { bg: "bg-[#79c0ff]/20", text: "text-[#79c0ff]", border: "border-[#79c0ff]/30" };
            default:
                return { bg: "bg-[#8b949e]/20", text: "text-[#8b949e]", border: "border-[#8b949e]/30" };
        }
    };

    // Go to today
    const goToToday = () => {
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth());
        setCurrentDay(now.getDate());
    };

    // Scroll to current time in day view
    useEffect(() => {
        if (calendarView === "day" && dayViewRef.current) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            
            // Calculer la position en pourcentage (0-100%)
            const timePercentage = (currentHour + currentMinute / 60) / 24 * 100;
            
            setScrollPosition(timePercentage);
        }
    }, [calendarView]);


    // Ajoutez ces fonctions avant le return
    const getTimePosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return ((hours - 8) + minutes / 60) * (100 / 12);
    };

    const getDurationHeight = (durationMinutes: number) => {
        return (durationMinutes / 60) * (100 / 12);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <motion.div
            className="bg-[#161b22] rounded-lg overflow-hidden border border-[#30363d] relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            ref={calendarRef}
            onTouchStart={handleTouchStart as unknown as TouchEventHandler<HTMLDivElement>}
            onTouchMove={handleTouchMove as unknown as TouchEventHandler<HTMLDivElement>}
            onTouchEnd={handleTouchEnd}
            layoutId="calendar"
        >
            <div className="p-4 border-b border-[#30363d]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                        {calendarView === "day" ? (
                            <h2 className="text-xl font-bold text-white capitalize">{formatCurrentDate()}</h2>
                        ) : calendarView === "month" ? (
                            <h2 className="text-xl font-bold text-white">
                                {months[currentMonth]} {currentYear}
                            </h2>
                        ) : (
                            <h2 className="text-xl font-bold text-white">{currentYear}</h2>
                        )}

                        <div className="flex">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#8b949e] hover:bg-[#30363d] transition-colors duration-200"
                                onClick={calendarView === "day" ? goToPreviousDay : goToPreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-[#8b949e] hover:bg-[#30363d] transition-colors duration-200"
                                onClick={calendarView === "day" ? goToNextDay : goToNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <div className="flex bg-[#0d1117] rounded-md overflow-hidden">
                            <Button
                                variant={calendarView === "day" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setCalendarView("day")}
                                className={`text-[#c9d1d9] hover:bg-[#30363d] transition-colors duration-200 ${
                                    calendarView === "day" ? (isTeacher ? "bg-[#238636]" : "bg-[#58a6ff]") : ""
                                }`}
                            >
                                <List className="h-4 w-4 mr-1" />
                                Jour
                            </Button>
                            <Button
                                variant={calendarView === "month" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setCalendarView("month")}
                                className={`text-[#c9d1d9] hover:bg-[#30363d] transition-colors duration-200 ${
                                    calendarView === "month" ? (isTeacher ? "bg-[#238636]" : "bg-[#58a6ff]") : ""
                                }`}
                            >
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Mois
                            </Button>
                            <Button
                                variant={calendarView === "year" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setCalendarView("year")}
                                className={`text-[#c9d1d9] hover:bg-[#30363d] transition-colors duration-200 ${
                                    calendarView === "year" ? (isTeacher ? "bg-[#238636]" : "bg-[#58a6ff]") : ""
                                }`}
                            >
                                <CalendarIcon2 className="h-4 w-4 mr-1" />
                                Année
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            className="text-[#c9d1d9] bg-zinc-900 border-[#30363d] hover:bg-[#30363d] transition-colors duration-200 "
                            onClick={goToToday}
                        >
                            <Clock className="h-4 w-4 mr-1" />
                            Aujourd&apos;hui
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {calendarView === "day" && (
                    <motion.div
                        key="day-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 overflow-hidden"
                        ref={dayViewRef}
                        style={{ maxHeight: "600px", overflowY: "auto" }}
                    >
                        <div className="flex gap-4 min-h-[600px]">
                            {/* Time slots */}
                            <div className="w-16 sm:w-20 flex flex-col flex-shrink-0">
                                {timeSlots.map((time, index) => (
                                    <div key={index} className="flex-1 text-right pr-2 text-xs text-[#8b949e] relative">
                                        <span className="absolute top-0 right-0 -translate-y-1/2">{time}</span>
                                        <div className="h-px w-full bg-[#30363d]/50 absolute top-0 right-0"></div>
                                    </div>
                                ))}
                            </div>

                            {/* Day timeline */}
                            <div className="flex-1 relative border-l border-[#30363d]">
                                {/* Time slot lines */}
                                {timeSlots.map((time, index) => (
                                    <div
                                        key={index}
                                        className="absolute w-full h-px bg-[#30363d]/30"
                                        style={{ top: `${(index / timeSlots.length) * 100}%` }}
                                    ></div>
                                ))}

                                {/* Current time indicator */}
                                <motion.div
                                    className="absolute w-full h-px bg-[#f85149] z-10"
                                    style={{ 
                                        top: `${(new Date().getHours() + new Date().getMinutes() / 60) / 24 * 100}%`, 
                                        left: 0 
                                    }}
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#f85149]"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 }}
                                    />
                                </motion.div>

                                {/* Assignments */}
                                {getDayViewAssignments().map((assignment, index) => {
                                    const colors = getAssignmentColor(assignment.type);
                                    const topPosition = getTimePosition(assignment.time);
                                    const height = getDurationHeight(assignment.duration);

                                    return (
                                        <motion.div
                                            key={assignment.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                            className={`absolute left-2 right-2 rounded-md border ${colors.border} ${colors.bg} p-2 overflow-hidden`}
                                            style={{
                                                top: `${topPosition}%`,
                                                height: `${height}%`,
                                                minHeight: "40px",
                                            }}
                                            whileHover={{ scale: 1.02, zIndex: 10 }}
                                        >
                                            <div className="flex flex-col h-full">
                                                <h4 className={`font-medium ${colors.text} text-sm`}>{assignment.title}</h4>
                                                <div className="flex items-center mt-1">
                                                    <Clock className="h-3 w-3 mr-1 text-[#8b949e]" />
                                                    <span className="text-xs text-[#8b949e]">
                            {assignment.time} ({assignment.duration} min)
                          </span>
                                                </div>
                                                <p className="text-xs text-[#8b949e] mt-auto">
                                                    {assignment.type === "exam"
                                                        ? "Examen"
                                                        : assignment.type === "project"
                                                            ? "Projet"
                                                            : assignment.type === "review"
                                                                ? "Révision"
                                                                : assignment.type === "lab"
                                                                    ? "TP"
                                                                    : "Devoir"}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {calendarView === "month" && (
                    <motion.div
                        key="month-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                    >
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, i) => (
                                <div key={i} className="text-center text-sm font-medium text-[#8b949e] py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <motion.div
                            className="grid grid-cols-7 gap-1"
                            variants={containerVariants} 
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Empty cells for days before the first day of the month */}
                            {Array.from({ length: firstDay }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-16 sm:min-h-24 p-1"></div>
                            ))}

                            {days.map((day) => {
                                const dayAssignments = getAssignmentsForDay(day);
                                const isToday = isCurrentMonth && day === currentDate;
                                const isSelected = day === currentDay && calendarView === "month";
                                const isWeekend = (day + firstDay - 1) % 7 === 5 || (day + firstDay - 1) % 7 === 6;

                                return (
                                    <motion.div
                                        key={day}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02, zIndex: 10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        onClick={() => {
                                            setCurrentDay(day);
                                            setCalendarView("day");
                                        }}
                                    >
                                        <div
                                            className={`min-h-16 sm:min-h-24 p-1 border border-[#30363d] rounded-md ${
                                                isToday
                                                    ? "bg-[#388bfd]/10 border-[#388bfd]/30"
                                                    : isSelected
                                                        ? isTeacher
                                                            ? "bg-[#238636]/10 border-[#238636]/30"
                                                            : "bg-[#58a6ff]/10 border-[#58a6ff]/30"
                                                        : isWeekend
                                                            ? "bg-[#161b22]/80"
                                                            : "bg-[#0d1117]"
                                            } hover:bg-[#30363d]/30 transition-colors duration-200 cursor-pointer`}
                                        >
                                            <div
                                                className={`text-sm font-medium p-1 ${
                                                    isToday
                                                        ? "text-[#58a6ff]"
                                                        : isSelected
                                                            ? isTeacher
                                                                ? "text-[#7ee787]"
                                                                : "text-[#79c0ff]"
                                                            : "text-[#c9d1d9]"
                                                }`}
                                            >
                                                {day}
                                            </div>
                                            <div className="space-y-1 overflow-hidden">
                                                {dayAssignments.slice(0, isMobile ? 1 : 3).map((assignment) => {
                                                    const colors = getAssignmentColor(assignment.type);

                                                    return (
                                                        <div
                                                            key={assignment.id}
                                                            className={`text-xs p-1 rounded ${colors.bg} ${colors.text} hover:bg-opacity-30 cursor-pointer truncate transition-colors duration-200 border-l-2 ${colors.border}`}
                                                        >
                                                            {assignment.time} - {assignment.title}
                                                        </div>
                                                    );
                                                })}

                                                {dayAssignments.length > (isMobile ? 1 : 3) && (
                                                    <div className="text-xs p-1 text-[#8b949e] text-center">
                                                        +{dayAssignments.length - (isMobile ? 1 : 3)} autres
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}

                {calendarView === "year" && (
                    <motion.div
                        key="year-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {months.map((month, index) => (
                                <motion.div
                                    key={month}
                                    whileHover={{ scale: 1.03, zIndex: 10 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    onClick={() => {
                                        setCurrentMonth(index);
                                        setCalendarView("month");
                                    }}
                                    className={`p-4 border border-[#30363d] rounded-md ${
                                        index === currentMonth
                                            ? isTeacher
                                                ? "bg-[#238636]/10 border-[#238636]/30"
                                                : "bg-[#58a6ff]/10 border-[#58a6ff]/30"
                                            : "bg-[#0d1117]"
                                    } hover:bg-[#30363d]/30 transition-colors duration-200 cursor-pointer`}
                                >
                                    <h3
                                        className={`text-center font-medium ${
                                            index === currentMonth ? (isTeacher ? "text-[#7ee787]" : "text-[#79c0ff]") : "text-[#c9d1d9]"
                                        }`}
                                    >
                                        {month}
                                    </h3>

                                    <div className="mt-2 grid grid-cols-7 gap-1">
                                        {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                                            <div key={i} className="text-center text-[10px] text-[#8b949e]">
                                                {day}
                                            </div>
                                        ))}

                                        {/* Simplified mini-calendar for each month */}
                                        {Array.from({ length: 35 }).map((_, i) => {
                                            const dayNum = i - getFirstDayOfMonth(index, currentYear) + 1;
                                            const isValidDay = dayNum > 0 && dayNum <= getDaysInMonth(index, currentYear);
                                            const dateStr = isValidDay
                                                ? `${currentYear}-${String(index + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                                                : "";
                                            const hasAssignments = isValidDay && formattedExams.some((a) => a.date === dateStr);
                                            const isToday =
                                                isValidDay &&
                                                index === today.getMonth() &&
                                                dayNum === today.getDate() &&
                                                currentYear === today.getFullYear();

                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-full aspect-square rounded-sm flex items-center justify-center ${
                                                        isValidDay ? "text-[10px] text-[#8b949e]" : ""
                                                    } ${isToday ? "bg-[#388bfd]/30 text-[#58a6ff]" : ""} ${
                                                        hasAssignments ? (isTeacher ? "bg-[#238636]/20" : "bg-[#58a6ff]/20") : ""
                                                    }`}
                                                >
                                                    {isValidDay ? dayNum : ""}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="p-4 border-t border-[#30363d]">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#7ee787]/50"></div>
                        <span className="text-xs text-[#8b949e]">QCM</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#d2a8ff]/50"></div>
                        <span className="text-xs text-[#8b949e]">Code</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#79c0ff]/50"></div>
                        <span className="text-xs text-[#8b949e]">Document</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm bg-[#388bfd]/50"></div>
                        <span className="text-xs  text-[#8b949e]">Aujourd&apos;hui</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}