import React from 'react';

interface CountdownProps {
    targetDate: string;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
    return (
        <div className="text-center p-4">
            <h3 className="text-xl font-bold">Together Since {targetDate}</h3>
        </div>
    );
};
